/// <reference types="node" />
import http from 'http';
import { Client } from '..';
export declare const app: import("express-serve-static-core").Express;
export declare let server: http.Server;
export type cliFlags = {
    [k: string]: number | string | boolean;
};
export declare const setupHttpServer: (cliConfig: cliFlags) => void;
export declare const setUpExpressApp: () => void;
export declare const enableCORSRequests: (cliConfig: cliFlags) => void;
export declare const setupAuthenticationLayer: (cliConfig: cliFlags) => void;
export declare const setupApiDocs: (cliConfig: cliFlags) => void;
export declare const setupSwaggerStatsMiddleware: (cliConfig: cliFlags) => Promise<void>;
export declare const setupRefocusDisengageMiddleware: (cliConfig: cliFlags) => void;
export declare const setupMetaProcessMiddleware: (client: Client, cliConfig: any) => void;
export declare const getCommands: () => any;
export declare const listListeners: () => string[];
export declare const setupMediaMiddleware: () => void;
export declare const setupTunnel: (cliConfig: any, tunnelCode: string, PORT: number) => Promise<string>;
export declare const setupTwilioCompatibleWebhook: (cliConfig: cliFlags, client: Client) => void;
export declare const setupChatwoot: (cliConfig: cliFlags, client: Client) => void;
export declare const setupBotPressHandler: (cliConfig: cliFlags, client: Client) => void;
export declare const setupSocketServer: (cliConfig: any, client: Client) => Promise<void>;
