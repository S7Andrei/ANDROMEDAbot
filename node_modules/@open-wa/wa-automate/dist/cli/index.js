"use strict";
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
const index_1 = require("../index");
const terminal_link_1 = __importDefault(require("terminal-link"));
const is_url_superb_1 = __importDefault(require("is-url-superb"));
const tcp_port_used_1 = __importDefault(require("tcp-port-used"));
const axios_1 = __importDefault(require("axios"));
const setup_1 = require("./setup");
const collections_1 = require("./collections");
const server_1 = require("./server");
const chatwoot_1 = require("./integrations/chatwoot");
let checkUrl = (s) => (typeof s === "string") && (0, is_url_superb_1.default)(s);
const ready = (config) => __awaiter(void 0, void 0, void 0, function* () {
    (0, index_1.processSend)('ready');
    if (config.readyWebhook)
        yield (0, axios_1.default)({
            method: 'post',
            url: config.readyWebhook,
            data: {
                ts: Date.now(),
                data: Object.assign({}, config),
                sessionId: config.sessionId,
                namespace: "READY"
            }
        }).catch(err => index_1.log.error(`READY WEBHOOK ERROR: ${config.readyWebhook} ${err.message}`));
});
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        const { cliConfig, createConfig, PORT, spinner } = yield (0, setup_1.cli)();
        process.env.OWA_CLI = "true";
        spinner.start("Launching EASY API");
        if (cliConfig.verbose)
            index_1.log.info(`config: `, { cliConfig, createConfig, PORT });
        (0, server_1.setUpExpressApp)();
        if (cliConfig.cors)
            yield (0, server_1.enableCORSRequests)(cliConfig);
        try {
            const { status, data } = yield axios_1.default.post(`http://localhost:${PORT}/getConnectionState`);
            if (status === 200 && data.response === "CONNECTED") {
                const { data: { response: { sessionId, port, webhook, apiHost } } } = yield axios_1.default.post(`http://localhost:${PORT}/getConfig`);
                if ((createConfig === null || createConfig === void 0 ? void 0 : createConfig.sessionId) == sessionId && createConfig.port === port && createConfig.webhook === webhook && createConfig.apiHost === apiHost) {
                    spinner.info('removing popup flag');
                    if (createConfig.popup) {
                        delete createConfig.popup;
                    }
                }
            }
        }
        catch (error) {
            if (error.code === "ECONNREFUSED")
                spinner.info('Selected port is free');
        }
        createConfig.headless = cliConfig.headful != undefined ? !cliConfig.headful : cliConfig.headless;
        if (cliConfig.ev || cliConfig.ev == "") {
            //prepare ef
            if (cliConfig === null || cliConfig === void 0 ? void 0 : cliConfig.ef) {
                if (!Array.isArray(cliConfig.ef))
                    cliConfig.ef = [cliConfig.ef];
                cliConfig.ef = cliConfig.ef.flatMap(s => s.split(','));
            }
            if (cliConfig.skipUrlCheck)
                checkUrl = () => true;
            if (!checkUrl(cliConfig.ev))
                spinner.fail("--ev/-e expecting URL - invalid URL.");
            else
                index_1.ev.on('**', (data, sessionId, namespace) => __awaiter(this, void 0, void 0, function* () {
                    if (cliConfig === null || cliConfig === void 0 ? void 0 : cliConfig.ef) {
                        if (!cliConfig.ef.includes(namespace))
                            return;
                    }
                    if (!cliConfig.allowSessionDataWebhook && (namespace == "sessionData" || namespace == "sessionDataBase64"))
                        return;
                    const whStart = (0, index_1.now)();
                    yield (0, axios_1.default)({
                        method: 'post',
                        url: cliConfig.ev,
                        data: {
                            ts: Date.now(),
                            data,
                            sessionId,
                            namespace
                        }
                    }).then(({ status }) => {
                        const t = ((0, index_1.now)() - whStart).toFixed(0);
                        index_1.log.info("EV Webhook", namespace, status, t);
                    }).catch(err => index_1.log.error(`EV WEBHOOK ERROR: ${cliConfig.ev} ${err.message}`));
                }));
        }
        //These things can be done before the client is created
        if ((cliConfig === null || cliConfig === void 0 ? void 0 : cliConfig.generateApiDocs) || (cliConfig === null || cliConfig === void 0 ? void 0 : cliConfig.stats)) {
            yield (0, collections_1.generateCollections)(Object.assign(Object.assign({}, createConfig), cliConfig), spinner);
        }
        try {
            const client = yield (0, index_1.create)(Object.assign({}, createConfig));
            (0, server_1.setupMetaProcessMiddleware)(client, cliConfig);
            yield (0, server_1.setupHttpServer)(cliConfig);
            if (cliConfig.autoReject) {
                yield client.autoReject(cliConfig.onCall);
            }
            else if (cliConfig.onCall) {
                yield client.onIncomingCall((call) => __awaiter(this, void 0, void 0, function* () {
                    yield client.sendText(call.peerJid, cliConfig.onCall);
                }));
            }
            client.onLogout(() => __awaiter(this, void 0, void 0, function* () {
                console.error('!!!! CLIENT LOGGED OUT !!!!');
                if (cliConfig && !cliConfig.noKillOnLogout) {
                    yield client.waitAllQEmpty();
                    console.error("Shutting down.");
                    process.exit();
                }
            }), -1);
            if (cliConfig === null || cliConfig === void 0 ? void 0 : cliConfig.botPressUrl) {
                spinner.info('Setting Up Botpress handler');
                (0, server_1.setupBotPressHandler)(cliConfig, client);
                spinner.succeed('Botpress handler set up successfully');
            }
            if (cliConfig === null || cliConfig === void 0 ? void 0 : cliConfig.twilioWebhook) {
                spinner.info('Setting Up Twilio Compaitible Webhook');
                (0, server_1.setupTwilioCompatibleWebhook)(cliConfig, client);
                spinner.succeed('Twilio Compaitible Webhook set up successfully');
            }
            if (cliConfig === null || cliConfig === void 0 ? void 0 : cliConfig.webhook) {
                if (Array.isArray(cliConfig.webhook)) {
                    yield Promise.all(cliConfig.webhook.map(webhook => {
                        if (webhook.url && webhook.events)
                            return client.registerWebhook(webhook.url, webhook.events, webhook.requestConfig || {});
                    }));
                }
                else
                    yield client.registerWebhook(cliConfig.webhook, "all");
            }
            if (cliConfig === null || cliConfig === void 0 ? void 0 : cliConfig.keepAlive)
                client.onStateChanged((state) => __awaiter(this, void 0, void 0, function* () {
                    if ((state === "CONFLICT" || state === "UNLAUNCHED") && (cliConfig === null || cliConfig === void 0 ? void 0 : cliConfig.keepAlive))
                        yield client.forceRefocus();
                }));
            if (!(cliConfig === null || cliConfig === void 0 ? void 0 : cliConfig.noApi)) {
                if (cliConfig === null || cliConfig === void 0 ? void 0 : cliConfig.key) {
                    spinner.info(`Please see machine logs to see the API key`);
                    console.log(`Please use the following api key for requests as a header:\napi_key: ${cliConfig.key}`);
                    (0, server_1.setupAuthenticationLayer)(cliConfig);
                }
                if (cliConfig === null || cliConfig === void 0 ? void 0 : cliConfig.chatwootUrl) {
                    spinner.info('Setting Up Chatwoot handler');
                    spinner.info(`Make sure to set up the Chatwoot inbox webhook to the following path on this process: /chatwoot${cliConfig.key ? `?api_key=YOUR-API-KEY` : ''}`);
                    yield (0, server_1.setupChatwoot)(cliConfig, client);
                    spinner.succeed('Chatwoot handler set up successfully');
                }
                (0, server_1.setupRefocusDisengageMiddleware)(cliConfig);
                if (cliConfig && cliConfig.generateApiDocs && collections_1.collections["swagger"]) {
                    spinner.info('Setting Up API Explorer');
                    (0, server_1.setupApiDocs)(cliConfig);
                    spinner.succeed('API Explorer set up successfully');
                }
                if ((cliConfig === null || cliConfig === void 0 ? void 0 : cliConfig.stats) && collections_1.collections["swagger"]) {
                    spinner.info('Setting Up API Stats');
                    (0, server_1.setupSwaggerStatsMiddleware)(cliConfig);
                    spinner.info('API Stats set up successfully');
                }
                if (createConfig.messagePreprocessor === "AUTO_DECRYPT_SAVE") {
                    (0, server_1.setupMediaMiddleware)();
                }
                server_1.app.use(client.middleware((cliConfig && cliConfig.useSessionIdInPath), PORT));
                if (cliConfig.socket) {
                    spinner.info("Setting up socket");
                    yield (0, server_1.setupSocketServer)(cliConfig, client);
                    spinner.succeed("Socket ready for connection");
                }
                spinner.info(`...waiting for port ${PORT} to be free`);
                yield tcp_port_used_1.default.waitUntilFree(PORT, 200, 20000).catch(() => {
                    spinner.fail(`Port ${PORT} is not available. Closing`);
                    process.exit();
                });
                spinner.succeed(`Port ${PORT} is now free.`);
                server_1.server.listen(PORT, () => __awaiter(this, void 0, void 0, function* () {
                    spinner.succeed(`\n• Listening on port ${PORT}!`);
                    (0, index_1.processSendData)({ port: PORT });
                }));
                process.on('message', function (data) {
                    var _a;
                    return __awaiter(this, void 0, void 0, function* () {
                        if (((_a = data === null || data === void 0 ? void 0 : data.data) === null || _a === void 0 ? void 0 : _a.command) === "port_report") {
                            const response = { port: PORT };
                            (0, index_1.processSendData)(response);
                            return response;
                        }
                    });
                });
                if (cliConfig.tunnel) {
                    spinner.info(`\n• Setting up external tunnel`);
                    const tunnelUrl = yield (0, server_1.setupTunnel)(cliConfig, yield client.getTunnelCode(), PORT);
                    spinner.succeed(`\n\t${(0, terminal_link_1.default)('External address', tunnelUrl)}`);
                }
                const apiDocsUrl = cliConfig.apiHost ? `${cliConfig.apiHost}/api-docs/ ` : `${cliConfig.host.includes('http') ? '' : 'http://'}${cliConfig.host}:${PORT}/api-docs/ `;
                const link = (0, terminal_link_1.default)('API Explorer', apiDocsUrl);
                if (cliConfig && cliConfig.generateApiDocs)
                    spinner.succeed(`\n\t${link}`);
                if (cliConfig && cliConfig.generateApiDocs && cliConfig.stats) {
                    const swaggerStatsUrl = cliConfig.apiHost ? `${cliConfig.apiHost}/swagger-stats/ ` : `${cliConfig.host.includes('http') ? '' : 'http://'}${cliConfig.host}:${PORT}/swagger-stats/ `;
                    const statsLink = (0, terminal_link_1.default)('API Stats', swaggerStatsUrl);
                    spinner.succeed(`\n\t${statsLink}`);
                }
                if (cliConfig === null || cliConfig === void 0 ? void 0 : cliConfig.chatwootUrl)
                    yield (0, chatwoot_1.setupChatwootOutgoingMessageHandler)(cliConfig, client);
            }
            yield ready(Object.assign(Object.assign(Object.assign(Object.assign({}, createConfig), cliConfig), client.getSessionInfo()), { hostAccountNumber: yield client.getHostNumber() }));
            if (cliConfig.emitUnread) {
                yield client.emitUnreadMessages();
            }
            if (!createConfig.licenseKey)
                spinner.succeed(`Use this link to get a license: ${yield client.getLicenseLink()}`);
        }
        catch (e) {
            spinner.fail(`Error ${e.message} ${e}`);
        }
    });
}
start();
