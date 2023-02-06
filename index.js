const core = require('@actions/core');
const path = require("path");
const fs = require('fs');
const config = require("@aura-backend-kit/config");

const configDir = path.resolve("config");
const excludeFiles = ["index.js", "schema.js"];


function getInputs() {
    const inputs = {
        loadSecrets: core.getBooleanInput('load-secrets', { required: false })
    };

    console.log(`Running with inputs: ${JSON.stringify(inputs)}`);
    return inputs;
}

async function verify(loadSecrets) {
    const envs = fs
        .readdirSync("config")
        .filter((fileName) => !excludeFiles.includes(fileName))
        .map((fileName) => fileName.split(".")[0]);
    for (const env of envs) {
        console.log(`Verifying config of environment ${env}`);
        console.log(`configDir=${configDir}`);
        process.env.NODE_ENV = env;
        const params = [configDir, "schema", true];
        if (loadSecrets) {
            await config.init(...params);
        } else {
            config.getConfig(...params);
        }
        console.log(`Environment ${env} verified!`);
    }
}

(async function run() {
    const { loadSecrets } = getInputs();
    console.log(`Running with loadSecrets=${loadSecrets}`);
    try {
        await verify(loadSecrets);
        console.log('All good :)');
    } catch (error) {
        core.setFailed(`Validation failed: ${error.message}`);
    }
})();

