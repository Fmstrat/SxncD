import fs from "fs";
import path from "path";
import pkg from "pg";
const { Pool } = pkg;

import { sleep } from "../common/sleep.js";
import { getConfig } from "../common/config.js";

let pool;

export async function init() {
    const config = getConfig();
    let ready = false;
    let client;
    while (!ready) {
        try {
            pool = new Pool({
                connectionString: config.postgresUrl,
            });
            client = await pool.connect();
            const res = await client.query(`SELECT 1`);
            if (res.rows.length < 1) {
                throw new Error("");
            }
            ready = true;
            // eslint-disable-next-line no-unused-vars
        } catch (e) {
            console.log("DB not ready, waiting...");
            await sleep(1000);
        }
    }
    client.release();
}

export async function getPool() {
    return await pool.connect();
}

export async function close() {
    console.log(`Closing DB`);
    await pool.end();
}

export async function migrate() {
    console.log(`Starting migration`);
    const client = await pool.connect();
    try {
        const migrationExists = await client.query(`
            SELECT
            CASE
                WHEN (SELECT COUNT(1) FROM information_schema.tables WHERE table_schema = 'system' AND table_name = 'migrate') > 0
                THEN TRUE
                ELSE FALSE
            END AS exists
        `);
        if (!migrationExists.rows[0].exists) {
            await client.query(`
                DROP SCHEMA IF EXISTS system CASCADE;
                CREATE SCHEMA system;
            
                -- Migrations
                DROP TABLE IF EXISTS system.migrate CASCADE;
                CREATE TABLE system.migrate (
                    id                  TEXT NOT NULL,
                    status              TEXT NOT NULL,
                    created_ts          TIMESTAMPTZ DEFAULT NOW()
                );
                CREATE INDEX idx__system__migrate__id ON system.migrate (id);
                CREATE INDEX idx__system__migrate__status ON system.migrate (status);
                CREATE INDEX idx__system__migrate__created_ts ON system.migrate (created_ts);
            `);
        }
        let lastMigration = "0";
        const lastMigrationResult = await client.query(`
            SELECT id
            FROM system.migrate
            ORDER BY id DESC
            LIMIT 1;
        `);
        if (lastMigrationResult.rows.length > 0 && lastMigrationResult.rows[0].id) {
            lastMigration = lastMigrationResult.rows[0].id;
        }
        const files = fs.readdirSync("./db/migrations", {
            withFileTypes: true,
        });
        for await (const file of files) {
            const migrationId = file.name.slice(0, 6);
            if (migrationId > lastMigration) {
                const label = file.name.slice(7, file.name.length - 4);
                console.log(`Running migration ${label} (${migrationId})`);
                const sqlStr = fs.readFileSync(path.join("./db/migrations", file.name), "utf8");
                try {
                    await client.query("BEGIN");
                    await client.query(sqlStr);
                    await client.query(
                        `
                        INSERT INTO system.migrate (
                            id,
                            status
                        ) VALUES (
                            $1,
                            'complete'
                        );
                    `,
                        [migrationId],
                    );
                    await client.query("COMMIT");
                } catch (e) {
                    console.error(e);
                    await client.query("ROLLBACK");
                    throw new Error("migration error");
                }
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.release();
    }
    console.log(`Ending migration`);
}
