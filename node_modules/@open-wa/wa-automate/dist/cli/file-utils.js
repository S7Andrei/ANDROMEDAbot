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
exports.tryOpenFileAsObject = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const json5_1 = __importDefault(require("json5"));
const logging_1 = require("../logging/logging");
const tryOpenFileAsObject = (fileLocation, needArray = false) => __awaiter(void 0, void 0, void 0, function* () {
    let res = undefined;
    let fp = undefined;
    const relativePath = path.join(path.resolve(process.cwd(), fileLocation || ''));
    const isJs = fileLocation.endsWith(".js");
    logging_1.log.info(`Checking exists: ${fileLocation || relativePath}`);
    if (fs.existsSync(fileLocation) || fs.existsSync(relativePath)) {
        fp = isJs ? fs.existsSync(relativePath) && relativePath : fs.existsSync(fileLocation) ? fileLocation : relativePath;
        logging_1.log.info("Attempting to open: " + fp);
        try {
            const data = isJs ? (require(fp) || {}).default : json5_1.default.parse(fs.readFileSync(fp, 'utf8'));
            if (data && (Array.isArray(data) == needArray))
                res = data;
            if (data && typeof data === "function") {
                logging_1.log.info("Found config as function, executing.");
                res = yield data(process.env.CURRENT_SESSION_ID || "session");
            }
        }
        catch (error) {
            throw `Unable to parse config file as JSON. Please make sure ${fp} is a valid JSON config file`;
        }
    }
    else
        return;
    logging_1.log.info(`${fp} is ${res ? 'valid' : 'invalid'}`);
    logging_1.log.info(`contents: ${JSON.stringify(res)}`);
    return res && Object.assign(Object.assign({}, (res || {})), { confPath: fp });
});
exports.tryOpenFileAsObject = tryOpenFileAsObject;
