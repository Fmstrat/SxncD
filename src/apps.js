import { getConfig } from "./common/config.js";
import { getPool } from "./db/index.js";

export async function loadApps() {
    const config = getConfig();
    const client = await getPool();
    for (const type in config.appModules) {
        await client.query(`
            INSERT INTO public.app (
                type
            ) VALUES (
                $1
            ) ON CONFLICT DO NOTHING;
        `, [
            type,
        ]);
    }
}
