'use strict';

const defaultConfig = {
    apiPath: '/subs',
	apiPort: 9999,
	logLocation: '/tmp/submariner.log',
};

const config = {};
for (const key in defaultConfig) {
    const envKey = `SUBMARINER_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`;
    if (process.env.hasOwnProperty(envKey)) {
        config[key] = process.env[envKey];
    } else {
        config[key] = defaultConfig[key];
    }
}


module.exports = config;
