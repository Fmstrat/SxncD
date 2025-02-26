import express from "express";
import { init, close, migrate } from "./db/index.js";
import { loadConfig } from "./common/config.js";
import { loadApps } from "./apps.js";
import { initHTTP } from "./http/index.js";

const app = express();
app.set("env", "development");
app.use(express.static("./public"));

async function main() {
    await loadConfig();
    await init();
    await migrate();
    await loadApps();
    await initHTTP(app);
    const server = await app.listen(9693, () => {
        console.log(`Listening on 0.0.0.0:9693`);
    });
    server.on("beforeExit", close);
}

main();
