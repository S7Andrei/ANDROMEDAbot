import { Client } from '../..';
import { cliFlags } from '../server';
import { Request, Response } from "express";
export declare const chatwoot_webhook_check_event_name = "cli.integrations.chatwoot.check";
export type expressMiddleware = (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const chatwootMiddleware: (cliConfig: cliFlags, client: Client) => expressMiddleware;
export declare const setupChatwootOutgoingMessageHandler: (cliConfig: cliFlags, client: Client) => Promise<void>;
export type ChatwootConfig = {
    /**
     * The URL of the chatwoot inbox. If you want this integration to create & manage the inbox for you, you can omit the inbox part.
     */
    chatwootUrl: string;
    /**
     * The API access token which you can get from your account menu.
     */
    chatwootApiAccessToken: string;
    /**
     * The API host which will be used as the webhook address in the Chatwoot inbox.
     */
    apiHost: string;
    /**
     * Similar to apiHost
     */
    host: string;
    /**
     * Whether or not to use https for the webhook address
     */
    https?: boolean;
    /**
     * The certificate for https
     */
    cert: string;
    /**
     * The private key for https
     */
    privkey: string;
    /**
     * The API key used to secure the instance webhook address
     */
    key?: string;
    /**
     * Whether or not to update the webhook address in the Chatwoot inbox on launch
     */
    forceUpdateCwWebhook?: boolean;
    /**
     * port
     */
    port: number;
};
