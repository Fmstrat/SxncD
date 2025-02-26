import { getPool } from "../db/index.js";
import { getNewKey, getUser } from "./auth.js";

export async function refresh(req, res) {
    try {

        const client = await getPool();
        const apiKey = getNewKey(req.user);
        await client.query(`
            UPDATE public.auth SET
                api_key = $1
            WHERE user_id = $2
            AND app_id = (
                SELECT id FROM public.app WHERE type = $3
            );
        `, [
            apiKey,
            req.user.id,
            req.query.app,
        ]);
        const user = await getUser(client, req.user.issuer, req.user.identifier);
        req.session.passport.user = user;
    } catch (e) {
        console.error(e);
    } finally {
        res.redirect('/dashboard');
    }
}
