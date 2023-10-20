/// <reference types="node" />
import { RequireAtLeastOne } from 'type-fest/source/require-at-least-one';
import { Message } from '@open-wa/wa-automate-types-only/dist/api/model/message';
export declare const mediaTypes: {
    [k: string]: string;
};
export declare type RequiredDecryptionMessage = {
    mediaKey: string;
    filehash: string;
    mimetype: string;
    type: string;
    size: number;
};
export declare type DecryptableMessage = RequireAtLeastOne<{
    clientUrl?: string;
    deprecatedMms3Url?: string;
}, 'clientUrl' | 'deprecatedMms3Url'> & RequiredDecryptionMessage;
export declare class MissingCriticalDataError extends Error {
    message: string;
    constructor(message: string);
}
export declare const decryptMedia: (message: DecryptableMessage | Message | boolean, useragentOverride?: string) => Promise<Buffer>;
export declare const bleachMessage: (m: {
    [k: string]: unknown;
}) => {
    [x: string]: unknown;
};
