const config = {
    debug: false,
};

export async function loadConfig() {
    if (process.env.DEBUG) config.debug = process.env.DEBUG;
    if (process.env.POSTGRES_URL) config.postgresUrl = process.env.POSTGRES_URL;
    if (process.env.AUTH_MODULES) {
        config.authModules = {};
        const authModules = process.env.AUTH_MODULES.split(',').map(a => a.trim());
        for (const type of authModules) {
            const authModulePath = `../modules/auth/${type}.js`;
            const { getModuleConfig } = await import(authModulePath);    
            config.authModules[type] = getModuleConfig();
        }   
    }
    if (process.env.APP_MODULES) {
        config.appModules = {};
        const appModules = process.env.APP_MODULES.split(',').map(a => a.trim());
        for (const type of appModules) {
            const appModulePath = `../modules/app/${type}.js`;
            const { getModuleConfig } = await import(appModulePath);    
            config.appModules[type] = getModuleConfig();
        }   
    }
}

export function getConfig() {
    return config;
}
