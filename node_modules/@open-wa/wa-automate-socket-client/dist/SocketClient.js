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
exports.SocketClient = void 0;
const eventemitter2_1 = require("eventemitter2");
const socket_io_client_1 = require("socket.io-client");
const uuid_1 = require("uuid");
const MessageCollector_1 = require("./MessageCollector");
const debug_1 = __importDefault(require("debug"));
const debug = (0, debug_1.default)('wa:socket');
/**
 * [ALPHA - API will 100% change in the near future. Don't say I didn't warn you.]
 *
 *
 * An easy to use socket implementation that allows users to connect into remote instances of the EASY API.
 *
 * How to use it:
 *
 * 1. Make sure you're running an instance of the EASY API and make sure to start it with the `--socket` flag
 *      ```bash
 *          > docker run -e PORT=8080 -p 8080:8080 openwa/wa-automate:latest --socket
 *      ```
 * 2. Use this in your code:
 *
 *      ```javascript
 *          import { SocketClient } from "@open-wa/wa-automate";
 *
 *          SocketClient.connect("http://localhost:8080").then(async client => {
 *              //now you can use the client similar to how you would use the http express middleware.
 *
 *              //There are two main commands from this client
 *
 *              // 1. client.listen - use this for your listeners
 *
 *              await client.listen("onMessage", message => {
 *                  ...
 *              })
 *
 *              // 2. client.asj - ask the main host client to get things done
 *
 *              await client.ask("sendText", {
 *                  "to" : "44771234567@c.us",
 *                  "content": "hellow socket"
 *              })
 *
 *              // or you can send the arguments in order as an array (or tuple, as the cool kids would say)
 *              await client.ask("sendText", [
 *                  "44771234567@c.us",
 *                  "hellow socket"
 *              ])
 *
 *          })
 *      ```
 */
class SocketClient {
    /**
     *
     * @param url The URL of the socket server (i.e the EASY API instance address)
     * @param apiKey The API key if set (with -k flag)
     * @param ev I forgot what this is for.
     * @param flushListenersOnDisconnect If true, all listeners will be removed when the socket disconnects. If false, they will be kept and re-registered when the socket reconnects.
     * @returns
     */
    constructor(url, apiKey, ev, flushListenersOnDisconnect) {
        this.flushListenersOnDisconnect = true;
        /**
         * A local version of the `ev` EventEmitter2
         */
        this.ev = new eventemitter2_1.EventEmitter2({
            wildcard: true
        });
        this.listeners = {};
        this.url = url;
        this.apiKey = apiKey;
        this.flushListenersOnDisconnect = flushListenersOnDisconnect;
        const _url = new URL(url);
        const _path = _url.pathname.replace(/\/$/, "");
        this.socket = (0, socket_io_client_1.io)(_url.origin, {
            autoConnect: true,
            auth: {
                apiKey
            },
            path: _path ? `${_path}/socket.io/` : undefined
        });
        if (ev)
            this.socket.on("connect", () => __awaiter(this, void 0, void 0, function* () {
                yield this._connected();
            }));
        this.socket.on("connect_error", (err) => {
            debug("connect_error", err);
            console.error("Socket connection error", err.message, err["data"] || "");
        });
        this.socket.io.on("reconnect", () => __awaiter(this, void 0, void 0, function* () {
            // console.log("Reconnected!!")
            debug("reconnected");
            this._ensureListenersRegistered();
        }));
        this.socket.io.on("reconnect_attempt", () => {
            debug("Reconnecting...");
            // console.log("Reconnecting...")
        });
        this.socket.on("disconnect", () => {
            debug("disconnected");
            if (this.flushListenersOnDisconnect)
                this.flushListeners();
            // console.log("Disconnected from host!")
        });
        return new Proxy(this, {
            get: function get(target, prop) {
                const o = Reflect.get(target, prop);
                if (o || prop == "ev")
                    return o;
                if (prop === 'then') {
                    return typeof target[prop] === "function" ? Promise.prototype.then.bind(target) : null;
                }
                if (prop.startsWith("on")) {
                    return (callback) => __awaiter(this, void 0, void 0, function* () { return target.listen(prop, callback); });
                }
                else {
                    return (...args) => __awaiter(this, void 0, void 0, function* () {
                        return target.ask(prop, args.length == 1 && typeof args[0] == "object" ? Object.assign({}, args[0]) : [
                            ...args
                        ]);
                    });
                }
            }
        });
    }
    /**
     * The main way to create the socket based client.
     * @param url URL of the socket server (i.e the EASY API instance address)
     * @param apiKey optional api key if set
     * @returns SocketClient
     */
    static connect(url, apiKey, ev) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Promise((resolve, reject) => {
                const client = new this(url, apiKey, ev, false);
                client.socket.on("connect", () => __awaiter(this, void 0, void 0, function* () {
                    yield client._connected();
                    return resolve(client);
                }));
                client.socket.on("connect_error", reject);
            });
        });
    }
    _connected() {
        return __awaiter(this, void 0, void 0, function* () {
            debug("_connected", this.socket.id);
            if (!this.ev)
                this.ev = new eventemitter2_1.EventEmitter2({
                    wildcard: true
                });
            process.on('SIGINT', () => {
                this.close();
                process.exit();
            });
            this.socket.emit("register_ev");
            this.socket.onAny((event, value) => this.ev.emit(event, value));
            yield this._ensureListenersRegistered();
        });
    }
    /**
     * Disconnect the socket
     */
    disconnect() {
        this.socket.disconnect();
    }
    /**
     * Close the socket. Prevents not being able to close the node process.
     */
    close() {
        this.socket.close();
    }
    /**
     * Attempt to kill the session and close the socket
     */
    killSession() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ask("kill");
            this.socket.close();
        });
    }
    /**
     * Reconnect the socket
     */
    reconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                this.socket.connect();
                this.socket.on("connect", () => __awaiter(this, void 0, void 0, function* () {
                    yield this._connected();
                    resolve();
                }));
            });
        });
    }
    createMessageCollector(c, filter, options) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const chatId = (((_b = (_a = c) === null || _a === void 0 ? void 0 : _a.chat) === null || _b === void 0 ? void 0 : _b.id) || ((_c = c) === null || _c === void 0 ? void 0 : _c.id) || c);
            return new MessageCollector_1.MessageCollector(yield this.ask('getSessionId'), yield this.ask('getInstanceId'), chatId, filter, options, this.ev);
        });
    }
    awaitMessages(c, filter, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const collector = yield this.createMessageCollector(c, filter, options);
                collector.once('end', (collection, reason) => {
                    if (options.errors && options.errors.includes(reason)) {
                        reject(collection);
                    }
                    else {
                        resolve(collection);
                    }
                });
            }));
        });
    }
    _ensureListenersRegistered() {
        return __awaiter(this, void 0, void 0, function* () {
            debug("Listeners, reregistering...", this.listeners);
            yield Promise.all(Object.keys(this.listeners).map((listener) => __awaiter(this, void 0, void 0, function* () {
                yield this.ask(listener);
                if (!this.socket.listeners(listener).length) {
                    this.socket.on(listener, (data) => __awaiter(this, void 0, void 0, function* () { return yield Promise.all(Object.entries(this.listeners[listener]).map(([, callback]) => callback(data))); }));
                }
            })));
        });
    }
    /**
     * Remove all internal event listeners
     */
    flushListeners() {
        return __awaiter(this, void 0, void 0, function* () {
            debug("Listeners, flushing...");
            this.listeners = {};
        });
    }
    /**
     * A convenience method for the socket connected event.
     * @param callback The callback to be called when the socket is connected
     */
    onConnected(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._connected();
            if (this.socket.connected)
                callback();
            else
                this.socket.on("connect", callback);
        });
    }
    //awaiting tuple label getter to reimplement this
    // //  | {
    //   [K in keyof Parameters<Pick<Client,M>[ M ]>]: Parameters<Pick<Client,M>[ M ]>[K]
    // }
    ask(method, args) {
        return __awaiter(this, void 0, void 0, function* () {
            debug("ask", method, args);
            // if (!this.socket.connected) return new Error("Socket not connected!")
            return new Promise((_resolve, reject) => {
                const resolve = (...args) => {
                    debug("resolve", method, args);
                    //@ts-ignore
                    _resolve(...args);
                };
                if (typeof args !== "object" && !Array.isArray(args) && (typeof args === "string" || typeof args === "number"))
                    args = [args];
                try {
                    // @ts-ignore
                    this.socket.emit(method, {
                        args
                    }, resolve);
                }
                catch (error) {
                    debug("ask error", method, error);
                    reject(error);
                }
            });
        });
    }
    /**
     * Set a callback on a simple listener
     * @param listener The listener name (e.g onMessage, onAnyMessage, etc.)
     * @param callback The callback you need to run on the selected listener
     * @returns The id of the callback
     */
    listen(listener, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            debug("listen", listener);
            // if (!this.socket.connected) throw new Error("Socket not connected!")
            const id = (0, uuid_1.v4)();
            if (!this.listeners[listener]) {
                this.listeners[listener] = {};
                yield this.ask(listener);
                if (!this.socket.listeners(listener).length)
                    this.socket.on(listener, (data) => __awaiter(this, void 0, void 0, function* () { return yield Promise.all(Object.entries(this.listeners[listener]).map(([, callback]) => callback(data))); }));
            }
            this.listeners[listener][id] = callback;
            return id;
        });
    }
    /**
     * Discard a callback
     *
     * @param listener The listener name (e.g onMessage, onAnyMessage, etc.)
     * @param callbackId The ID from `listen`
     * @returns boolean - true if the callback was found and discarded, false if the callback is not found
     */
    stopListener(listener, callbackId) {
        debug("stop listener", callbackId);
        if (this.listeners[listener][callbackId]) {
            delete this.listeners[listener][callbackId];
            return true;
        }
        return false;
    }
}
exports.SocketClient = SocketClient;
