import { getConfig } from "../../../../common/config.js";
import { getPool } from "../../../../db/index.js";

export async function update(req, res) {
    console.log('hit');
    let response = {
        success: false,
        error: "Unknown error",
    };
    const config = getConfig();
    try {
        const apiKey = req.headers.authorization;
        if (!apiKey) {
            throw new Error("API key is required");
        }
        const settingsInput = req.body?.settings;
        if (!settingsInput) {
            throw new Error("Settings are required");
        }
        let settings;
        let settingsType = typeof settingsInput;
        if (settingsType === 'object') {
            settings = JSON.stringify(settingsInput);
        } else if (settingsType === 'string') {
            settings = settingsInput;
        } else {
            throw new Error("Invalid settings format");
        }
        const deviceName = req.body?.deviceName;
        if (!deviceName) {
            throw new Error("Device name is required");
        }
        const savedTsStr = req.body?.savedTs;
        if (!savedTsStr) {
            throw new Error("Saved timestamp is required");
        }
        const savedTs = new Date(savedTsStr);
        const client = await getPool();
        const validRes = await client.query(`
            SELECT
                a.id as auth_id,
                a.user_id,
                a.app_id,
                a.last_sync_ts
            FROM public.auth a
            WHERE a.api_key = $1
        `, [
            apiKey,
        ]);
        if (validRes.rowCount === 0) {
            if (config.debug) console.log({apiKey});
            throw new Error("API key is invalid");
        }
        const valid = validRes.rows[0];
        if (config.debug) console.log({ valid });
        let existingRes = await client.query(`
            SELECT
                s.id as settings_id,
                s.data,
                d.id as device_id,
                s.last_sync_ts
            FROM public.settings s
            INNER JOIN public.user u ON u.id = s.user_id
            INNER JOIN public.device d ON d.user_id = u.id AND d.identifier = $1
            INNER JOIN public.app_device ad ON ad.device_id = d.id AND ad.app_id = s.app_id
            AND s.user_id = $2
            AND s.app_id = $3
        `, [
            deviceName,
            valid.user_id,
            valid.app_id
        ]);
        if (existingRes.rowCount === 0) {
            const deviceRes = await client.query(`
                INSERT INTO public.device (
                    user_id,
                    identifier,
                    last_sync_ts
                ) VALUES (
                    $1,
                    $2,
                    $3
                ) ON CONFLICT (user_id, identifier) DO UPDATE SET
                    last_sync_ts = $3
                RETURNING id
            `, [
                valid.user_id,
                deviceName,
                savedTs,
            ]);
            if (deviceRes.rowCount > 0) {
                const device = deviceRes.rows[0];
                if (config.debug) console.log({ device });
                const appDeviceRes = await client.query(`
                    INSERT INTO public.app_device (
                        app_id,
                        device_id,
                        last_sync_ts
                    ) VALUES (
                        $1,
                        $2,
                        $3
                    ) ON CONFLICT (app_id, device_id) DO UPDATE SET
                        last_sync_ts = $3
                    RETURNING id
                `, [
                    valid.user_id,
                    device.id,
                    savedTs,
                ]);
                existingRes = await client.query(`
                    SELECT
                        s.id as settings_id,
                        s.data,
                        d.id as device_id,
                        s.last_sync_ts
                    FROM public.settings s
                    INNER JOIN public.user u ON u.id = s.user_id
                    INNER JOIN public.device d ON d.user_id = u.id AND d.identifier = $1
                    INNER JOIN public.app_device ad ON ad.device_id = d.id AND ad.app_id = s.app_id
                    AND s.user_id = $2
                    AND s.app_id = $3
                `, [
                    deviceName,
                    valid.user_id,
                    valid.app_id
                ]);
                if (existingRes.rowCount === 0) {
                    const settingsRes = await client.query(`
                        INSERT INTO public.settings (
                            user_id,
                            app_id,
                            data,
                            last_sync_device_id,
                            last_sync_ts
                        ) VALUES (
                            $1,
                            $2,
                            $3,
                            $4,
                            $5
                        ) ON CONFLICT DO NOTHING
                    `, [
                        valid.user_id,
                        valid.app_id,
                        settings,
                        device.id,
                        savedTs,
                    ]);
                    if (settingsType === 'object') {
                        response.data = settingsInput;
                    } else {
                        response.data = settings;
                    }
                    response.action = 'created';
                } else {
                    const existing = existingRes.rows[0];
                    if (config.debug) console.log({ existingNewDevice: { ...existing, data: '<redacted>' }});
                    if (settingsType === 'object') {
                        response.data = JSON.parse(existing.data);
                    } else {
                        response.data = existing.data;
                    }
                    response.action = 'existingNewer';
                }
            }
        } else {
            const existing = existingRes.rows[0];
            if (config.debug) console.log({ existing: { ...existing, data: '<redacted>' }});
            if (savedTs > existing.last_sync_ts) {
                await client.query(`
                    UPDATE public.settings SET
                        data = $1,
                        last_sync_ts = $2,
                        last_sync_device_id = $3,
                        updated_ts = NOW()
                    WHERE id = $4
                `, [
                    settings,
                    savedTs,
                    existing.device_id,
                    existing.settings_id,
                ]);
                await client.query(`
                    UPDATE public.device SET
                        last_sync_ts = $1,
                        updated_ts = NOW()
                    WHERE id = $2;
                `, [
                    savedTs,
                    existing.device_id,
                ]);
                await client.query(`
                    UPDATE public.app_device SET
                        last_sync_ts = $1,
                        updated_ts = NOW()
                    WHERE id = $2;
                `, [
                    savedTs,
                    existing.app_device_id,
                ]);
                await client.query(`
                    UPDATE public.auth SET
                        last_sync_ts = $1,
                        updated_ts = NOW()
                    WHERE id = $2;
                `, [
                    savedTs,
                    valid.auth_id,
                ])
                if (settingsType === 'object') {
                    response.data = settingsInput;
                } else {
                    response.data = settings;
                }
                response.action = 'incomingNewer';
            } else {
                if (settingsType === 'object') {
                    response.data = JSON.parse(existing.data);
                } else {
                    response.data = existing.data;
                }
                if (savedTs.toISOString() === existing.last_sync_ts.toISOString()) {
                    response.action = 'none';
                } else {
                    response.action = 'existingNewer';
                }
            }
        }
        response.success = true;
        delete response.error;
    } catch (e) {
        if (config.debug)
            console.error(e);
        response.error = e.message;
    } finally {
        if (config.debug) console.log({response: { ...response, data: '<redacted>'}})
        res.status(response.error ? 400 : 200).json(response);
    }
}
