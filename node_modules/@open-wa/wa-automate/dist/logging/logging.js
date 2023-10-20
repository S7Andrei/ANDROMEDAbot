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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupLogging = exports.addSysLogTransport = exports.addRotateFileLogTransport = exports.log = void 0;
const os_1 = __importDefault(require("os"));
const winston = __importStar(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const winston_syslog_1 = require("winston-syslog");
const custom_transport_1 = require("./custom_transport");
const { combine, timestamp } = winston.format;
const traverse_1 = __importDefault(require("traverse"));
const full_1 = require("klona/full");
const truncateLength = 200;
let _evSet = false, _consoleSet = false, d = Date.now();
const sensitiveKeys = [
    /cookie/i,
    /sessionData/i,
    /passw(or)?d/i,
    /^pw$/,
    /^pass$/i,
    /secret/i,
    /token/i,
    /api[-._]?key/i,
];
function isSensitiveKey(keyStr) {
    if (keyStr) {
        return sensitiveKeys.some(regex => regex.test(keyStr));
    }
}
function redactObject(obj) {
    (0, traverse_1.default)(obj).forEach(function redactor() {
        if (isSensitiveKey(this.key)) {
            this.update("[REDACTED]");
        }
        else if (typeof this.node === 'string' && this.node.length > truncateLength) {
            this.update(truncate(this.node, truncateLength));
        }
    });
}
function redact(obj) {
    const copy = (0, full_1.klona)(obj); // Making a deep copy to prevent side effects
    redactObject(copy);
    const splat = copy[Symbol.for("splat")];
    redactObject(splat); // Specifically redact splat Symbol
    return copy;
}
function truncate(str, n) {
    return str.length > n ? str.substr(0, n - 1) + '...[TRUNCATED]...' : str;
}
const formatRedact = winston.format(redact);
const stringSaver = winston.format((info) => {
    const copy = (0, full_1.klona)(info);
    const splat = copy[Symbol.for("splat")];
    if (splat) {
        copy.message = `${copy.message} ${splat.filter((x) => typeof x !== 'object').join(' ')}`;
        copy[Symbol.for("splat")] = splat.filter((x) => typeof x == 'object');
        return copy;
    }
    return info;
});
/**
 * To prevent "Attempt to write logs with no transports" error
 */
const placeholderTransport = new custom_transport_1.NoOpTransport();
const makeLogger = () => winston.createLogger({
    format: combine(stringSaver(), timestamp(), winston.format.json(), formatRedact(), winston.format.splat(), winston.format.simple()),
    levels: winston.config.syslog.levels,
    transports: [placeholderTransport]
});
/**
 * You can access the log in your code and add your own custom transports
 * https://github.com/winstonjs/winston#transports
 * see [Logger](https://github.com/winstonjs/winston#transports) for more details.
 *
 * Here is an example of adding the GCP stackdriver transport:
 *
 * ```
 * import { log } from '@open-wa/wa-automate'
 * import { LoggingWinston } from '@google-cloud/logging-winston';
 *
 * const gcpTransport = new LoggingWinston({
 *     projectId: 'your-project-id',
 *     keyFilename: '/path/to/keyfile.json'
 *   });
 *
 * ...
 * log.add(
 *  gcpTransport
 * )
 *
 * //Congrats! Now all of your session logs will also go to GCP Stackdriver
 * ```
 */
exports.log = makeLogger();
if (exports.log.warning && !exports.log.warn)
    exports.log.warn = exports.log.warning;
if (exports.log.alert && !exports.log.help)
    exports.log.help = exports.log.alert;
const addRotateFileLogTransport = (options = {}) => {
    exports.log.add(new winston_daily_rotate_file_1.default(Object.assign({ filename: 'application-%DATE%.log', datePattern: 'YYYY-MM-DD-HH', zippedArchive: true, maxSize: '2m', maxFiles: '14d' }, options)));
};
exports.addRotateFileLogTransport = addRotateFileLogTransport;
/**
 * @private
 */
const addSysLogTransport = (options = {}) => {
    exports.log.add(new winston_syslog_1.Syslog(Object.assign({ localhost: os_1.default.hostname() }, options)));
};
exports.addSysLogTransport = addSysLogTransport;
const enableConsoleLogger = (options = {}) => {
    if (_consoleSet)
        return;
    exports.log.add(new winston.transports.Console(Object.assign({ level: 'debug', timestamp: timestamp() }, options)));
    _consoleSet = true;
};
function enableLogToEv(options = {}) {
    if (_evSet)
        return;
    exports.log.add(new custom_transport_1.LogToEvTransport(Object.assign({ format: winston.format.json() }, options)));
    _evSet = true;
}
/**
 * @private
 */
const setupLogging = (logging, sessionId = "session") => {
    const currentlySetup = [];
    const _logging = logging.map((l) => {
        if (l.done)
            return l;
        if (l.type === 'console') {
            enableConsoleLogger(Object.assign({}, (l.options || {})));
        }
        else if (l.type === 'ev') {
            enableLogToEv(Object.assign({}, (l.options || {})));
        }
        else if (l.type === 'file') {
            (0, exports.addRotateFileLogTransport)(Object.assign({}, (l.options || {})));
        }
        else if (l.type === 'syslog') {
            (0, exports.addSysLogTransport)(Object.assign(Object.assign({}, (l.options || {})), { appName: `owa-${sessionId}-${d}` }));
        }
        currentlySetup.push(l);
        return Object.assign(Object.assign({}, l), { done: true });
    });
    currentlySetup.map((l) => {
        exports.log.info(`Set up logging for ${l.type}`, l.options);
        return l;
    });
    return _logging;
};
exports.setupLogging = setupLogging;
