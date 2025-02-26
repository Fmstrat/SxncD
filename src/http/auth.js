import { getConfig } from "../common/config.js";
import { getPool } from "../db/index.js";
import crypto from 'crypto';

export function getNewKey(user) {
    const seed = `${user.issuer}:${user.identifier}:${user.id}:${crypto.randomBytes(16).toString('hex')}`;
    const hash = crypto.createHash('sha256').update(seed).digest();
    const apiKey = hash.toString('hex');
    return apiKey;
}

async function createApiKeys(client, user) {
    const config = getConfig();
    for (const type in config.appModules) {
        const apiKey = getNewKey(user);
        await client.query(`
            INSERT INTO public.auth (
                user_id,
                app_id,
                api_key
            ) VALUES (
                $1,
                (SELECT id FROM public.app WHERE type = $2),
                $3
            ) ON CONFLICT DO NOTHING;
        `, [
            user.id,
            type,
            apiKey,
        ]);
    }
}

async function checkIfUserExists(client, issuer, identifier) {
    return await client.query(`
        SELECT
            u.id,
            u.photo,
            u.username
        FROM public.user u
        WHERE u.identifier = $1
        AND u.issuer = $2
    `,
    [
        identifier,
        issuer,
    ]);
}

export async function getUser(client, issuer, identifier) {
    const res = await client.query(`
        SELECT
            u.id,
            u.username,
            u.photo,
            u.issuer,
            u.identifier,
            json_agg(
                jsonb_build_object(
                    'id', a.id,
                    'type', a.type,
                    'apiKey', au.api_key,
                    'devices', (
                        SELECT
                            json_agg(
                                jsonb_build_object(
                                    'id', ad.device_id,
                                    'identifier', d.identifier
                                )
                            )
                        FROM public.app_device ad
                        INNER JOIN public.device d ON d.user_id = u.id AND ad.device_id = d.id
                        WHERE ad.app_id = a.id
                    )
                )
            ) AS apps
        FROM public.user u
        INNER JOIN public.auth au ON u.id = au.user_id
        INNER JOIN public.app a ON au.app_id = a.id
        WHERE u.identifier = $1
        AND u.issuer = $2
        GROUP BY
            u.id,
            u.username,
            u.photo,
            u.issuer,
            u.identifier
    `,
        [
            identifier,
            issuer,
        ]);
    if (res.rowCount > 0) {
        const user = res.rows[0];
        return user;
    }
    return null;
}

export async function checkUser(issuer, identifier, username, photo) {
    const client = await getPool();
    let userExists = await checkIfUserExists(client, issuer, identifier);
    if (userExists.rowCount === 0) {
        const res = await client.query(`
            INSERT INTO public.user (
                username,
                issuer,
                identifier,
                photo
            ) VALUES (
                $1,
                $2,
                $3,
                $4
            ) RETURNING id;
        `, [
            username,
            issuer,
            identifier,
            photo,
        ]);
        if (res.rowCount === 0) {
            return null;
        }
        await createApiKeys(client, res.rows[0]);
    } else {
        if (photo !== userExists.rows[0].photo || username != userExists.rows[0].username) {
            await client.query(`
                UPDATE public.user SET
                    photo = $1,
                    username = $2,
                    updated_ts = NOW()
                WHERE id = $3
            `, [
                userExists.rows[0].photo,
                userExists.rows[0].username,
                userExists.rows[0].id,
            ]);
        }
        await createApiKeys(client, userExists.rows[0]);
    }
    const user = await getUser(client, issuer, identifier);
    return user;
}

export async function initModules(app, passport) {
    const config = getConfig();
    for (const authModule of Object.keys(config.authModules)) {
        const authModulePath = `../modules/auth/${authModule}.js`;
        const { initModule } = await import(authModulePath);
        await initModule(app, passport);
    }
}