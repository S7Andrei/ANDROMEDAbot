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
Object.defineProperty(exports, "__esModule", { value: true });
exports.scriptLoader = exports.ScriptLoader = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const logging_1 = require("../logging/logging");
const read = (_path) => new Promise((resolve, reject) => {
    fs.readFile(require.resolve(path.join(__dirname, '../lib', _path)), 'utf8', (err, file) => {
        if (err)
            reject(err);
        resolve(file);
    });
});
class ScriptLoader {
    constructor() {
        this.scripts = [
            // stage 1
            'jsSha.min.js',
            'qr.min.js',
            'base64.js',
            'hash.js',
            //stage 2
            'wapi.js',
            //stage 3,
            'launch.js'
        ];
        this.contentRegistry = {};
        this.contentRegistry = {};
    }
    loadScripts() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(this.scripts.map(this.getScript.bind(this)));
            return this.contentRegistry;
        });
    }
    getScript(scriptName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.contentRegistry[scriptName]) {
                this.contentRegistry[scriptName] = yield read(scriptName);
                logging_1.log.info(`SCRIPT READY: ${scriptName} ${this.contentRegistry[scriptName].length}`);
            }
            else
                logging_1.log.info(`GET SCRIPT: ${scriptName} ${this.contentRegistry[scriptName].length}`);
            return this.contentRegistry[scriptName];
        });
    }
    flush() {
        this.contentRegistry = {};
    }
    getScripts() {
        return this.contentRegistry;
    }
}
exports.ScriptLoader = ScriptLoader;
const scriptLoader = new ScriptLoader();
exports.scriptLoader = scriptLoader;
