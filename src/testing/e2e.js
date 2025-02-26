import axios from 'axios';
import pkg from "pg";
const { Pool } = pkg;

const apiKey = '730bd41d5dfd283d0f8679556710a4cca578b6e448b3a2940376c3f97e3c40ca';
const url = 'http://localhost:9693';
const postgresUrl = 'postgresql://sxncd:password@127.0.0.1:9632/sxncd';
let res;
let pool;
let client;
let data;
let options = {
    headers: {
        'Authorization': apiKey,
    },
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    try {

        // Clear DB
        pool = new Pool({
            connectionString: postgresUrl,
        });
        client = await pool.connect();
        res = await client.query(`DELETE FROM public.settings CASCADE;`);
        res = await client.query(`DELETE FROM public.app_device CASCADE;`);
        res = await client.query(`DELETE FROM public.device CASCADE;`);

        console.log(`\nMake initial settings config for Device 1`);
        data = {
            'deviceName': 'Device 1',
            'savedTs': (new Date()).toISOString(),
            'settings': '{ "one": 1 }',
        }
        res = (await axios.post(
            `${url}/api/v1/sync/update`,
            data,
            options,
        )).data;
        console.log({ data, res });

        await sleep(1000);

        console.log(`\nMake initial settings config for Device 2`);
        data = {
            'deviceName': 'Device 2',
            'savedTs': (new Date()).toISOString(),
            'settings': '{ "two": 2 }',
        }
        res = (await axios.post(
            `${url}/api/v1/sync/update`,
            data,
            options,
        )).data;
        console.log({ data, res });

        await sleep(1000);
        const beforeDate = (new Date()).toISOString()

        console.log(`\nUpdate Device 2`);
        data = {
            'deviceName': 'Device 2',
            'savedTs': (new Date()).toISOString(),
            'settings': '{ "two": 2 }',
        }
        res = (await axios.post(
            `${url}/api/v1/sync/update`,
            data,
            options,
        )).data;
        console.log({ data, res });

        await sleep(1000);

        console.log(`\nUpdate Device 1 older`);
        data = {
            'deviceName': 'Device 1',
            'savedTs': beforeDate,
            'settings': '{ "one": 1 }',
        }
        res = (await axios.post(
            `${url}/api/v1/sync/update`,
            data,
            options,
        )).data;
        console.log({ data, res });

    } catch (e) {
        console.error(e);
    } finally {
        client.release();
        pool.end();
    }
}

main();