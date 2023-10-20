import { EventEmitter2 } from 'eventemitter2';
import { Socket } from "socket.io-client";
import { Client as _Client, SimpleListener, Chat, ChatId, Message } from "@open-wa/wa-automate-types-only";
import { MessageCollector } from './MessageCollector';
import { AwaitMessagesOptions, Collection, CollectorFilter, CollectorOptions } from './Collector';
/**
 * A convenience type that includes all keys from the `Client`.
 */
export declare type ClientMethods = keyof _Client;
export declare type Client = _Client;
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
export declare class SocketClient {
    url: string;
    apiKey: string;
    socket: Socket;
    flushListenersOnDisconnect: boolean;
    /**
     * A local version of the `ev` EventEmitter2
     */
    ev: EventEmitter2;
    listeners: {
        [listener in SimpleListener]?: {
            [id: string]: (data: any) => any;
        };
    };
    private isListenerRegistered;
    /**
     * The main way to create the socket based client.
     * @param url URL of the socket server (i.e the EASY API instance address)
     * @param apiKey optional api key if set
     * @returns SocketClient
     */
    static connect(url: string, apiKey?: string, ev?: boolean): Promise<SocketClient & Client>;
    private _connected;
    /**
     * Disconnect the socket
     */
    disconnect(): void;
    /**
     * Close the socket. Prevents not being able to close the node process.
     */
    close(): void;
    /**
     * Attempt to kill the session and close the socket
     */
    killSession(): Promise<void>;
    /**
     * Reconnect the socket
     */
    reconnect(): Promise<void>;
    createMessageCollector(c: Message | ChatId | Chat, filter: CollectorFilter<[Message]>, options: CollectorOptions): Promise<MessageCollector>;
    awaitMessages(c: Message | ChatId | Chat, filter: CollectorFilter<[Message]>, options?: AwaitMessagesOptions): Promise<Collection<string, Message>>;
    /**
     *
     * @param url The URL of the socket server (i.e the EASY API instance address)
     * @param apiKey The API key if set (with -k flag)
     * @param ev I forgot what this is for.
     * @param flushListenersOnDisconnect If true, all listeners will be removed when the socket disconnects. If false, they will be kept and re-registered when the socket reconnects.
     * @returns
     */
    constructor(url: string, apiKey?: string, ev?: boolean, flushListenersOnDisconnect?: boolean);
    private _ensureListenersRegistered;
    /**
     * Remove all internal event listeners
     */
    flushListeners(): Promise<void>;
    /**
     * A convenience method for the socket connected event.
     * @param callback The callback to be called when the socket is connected
     */
    onConnected(callback: () => void): Promise<void>;
    ask<M extends ClientMethods, P extends Parameters<Pick<Client, M>[M]>>(method: M, args?: any[] | P | {
        [k: string]: unknown;
    }): Promise<unknown>;
    /**
     * Set a callback on a simple listener
     * @param listener The listener name (e.g onMessage, onAnyMessage, etc.)
     * @param callback The callback you need to run on the selected listener
     * @returns The id of the callback
     */
    listen(listener: SimpleListener, callback: (data: unknown) => void): Promise<string>;
    /**
     * Discard a callback
     *
     * @param listener The listener name (e.g onMessage, onAnyMessage, etc.)
     * @param callbackId The ID from `listen`
     * @returns boolean - true if the callback was found and discarded, false if the callback is not found
     */
    stopListener(listener: SimpleListener, callbackId: string): boolean;
}
