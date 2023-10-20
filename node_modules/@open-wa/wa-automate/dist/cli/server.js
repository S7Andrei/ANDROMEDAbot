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
exports.setupSocketServer = exports.setupBotPressHandler = exports.setupChatwoot = exports.setupTwilioCompatibleWebhook = exports.setupTunnel = exports.setupMediaMiddleware = exports.listListeners = exports.getCommands = exports.setupMetaProcessMiddleware = exports.setupRefocusDisengageMiddleware = exports.setupSwaggerStatsMiddleware = exports.setupApiDocs = exports.setupAuthenticationLayer = exports.enableCORSRequests = exports.setUpExpressApp = exports.setupHttpServer = exports.server = exports.app = void 0;
//@ts-ignore
const express_1 = __importDefault(require("express"));
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const collections_1 = require("./collections");
const express_robots_txt_1 = __importDefault(require("express-robots-txt"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const axios_1 = __importDefault(require("axios"));
const parse_function_1 = __importDefault(require("parse-function"));
const __1 = require("..");
const qs_1 = __importDefault(require("qs"));
const fs = __importStar(require("fs"));
const xmlbuilder2_1 = require("xmlbuilder2");
const chatwoot_1 = require("./integrations/chatwoot");
const express_ipfilter_1 = require("express-ipfilter");
const helmet_1 = __importDefault(require("helmet"));
const localtunnel_1 = __importDefault(require("localtunnel"));
const child_process_1 = require("child_process");
exports.app = (0, express_1.default)();
exports.server = http_1.default.createServer(exports.app);
let tunnel;
const trimChatId = (chatId) => chatId.replace("@c.us", "").replace("@g.us", "");
const socketListenerCallbacks = {};
// const existingListeners = () => Object.keys(Object.keys(socketListenerCallbacks).flatMap(id=>Object.keys(socketListenerCallbacks[id])).reduce((acc,curr)=>{acc[curr]=true;return acc},{}))
const existingListeners = [];
const getCallbacks = (listener) => Object.keys(socketListenerCallbacks).flatMap(k => socketListenerCallbacks[k]).map(o => o[listener]).filter(x => x);
const setupHttpServer = (cliConfig) => {
    //check if there is an allow IP list:
    if (cliConfig.allowIps) {
        let allowIps = cliConfig.allowIps;
        if (!Array.isArray(cliConfig.allowIps))
            allowIps = [cliConfig.allowIps];
        if (Array.isArray(allowIps) && allowIps.length > 0 && allowIps[0]) {
            console.log("Allowed IPs", allowIps);
            let allowIpsOptions = {
                mode: 'allow',
                forbidden: 'You are not authorized to access this page.',
                log: false
            };
            if (cliConfig.verbose)
                allowIpsOptions = Object.assign(Object.assign({}, allowIpsOptions), { logLevel: 'deny', log: true });
            exports.app.use((0, express_ipfilter_1.IpFilter)(allowIps, allowIpsOptions));
            exports.app.use((err, req, res, next) => {
                if (err instanceof express_ipfilter_1.IpDeniedError) {
                    res.status(401);
                    res.send("Access Denied");
                    return;
                }
                next();
            });
        }
    }
    if (cliConfig.helmet) {
        //@ts-ignore
        exports.app.use((0, helmet_1.default)());
    }
    const privkey = `${process.env.PRIV || cliConfig.privkey || ""}`;
    const cert = `${process.env.CERT || cliConfig.cert || ""}`;
    if (privkey && cert) {
        console.log("HTTPS Mode:", privkey, cert);
        const privContents = fs.readFileSync(privkey);
        const certContents = fs.readFileSync(cert);
        exports.app.use((req, res, next) => {
            if (!req.secure && req.get('x-forwarded-proto') !== 'https' && process.env.NODE_ENV !== "development") {
                return res.redirect('https://' + req.get('host') + req.url);
            }
            next();
        });
        if (privContents && certContents) {
            const options = { key: privContents, cert: certContents };
            exports.server = https_1.default.createServer(options, exports.app);
            cliConfig.https = true;
            return;
        }
    }
    exports.server = http_1.default.createServer(exports.app);
};
exports.setupHttpServer = setupHttpServer;
const setUpExpressApp = () => {
    exports.app.use((0, express_robots_txt_1.default)({ UserAgent: '*', Disallow: '/' }));
    //@ts-ignore
    exports.app.use(express_1.default.json({ limit: '99mb' })); //add the limit option so we can send base64 data through the api
    setupMetaMiddleware();
};
exports.setUpExpressApp = setUpExpressApp;
const enableCORSRequests = (cliConfig) => __awaiter(void 0, void 0, void 0, function* () {
    const { default: cors } = yield Promise.resolve().then(() => __importStar(require('cors')));
    exports.app.use(cors(typeof cliConfig.cors === 'object' && cliConfig.cors));
});
exports.enableCORSRequests = enableCORSRequests;
const setupAuthenticationLayer = (cliConfig) => {
    exports.app.use((req, res, next) => {
        if (req.path === '/' && req.method === 'GET')
            return res.redirect('/api-docs/');
        if (req.path.startsWith('/api-docs') || req.path.startsWith('/swagger-stats')) {
            return next();
        }
        const apiKey = req.get('key') || req.get('api_key');
        if (req.path.includes('chatwoot') && req.query['api_key'] && req.query['api_key'] == cliConfig.key) {
            next();
        }
        else if (!apiKey || apiKey !== cliConfig.key) {
            res.status(401).json({ error: 'unauthorised' });
        }
        else {
            next();
        }
    });
};
exports.setupAuthenticationLayer = setupAuthenticationLayer;
const setupApiDocs = (cliConfig) => {
    const swOptions = {
        customCss: '.opblock-description { white-space: pre-line }'
    };
    if (cliConfig.key && cliConfig.preAuthDocs) {
        swOptions["swaggerOptions"] = {
            authAction: {
                api_key: {
                    name: "api_key",
                    schema: { type: "apiKey", in: "header", name: "Authorization", description: "" },
                    value: cliConfig.key
                }
            }
        };
    }
    exports.app.use('/api-docs', (req, res, next) => {
        if (req.originalUrl == "/api-docs")
            return res.redirect('api-docs/');
        next();
    }, swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(collections_1.collections["swagger"], swOptions));
    /**
     * Redirect to api docs if no path is specified
     */
    exports.app.get('/', (req, res) => res.redirect('/api-docs'));
};
exports.setupApiDocs = setupApiDocs;
const setupSwaggerStatsMiddleware = (cliConfig) => __awaiter(void 0, void 0, void 0, function* () {
    const { default: swStats } = yield Promise.resolve().then(() => __importStar(require('swagger-stats')));
    exports.app.use(swStats.getMiddleware({
        elasticsearch: process.env.elastic_url,
        elasticsearchUsername: process.env.elastic_un,
        elasticsearchPassword: process.env.elastic_pw,
        swaggerSpec: collections_1.collections["swagger"],
        authentication: !!cliConfig.key,
        swaggerOnly: true,
        onResponseFinish: function (req, res, rrr) {
            ['file', 'base64', 'image', 'webpBase64', 'base64', 'durl', 'thumbnail'].forEach(key => {
                if (req.body.args[key])
                    req.body.args[key] = rrr.http.request.body.args[key] = req.body.args[key].slice(0, 25) || 'EMPTY';
            });
            if (rrr.http.response.code !== 200 && rrr.http.response.code !== 404) {
                rrr.http.response.phrase = res.statusMessage;
            }
        },
        onAuthenticate: function (req, username, password) {
            return ((username === "admin") && (password === cliConfig.key));
        }
    }));
});
exports.setupSwaggerStatsMiddleware = setupSwaggerStatsMiddleware;
const setupRefocusDisengageMiddleware = (cliConfig) => __awaiter(void 0, void 0, void 0, function* () {
    exports.app.post('/disengage', (req, res) => {
        cliConfig.keepAlive = false;
        return res.send({
            result: true
        });
    });
});
exports.setupRefocusDisengageMiddleware = setupRefocusDisengageMiddleware;
const setupMetaMiddleware = () => {
    /**
     * Collection getter
     */
    exports.app.get("/meta/:collectiontype", (req, res) => {
        const types = Object.keys(collections_1.collections);
        const coltype = req.params.collectiontype.replace('.json', '');
        if (!coltype)
            return res.status(400).send("collection type missing");
        if (!types.includes(coltype))
            return res.status(404).send(`collection ${coltype} not found`);
        return res.send(collections_1.collections[coltype.replace('.json', '')]);
    });
    /**
     * Basic
     */
    exports.app.get("/meta/basic/commands", (_, res) => res.send((0, exports.getCommands)()));
    exports.app.get("/meta/basic/listeners", (_, res) => res.send((0, exports.listListeners)()));
    /**
     * If you want to list the list of all languages GET https://codegen.openwa.dev/api/gen/clients
     *
     * See here for request body: https://github.com/swagger-api/swagger-codegen#online-generators
     */
    exports.app.post("/meta/codegen/:language", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.params.language)
            return res.status(400).send({
                error: `language parameter missing`
            });
        try {
            if (!collections_1.collections["swagger"])
                return res.status(404).send(`collection not found`);
            const codeGenResponse = yield axios_1.default.post(`https://codegen.openwa.dev/api/gen/clients/${req.params.language}`, Object.assign(Object.assign({}, (req.body || {})), { spec: Object.assign({}, collections_1.collections["swagger"]) }));
            return res.send(codeGenResponse.data);
        }
        catch (error) {
            return res.status(400).send({
                error: error.message
            });
        }
    }));
};
const setupMetaProcessMiddleware = (client, cliConfig) => {
    /**
     * Kill the client. End the process.
     */
    let closing = false;
    const nuke = (req, res, restart) => __awaiter(void 0, void 0, void 0, function* () {
        res.set("Connection", "close");
        res.send(closing ? `Already closing! Stop asking!!` : 'Closing after connections closed. Waiting max 5 seconds');
        res.end();
        res.connection.end();
        res.connection.destroy();
        if (closing)
            return;
        closing = true;
        yield client.kill("API_KILL");
        __1.log.info("Waiting for maximum ");
        if (tunnel && tunnel.close && typeof tunnel.close === 'function')
            tunnel.close();
        yield Promise.race([
            new Promise((resolve) => exports.server.close(() => {
                console.log('Server closed');
                resolve(true);
            })),
            new Promise(resolve => setTimeout(resolve, 5000, 'timeout'))
        ]);
        if (process.env.pm_id && process.env.PM2_USAGE) {
            const cmd = `pm2 ${restart ? 'restart' : 'stop'} ${process.env.pm_id}`;
            __1.log.info(`PM2 DETECTED, RUNNING COMMAND: ${cmd}`);
            const cmda = cmd.split(' ');
            (0, child_process_1.spawn)(cmda[0], cmda.splice(1), { stdio: 'inherit' });
        }
        else {
            if (restart)
                setTimeout(function () {
                    process.on("exit", function () {
                        (0, child_process_1.spawn)(process.argv.shift(), process.argv, {
                            cwd: process.cwd(),
                            detached: true,
                            stdio: "inherit"
                        });
                    });
                    process.exit();
                }, 5000);
            else
                process.exit(restart ? 0 : 10);
        }
    });
    /**
     * Exit code 10 will prevent pm2 process from auto-restarting
     */
    exports.app.post('/meta/process/exit', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        return yield nuke(req, res, false);
    }));
    /**
     * Will only restart if the process is managed by pm2
     *
     * Note: Only works when `--pm2` flag is enabled.
     */
    exports.app.post('/meta/process/restart', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        return yield nuke(req, res, true);
    }));
};
exports.setupMetaProcessMiddleware = setupMetaProcessMiddleware;
const getCommands = () => Object.entries(collections_1.collections['swagger'].paths).reduce((acc, [key, value]) => { var _a, _b, _c, _d; acc[key.replace("/", "")] = ((_d = (_c = (_b = (_a = value === null || value === void 0 ? void 0 : value.post) === null || _a === void 0 ? void 0 : _a.requestBody) === null || _b === void 0 ? void 0 : _b.content["application/json"]) === null || _c === void 0 ? void 0 : _c.example) === null || _d === void 0 ? void 0 : _d.args) || {}; return acc; }, {});
exports.getCommands = getCommands;
const listListeners = () => {
    return Object.keys(__1.SimpleListener).map(eventKey => __1.SimpleListener[eventKey]);
};
exports.listListeners = listListeners;
const setupMediaMiddleware = () => {
    exports.app.use("/media", express_1.default.static('media'));
};
exports.setupMediaMiddleware = setupMediaMiddleware;
const setupTunnel = (cliConfig, tunnelCode, PORT) => __awaiter(void 0, void 0, void 0, function* () {
    tunnel = yield (0, localtunnel_1.default)({
        port: PORT,
        host: process.env.WA_TUNNEL_SERVER || "https://public.openwa.cloud",
        subdomain: tunnelCode
    });
    cliConfig.apiHost = cliConfig.tunnel = tunnel.url;
    return tunnel.url;
});
exports.setupTunnel = setupTunnel;
const setupTwilioCompatibleWebhook = (cliConfig, client) => {
    const url = cliConfig.twilioWebhook;
    client.onMessage((message) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const waId = trimChatId(message.from);
        const fd = {};
        fd["To"] = `whatsapp:${trimChatId(message.to)}`;
        fd["AccountSid"] = trimChatId(message.to);
        fd["WaId"] = waId;
        fd["ProfileName"] = ((_a = message === null || message === void 0 ? void 0 : message.chat) === null || _a === void 0 ? void 0 : _a.formattedTitle) || "";
        fd["SmsSid"] = message.id;
        fd["SmsMessageSid"] = message.id;
        fd["MessageSid"] = message.id;
        fd["NumSegments"] = "1";
        fd["NumSegments"] = "1";
        fd["Body"] = message.loc || message.body || message.caption || "";
        fd["From"] = `whatsapp:${waId}`;
        if (message.mimetype) {
            fd["MediaContentType0"] = message.mimetype || "";
            fd["MediaUrl0"] = message.cloudUrl || "";
            fd["NumMedia"] = "1";
        }
        if (message.lat) {
            fd["Latitude"] = message.lat || "";
            fd["Longitude"] = message.lng || "";
        }
        try {
            const { data } = yield (0, axios_1.default)({
                method: 'post',
                url,
                data: qs_1.default.stringify(fd),
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            });
            const obj = (0, xmlbuilder2_1.convert)(data, { format: "object" });
            const msg = obj.Response.Message;
            //   const toId : string = msg['@to'].match(/\d*/g).filter(x=>x).join("-");
            //   const to = `${toId}@${toId.includes("-") ? 'g' : 'c'}.us` as ChatId
            if (msg.Media) {
                return yield client.sendFile(message.from, msg.Media, `file.${msg.Media.split(/[#?]/)[0].split('.').pop().trim()}`, msg['#'] || "");
            }
            return yield client.sendText(message.from, msg['#']);
        }
        catch (error) {
            __1.log.error("TWILIO-COMPAT WEBHOOK ERROR", url, error.message);
        }
    }));
};
exports.setupTwilioCompatibleWebhook = setupTwilioCompatibleWebhook;
const setupChatwoot = (cliConfig, client) => __awaiter(void 0, void 0, void 0, function* () {
    exports.app.post('/chatwoot', (0, chatwoot_1.chatwootMiddleware)(cliConfig, client));
    exports.app.post(`/chatwoot/checkWebhook`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { body } = req;
        __1.log.info(`chatwoot webhook check request received: ${body.checkCode}`);
        yield __1.ev.emitAsync(chatwoot_1.chatwoot_webhook_check_event_name, body);
        return res.send({});
    }));
    // await setupChatwootOutgoingMessageHandler(cliConfig, client);
});
exports.setupChatwoot = setupChatwoot;
const setupBotPressHandler = (cliConfig, client) => {
    const u = cliConfig.botPressUrl;
    const sendBotPressMessage = (text, chatId, message) => __awaiter(void 0, void 0, void 0, function* () {
        const url = `${u.split("/").slice(0, u.split("/").findIndex(x => x == "converse")).join("/")}/converse/${chatId.replace("@c.us", "").replace("@g.us", "")}`;
        try {
            const { data } = yield axios_1.default.post(url, {
                "type": "text",
                text,
                metadata: message
            });
            const { responses } = data;
            return yield Promise.all(responses.filter(({ type }) => type != "typing").map((response) => {
                if (response.type == "text") {
                    response.text = response.variations ? (response.variations.concat(response.text))[Math.floor(Math.random() * (response.variations.length + 1))] : response.text;
                    return client.sendText(chatId, response.text);
                }
                if (response.type == "file") {
                    return client.sendFile(chatId, response.url, `file.${response.url.split(/[#?]/)[0].split('.').pop().trim()}`, response.title || "");
                }
                if (response.type == "image") {
                    return client.sendFile(chatId, response.image, `file.${response.image.split(/[#?]/)[0].split('.').pop().trim()}`, response.title || "");
                }
                if (response.type == "single-choice") {
                    if (response["choices"] && response["choices"].length >= 1 && response["choices"].length <= 3) {
                        return client.sendButtons(chatId, response.text, response["choices"].map(qr => {
                            return {
                                id: qr.value,
                                text: qr.title
                            };
                        }), "");
                    }
                }
                if (response.type == "quick_replies") {
                    if (response["quick_replies"] && response["quick_replies"].length >= 1 && response["quick_replies"].length <= 3) {
                        return client.sendButtons(chatId, response.wrapped.text, response["quick_replies"].map(qr => {
                            return {
                                id: qr.payload,
                                text: qr.title
                            };
                        }), "");
                    }
                }
            }));
        }
        catch (error) {
            console.error("BOTPRESS API ERROR", url, error.message);
        }
    });
    client.onMessage((message) => __awaiter(void 0, void 0, void 0, function* () {
        let text = message.body;
        switch (message.type) {
            case 'location':
                text = `${message.lat},${message.lng}`;
                break;
            case 'buttons_response':
                text = message.selectedButtonId;
                break;
            case 'document':
            case 'image':
            case 'audio':
            case 'ptt':
            case 'video':
                if (message.cloudUrl)
                    text = message.cloudUrl;
                break;
            default:
                text = message.body || "__UNHANDLED__";
                break;
        }
        yield sendBotPressMessage(text, message.from, message);
    }));
};
exports.setupBotPressHandler = setupBotPressHandler;
const setupSocketServer = (cliConfig, client) => __awaiter(void 0, void 0, void 0, function* () {
    const { Server } = yield Promise.resolve().then(() => __importStar(require("socket.io")));
    const socketServerOptions = cliConfig.cors ? {
        cors: typeof cliConfig.cors === 'object' ? cliConfig.cors : {
            origin: "*",
            methods: ["GET", "POST"],
        },
    } : null;
    const io = socketServerOptions ? new Server(exports.server, socketServerOptions) : new Server(exports.server);
    if (cliConfig.key) {
        io.use((socket, next) => {
            if (socket.handshake.auth["apiKey"] == cliConfig.key)
                next();
            else
                next(new Error("Authentication error"));
        });
    }
    io.on("connection", (socket) => {
        console.log("Connected to socket:", socket.id);
        socket.on('disconnect', (reason) => {
            console.log(`Socket ${socket.id} ~ reason: ${reason}`);
            socketListenerCallbacks[socket.id] = {};
        });
        socket.onAny((m, ...args) => __awaiter(void 0, void 0, void 0, function* () {
            __1.log.info("🔌", m);
            if (m === "register_ev") {
                __1.ev.onAny((event, value) => socket.emit(event, value));
            }
            const callbacks = args.filter(arg => typeof arg === "function");
            const objs = args.filter(arg => typeof arg === "object");
            if (m === "node_red_init_call") {
                if (!collections_1.collections['swagger'])
                    return callbacks[0]();
                return callbacks[0]((0, exports.getCommands)());
            }
            if (m === "node_red_init_listen") {
                return callbacks[0]((0, exports.listListeners)());
            }
            if (client[m]) {
                if (m.startsWith("on") && callbacks[0]) {
                    //there should only be one instance of the socket callback per listener
                    if (!socketListenerCallbacks[socket.id])
                        socketListenerCallbacks[socket.id] = {};
                    const callback = x => socket.emit(m, x);
                    let listenerSet = true;
                    if (!existingListeners.includes(m)) {
                        listenerSet = yield client[m]((data) => __awaiter(void 0, void 0, void 0, function* () { return Promise.all(getCallbacks(m).map(fn => fn(data))); }));
                        existingListeners.push(m);
                    }
                    callbacks[0](listenerSet);
                    socketListenerCallbacks[socket.id][m] = callback;
                }
                else {
                    let { args } = objs[0];
                    if (args && !Array.isArray(args))
                        args = (0, parse_function_1.default)().parse(client[m]).args.map(argName => args[argName]);
                    else if (!args)
                        args = [];
                    try {
                        const data = yield client[m](...args);
                        callbacks[0](data);
                    }
                    catch (error) {
                        callbacks[0]({ error: {
                                message: error.message,
                                stack: error.stack || ""
                            } });
                    }
                }
            }
            return;
        }));
    });
});
exports.setupSocketServer = setupSocketServer;
