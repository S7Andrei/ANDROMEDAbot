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
exports.getAndInjectLicense = exports.earlyInjectionCheck = exports.getLicense = exports.getAndInjectLivePatch = exports.injectLivePatch = exports.getPatch = void 0;
const crypto = __importStar(require("crypto"));
const events_1 = require("./events");
const initializer_1 = require("./initializer");
const axios_1 = __importDefault(require("axios"));
const fs_1 = require("fs");
const { default: PQueue } = require("p-queue");
const queue = new PQueue();
/**
 * @private
 */
function getPatch(config, spinner, sessionInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        var data = null;
        var headers = {};
        const ghUrl = `https://raw.githubusercontent.com/open-wa/wa-automate-nodejs/master/patches.json`;
        const hasSpin = !!spinner;
        const patchFilePath = `${process.cwd()}/patches.ignore.data.json`;
        /**
         * If cachedPatch is true then search for patch in current working directory.
         */
        if (config === null || config === void 0 ? void 0 : config.cachedPatch) {
            spinner.info('Searching for cached patch');
            // open file called patches.json and read as string
            if ((0, fs_1.existsSync)(patchFilePath)) {
                spinner.info('Found cached patch');
                const lastModifiedDate = (0, fs_1.statSync)(patchFilePath).mtimeMs;
                /**
                 * Check if patchFilePath file is more than 1 day old
                 */
                if ((lastModifiedDate + 86400000) < Date.now()) {
                    //this patch is stale.
                    spinner.fail('Cached patch is stale.');
                }
                else {
                    const patch = (0, fs_1.readFileSync)(patchFilePath, 'utf8');
                    data = JSON.parse(patch);
                    spinner.info('Cached patch loaded');
                }
            }
            else
                spinner.fail('Cached patch not found');
        }
        const freshPatchFetchPromise = () => new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const patchesBaseUrl = (config === null || config === void 0 ? void 0 : config.ghPatch) ? ghUrl : initializer_1.pkg.patches;
            const patchesUrl = patchesBaseUrl + `?wv=${sessionInfo.WA_VERSION}&wav=${sessionInfo.WA_AUTOMATE_VERSION}`;
            if (!spinner)
                spinner = new events_1.Spin(config.sessionId, "FETCH_PATCH", config.disableSpins, true);
            spinner === null || spinner === void 0 ? void 0 : spinner.start(`Downloading ${(config === null || config === void 0 ? void 0 : config.cachedPatch) ? 'cached ' : ''}patches from ${patchesBaseUrl}`, hasSpin ? undefined : 2);
            const START = Date.now();
            var { data, headers } = yield axios_1.default.get(patchesUrl).catch(() => {
                spinner === null || spinner === void 0 ? void 0 : spinner.info('Downloading patches. Retrying.');
                return axios_1.default.get(`${ghUrl}?v=${Date.now()}`);
            });
            const END = Date.now();
            if (!headers['etag']) {
                spinner === null || spinner === void 0 ? void 0 : spinner.info('Generating patch hash');
                headers['etag'] = crypto.createHash('md5').update(typeof data === 'string' ? data : JSON.stringify(data)).digest("hex").slice(-5);
            }
            spinner === null || spinner === void 0 ? void 0 : spinner.succeed(`Downloaded patches in ${(END - START) / 1000}s`);
            if (config === null || config === void 0 ? void 0 : config.cachedPatch) {
                //save patches.json to current working directory
                spinner === null || spinner === void 0 ? void 0 : spinner.info('Saving patches to current working directory');
                (0, fs_1.writeFileSync)(patchFilePath, JSON.stringify(data, null, 2));
                spinner === null || spinner === void 0 ? void 0 : spinner.succeed('Saved patches to current working directory');
            }
            return resolve({
                data,
                tag: `${(headers.etag || '').replace(/"/g, '').slice(-5)}`
            });
        }));
        if ((config === null || config === void 0 ? void 0 : config.cachedPatch) && data) {
            queue.add(freshPatchFetchPromise);
            return { data, tag: `CACHED-${(crypto.createHash('md5').update(typeof data === 'string' ? data : JSON.stringify(data)).digest("hex").slice(-5)).replace(/"/g, '').slice(-5)}` };
        }
        else
            return yield freshPatchFetchPromise();
    });
}
exports.getPatch = getPatch;
/**
 * @private
 * @param page
 * @param spinner
 */
function injectLivePatch(page, patch, spinner) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data, tag } = patch;
        spinner === null || spinner === void 0 ? void 0 : spinner.info('Installing patches');
        yield Promise.all(data.map(patch => page.evaluate(`${patch}`)));
        spinner === null || spinner === void 0 ? void 0 : spinner.succeed(`Patches Installed: ${tag}`);
        return tag;
    });
}
exports.injectLivePatch = injectLivePatch;
/**
 * @private
 */
function getAndInjectLivePatch(page, spinner, preloadedPatch, config, sessionInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        let patch = preloadedPatch;
        if (!patch)
            patch = yield getPatch(config, spinner, sessionInfo);
        const patch_hash = yield injectLivePatch(page, patch, spinner);
        sessionInfo.PATCH_HASH = patch_hash;
    });
}
exports.getAndInjectLivePatch = getAndInjectLivePatch;
/**
 * @private
 */
function getLicense(config, me, debugInfo, spinner) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(config === null || config === void 0 ? void 0 : config.licenseKey) || !(me === null || me === void 0 ? void 0 : me._serialized))
            return false;
        const hasSpin = !!spinner;
        if (!spinner)
            spinner = new events_1.Spin(config.sessionId || "session", "FETCH_LICENSE", config.disableSpins, true);
        if (typeof config.licenseKey === "function") {
            //run the funciton to get the key
            config.licenseKey = yield config.licenseKey(config.sessionId, me._serialized);
        }
        if (config.licenseKey && typeof config.licenseKey === "object") {
            //attempt to get the key from the object
            //@ts-ignore
            config.licenseKey = config.licenseKey[me._serialized] || config.licenseKey[config.sessionId];
        }
        //asume by now the key is a string
        spinner === null || spinner === void 0 ? void 0 : spinner.start(`Fetching License: ${Array.isArray(config.licenseKey) ? config.licenseKey : typeof config.licenseKey === "string" ? config.licenseKey.indexOf("-") == -1 ? config.licenseKey.slice(-4) : config.licenseKey.split("-").slice(-1)[0] : config.licenseKey}`, hasSpin ? undefined : 2);
        try {
            const START = Date.now();
            const { data } = yield axios_1.default.post(initializer_1.pkg.licenseCheckUrl, Object.assign({ key: config.licenseKey, number: me._serialized }, debugInfo));
            const END = Date.now();
            spinner === null || spinner === void 0 ? void 0 : spinner.succeed(`Downloaded License in ${(END - START) / 1000}s`);
            return data;
        }
        catch (error) {
            spinner === null || spinner === void 0 ? void 0 : spinner.fail(`License request failed: ${error.statusCode || error.status || error.code} ${error.message}`);
            return false;
        }
    });
}
exports.getLicense = getLicense;
function earlyInjectionCheck(page) {
    return __awaiter(this, void 0, void 0, function* () {
        //@ts-ignore
        yield page.waitForFunction(() => Object.entries(window).filter(([, o]) => o && o.push && (o.push != [].push))[0] ? true : false, { timeout: 10, polling: 500 }).catch(() => { });
        //@ts-ignore
        return yield page.evaluate(() => { if (window.webpackChunkwhatsapp_web_client) {
            window.webpackChunkbuild = window.webpackChunkwhatsapp_web_client;
        }
        else {
            (function () { const f = Object.entries(window).filter(([, o]) => o && o.push && (o.push != [].push)); if (f[0]) {
                window.webpackChunkbuild = window[f[0][0]];
            } })();
        } return (typeof window.webpackChunkbuild !== "undefined"); });
    });
}
exports.earlyInjectionCheck = earlyInjectionCheck;
function getAndInjectLicense(page, config, me, debugInfo, spinner, preloadedLicense) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(config === null || config === void 0 ? void 0 : config.licenseKey) || !(me === null || me === void 0 ? void 0 : me._serialized))
            return false;
        let l_err;
        let data = preloadedLicense;
        spinner === null || spinner === void 0 ? void 0 : spinner.info('Checking License');
        try {
            if (!data) {
                spinner === null || spinner === void 0 ? void 0 : spinner.info('Fethcing License...');
                data = yield getLicense(config, me, debugInfo, spinner);
            }
            if (data) {
                spinner === null || spinner === void 0 ? void 0 : spinner.info('Injecting License...');
                const l_success = yield page.evaluate(data => eval(data), data);
                if (!l_success) {
                    spinner === null || spinner === void 0 ? void 0 : spinner.info('License injection failed. Getting error..');
                    l_err = yield page.evaluate('window.launchError');
                }
                else {
                    spinner === null || spinner === void 0 ? void 0 : spinner.info('License injected successfully..');
                    const keyType = yield page.evaluate('window.KEYTYPE || false');
                    spinner === null || spinner === void 0 ? void 0 : spinner.succeed(`License Valid${keyType ? `: ${keyType}` : ''}`);
                    return true;
                }
            }
            else
                l_err = "The key is invalid";
            if (l_err) {
                spinner === null || spinner === void 0 ? void 0 : spinner.fail(`License issue${l_err ? `: ${l_err}` : ""}`);
            }
            return false;
        }
        catch (error) {
            spinner === null || spinner === void 0 ? void 0 : spinner.fail(`License request failed: ${error.statusCode || error.status || error.code} ${error.message}`);
            return false;
        }
    });
}
exports.getAndInjectLicense = getAndInjectLicense;
// export * from './init_patch';
