"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cli = exports.configFile = exports.envArgs = exports.helptext = exports.meowFlags = exports.cliOptionNames = exports.PrimitiveConverter = exports.optionKeysWithDefalts = exports.optionKeys = void 0;
const tools_1 = require("./../utils/tools");
const command_line_usage_1 = __importDefault(require("command-line-usage"));
const meow_1 = __importDefault(require("meow"));
const logo_1 = require("./logo");
const fs_extra_1 = require("fs-extra");
const changeCase = __importStar(require("change-case"));
const file_utils_1 = require("./file-utils");
const uuid_apikey_1 = __importDefault(require("uuid-apikey"));
const events_1 = require("../controllers/events");
const is_url_superb_1 = __importDefault(require("is-url-superb"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const logging_1 = require("../logging/logging");
const cli_options_1 = require("./cli-options");
let checkUrl = url => typeof url === 'string' ? (0, is_url_superb_1.default)(url) : false;
const configWithCases = (0, fs_extra_1.readJsonSync)(path.join(__dirname, '../../bin/config-schema.json'));
exports.optionKeys = cli_options_1.optionList.map(({ name }) => (0, tools_1.camelize)(name));
exports.optionKeysWithDefalts = [...cli_options_1.optionList.filter(o => o.hasOwnProperty('default')).map(({ name }) => (0, tools_1.camelize)(name)), 'popup'];
exports.PrimitiveConverter = {
    Number: 1,
    Boolean: true,
    String: "hello"
};
exports.cliOptionNames = cli_options_1.optionList.reduce((acc, c) => {
    if (!c.type)
        return acc;
    acc[(0, tools_1.camelize)(c.name)] = typeof exports.PrimitiveConverter[c.type.name];
    return acc;
}, {});
const meowFlags = () => {
    const extraFlags = {};
    configWithCases.map(({ type, key }) => {
        if (key === "popup")
            type = "number";
        if (key === "viewport")
            type = "string";
        if (key === "stickerServerEndpoint")
            type = "string";
        extraFlags[key] = {
            type
        };
    });
    const res = {};
    cli_options_1.optionList.map(option => {
        var _a, _b;
        res[(0, tools_1.camelize)(option.name)] = Object.assign(Object.assign({}, option), { 
            //@ts-ignore
            type: (_b = (_a = option.type) === null || _a === void 0 ? void 0 : _a.name) === null || _b === void 0 ? void 0 : _b.toLowerCase() });
    });
    return Object.assign(Object.assign({}, res), extraFlags);
};
exports.meowFlags = meowFlags;
exports.helptext = (0, command_line_usage_1.default)([{
        content: logo_1.HELP_HEADER,
        raw: true,
    },
    {
        header: '',
        optionList: cli_options_1.optionList
    },
    {
        header: "Session config flags",
        optionList: [
            ...configWithCases.map(c => {
                let type;
                if (c.type === 'boolean')
                    type = Boolean;
                if (c.type === 'string')
                    type = String;
                if (c.type === '"number"' || c.type === 'number')
                    type = Number;
                return {
                    name: c.p,
                    type,
                    description: c.description
                };
            })
        ]
    },
    {
        content: `Please check here for more information on some of the above mentioned parameters: {underline https://docs.openwa.dev/interfaces/api_model_config.configobject}`
    },
    {
        content: 'Project home: {underline https://github.com/open-wa/wa-automate-nodejs}'
    }
]);
const envArgs = () => {
    const env = {};
    Object.entries(process.env).filter(([k,]) => k.includes('WA')).map(([k, v]) => env[changeCase.camelCase(k.replace('WA_', ''))] = (v == 'false' || v == 'FALSE') ? false : (v == 'true' || v == 'TRUE') ? true : Number(v) || v);
    return env;
};
exports.envArgs = envArgs;
const configFile = (config) => __awaiter(void 0, void 0, void 0, function* () {
    let confFile = null;
    const conf = config || process.env.WA_CLI_CONFIG;
    //check if it is a directory:
    const isDir = fs.existsSync(conf) && fs.lstatSync(conf).isDirectory();
    logging_1.log.info(`Config ${config} is directory: ${isDir}`);
    const backup = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!confFile)
            confFile = yield (0, file_utils_1.tryOpenFileAsObject)(`cli.config.json`);
        if (!confFile)
            confFile = yield (0, file_utils_1.tryOpenFileAsObject)(`cli.config.js`);
    });
    const attempt = (firstAttempt, skipBackup) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!confFile)
                confFile = yield (0, file_utils_1.tryOpenFileAsObject)(firstAttempt || `cli.config.json`);
            if (!skipBackup)
                yield backup();
        }
        catch (error) {
            logging_1.log.error(error);
            logging_1.log.error("Trying cli.config.js");
            yield backup();
        }
    });
    if (conf) {
        if ((0, tools_1.isBase64)(conf)) {
            confFile = JSON.parse(Buffer.from(conf, 'base64').toString('ascii'));
        }
        else {
            if (isDir) {
                yield attempt(`${isDir && conf}/cli.config.json`, true);
                yield attempt(`${isDir && conf}/cli.config.js`, true);
                yield backup();
            }
            else
                yield attempt(conf);
            if (!confFile)
                console.error(`Unable to read config file json: ${conf}`);
        }
    }
    else {
        yield attempt();
    }
    logging_1.log.info(`Using config file: ${(confFile || {}).confPath || "???"}`);
    return confFile || {};
});
exports.configFile = configFile;
const cli = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let loggingSetup = false;
    const _cli = (0, meow_1.default)(exports.helptext, {
        flags: Object.assign(Object.assign({}, (0, exports.meowFlags)()), { popup: {
                type: 'boolean',
                default: false
            } }),
        booleanDefault: undefined
    });
    process.env.CURRENT_SESSION_ID = ((_a = _cli.flags) === null || _a === void 0 ? void 0 : _a.sessionId) || process.env.WA_SESSION_ID || 'session';
    const _setupLogging = (_config) => {
        if (loggingSetup)
            return;
        //firstly set up logger
        if ((_config === null || _config === void 0 ? void 0 : _config.logging) || (_config === null || _config === void 0 ? void 0 : _config.verbose)) {
            if (!(_config === null || _config === void 0 ? void 0 : _config.logging) && (_config === null || _config === void 0 ? void 0 : _config.verbose))
                _config.logging = [];
            if ((_config === null || _config === void 0 ? void 0 : _config.logging) && !((_config === null || _config === void 0 ? void 0 : _config.logging) || []).find(transport => transport.type === "console"))
                _config.logging.push({ type: 'console' });
            if (Array.isArray(_config === null || _config === void 0 ? void 0 : _config.logging))
                _config.logging = (0, logging_1.setupLogging)(_config === null || _config === void 0 ? void 0 : _config.logging, `easy-api-${(_config === null || _config === void 0 ? void 0 : _config.sessionId) || 'session'}`);
            loggingSetup = true;
        }
        if (_config.verbose)
            _config.disableSpins = true;
    };
    _setupLogging(_cli.flags);
    /**
     * Config order should follow airmanship rules. Least maneuverable to most maneuverable.
     *
     * 1. ENV VARS
     * 2. Config file
     * 3. CLI flags
     */
    const resolvedConfigFromFile = ((yield (0, exports.configFile)(_cli.flags.config)) || {});
    const nonCliConfigs = Object.assign(Object.assign({}, (0, exports.envArgs)()), resolvedConfigFromFile);
    cli_options_1.optionList.filter(option => option.default);
    const cliConfig = Object.assign(Object.assign(Object.assign({ sessionId: "session" }, nonCliConfigs), _cli.flags), exports.optionKeysWithDefalts.reduce((p, c) => nonCliConfigs.hasOwnProperty(c) ? Object.assign(Object.assign({}, p), { [c]: nonCliConfigs[c] }) : p, {}));
    //firstly set up logger
    _setupLogging(cliConfig);
    process.env.CURRENT_SESSION_ID = cliConfig.sessionId;
    const PORT = Number((typeof cliConfig.forcePort === "boolean" && cliConfig.forcePort ? process.env.PORT : cliConfig.forcePort) || cliConfig.port || process.env.PORT || 8080);
    const spinner = new events_1.Spin(cliConfig.sessionId, 'STARTUP', cliConfig === null || cliConfig === void 0 ? void 0 : cliConfig.disableSpins);
    const createConfig = Object.assign({}, cliConfig);
    if (cliConfig === null || cliConfig === void 0 ? void 0 : cliConfig.session) {
        createConfig.sessionData = cliConfig.session;
    }
    if (cliConfig === null || cliConfig === void 0 ? void 0 : cliConfig.allowSessionDataWh) {
        cliConfig.allowSessionDataWebhook = cliConfig.allowSessionDataWh;
    }
    /**
     * Build create() specific conig
     */
    if (((cliConfig === null || cliConfig === void 0 ? void 0 : cliConfig.licenseKey) || (cliConfig === null || cliConfig === void 0 ? void 0 : cliConfig.l))) {
        createConfig.licenseKey = cliConfig.licenseKey || cliConfig.l;
    }
    if (cliConfig === null || cliConfig === void 0 ? void 0 : cliConfig.popup) {
        createConfig.popup = PORT;
    }
    if (!((cliConfig === null || cliConfig === void 0 ? void 0 : cliConfig.key) == null) && (cliConfig === null || cliConfig === void 0 ? void 0 : cliConfig.key) == "") {
        cliConfig.key = uuid_apikey_1.default.create().apiKey;
    }
    if (cliConfig.viewport && cliConfig.viewport.split && cliConfig.viewport.split('x').length && cliConfig.viewport.split('x').length == 2 && cliConfig.viewport.split('x').map(Number).map(n => !!n ? n : null).filter(n => n).length == 2) {
        const [width, height] = cliConfig.viewport.split('x').map(Number).map(n => !!n ? n : null).filter(n => n);
        createConfig.viewport = { width, height };
    }
    if (cliConfig.resizable) {
        createConfig.defaultViewport = null; // <= set this to have viewport emulation off
    }
    if (cliConfig.sessionDataOnly) {
        events_1.ev.on(`sessionData.**`, (sessionData, sessionId) => __awaiter(void 0, void 0, void 0, function* () {
            (0, fs_extra_1.writeFile)(`${sessionId}.data.json`, JSON.stringify(sessionData), (err) => {
                if (err) {
                    spinner.fail(err.message);
                    return;
                }
                else
                    spinner.succeed(`Session data saved: ${sessionId}.data.json\nClosing.`);
                process.exit();
            });
        }));
    }
    if (cliConfig.skipUrlCheck)
        checkUrl = () => true;
    if (cliConfig.webhook || cliConfig.webhook == '') {
        if (checkUrl(cliConfig.webhook) || Array.isArray(cliConfig.webhook)) {
            spinner.succeed('webhooks set already');
        }
        else {
            if (cliConfig.webhook == '')
                cliConfig.webhook = 'webhooks.json';
            cliConfig.webhook = (0, file_utils_1.tryOpenFileAsObject)(cliConfig.webhook, true);
            if (!checkUrl(cliConfig.webhook)) {
                cliConfig.webhook = undefined;
            }
        }
    }
    if (cliConfig.twilioWebhook || cliConfig.twilioWebhook == '') {
        if (cliConfig.twilioWebhook == '' && cliConfig.webhook)
            cliConfig.twilioWebhook = cliConfig.webhook;
        if (!checkUrl(cliConfig.twilioWebhook)) {
            cliConfig.twilioWebhook = undefined;
        }
        if (cliConfig.twilioWebhook && (!createConfig.cloudUploadOptions || createConfig.messagePreprocessor !== 'UPLOAD_CLOUD')) {
            spinner.info('twilioWebhook set but messagePreprocessor not set to UPLOAD_CLOUD or cloudUploadOptions is missing');
        }
    }
    if (cliConfig.apiHost) {
        cliConfig.apiHost = cliConfig.apiHost.replace(/\/$/, '');
    }
    /**
     * Check the port in the config
     */
    cliConfig.port = PORT;
    if (cliConfig.debug) {
        spinner.succeed(`DEBUG - PORT: ${PORT}`);
        spinner.succeed(`DEBUG - flags: ${JSON.stringify(cliConfig)}`);
        const WA_ENV = {};
        Object.keys(process.env).map(k => {
            if (k.startsWith('WA_'))
                WA_ENV[k] = process.env[k];
        });
        spinner.succeed(`DEBUG - env vars: ${JSON.stringify(WA_ENV)}`);
    }
    return {
        createConfig, cliConfig, PORT, spinner
    };
});
exports.cli = cli;
