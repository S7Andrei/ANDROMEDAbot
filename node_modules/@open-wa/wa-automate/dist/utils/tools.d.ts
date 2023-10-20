/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { AdvancedFile, ConfigObject, DataURL } from '../api/model';
import { AxiosRequestConfig } from 'axios';
import { SessionInfo } from '../api/model/sessionInfo';
import { Readable } from "stream";
export declare const timeout: (ms: any) => Promise<unknown>;
/**
 *  Use this to generate a more likely valid user agent. It makes sure it has the WA part and replaces any windows or linux os info with mac.
 * @param useragent Your custom user agent
 * @param v The WA version from the debug info. This is optional. default is 2.2117.5
 */
export declare const smartUserAgent: (ua: string, version?: string) => string;
export declare const getConfigFromProcessEnv: any;
/**
 * Remove the key from the object and return the rest of the object.
 * @param {JsonObject} obj - The object to be filtered.
 * @param {string} key - The key to discard.
 * @returns The object without the key.
 */
export declare const without: any;
export declare const camelize: (str: string) => string;
/**
 * Check if a string is Base64
 * @param str string
 * @returns
 */
export declare const isBase64: (str: string) => boolean;
/**
 * Check if a string is a DataURL
 * @param s string
 * @returns
 */
export declare const isDataURL: (s: string) => boolean;
/**
 * @internal
 * A convinience method to download the buffer of a downloaded file
 * @param url The url
 * @param optionsOverride You can use this to override the [axios request config](https://github.com/axios/axios#request-config)
 */
export declare const getBufferFromUrl: (url: string, optionsOverride?: any) => Promise<[Buffer, any]>;
/**
 * @internal
 * A convinience method to download the [[DataURL]] of a file
 * @param url The url
 * @param optionsOverride You can use this to override the [axios request config](https://github.com/axios/axios#request-config)
 */
export declare const getDUrl: (url: string, optionsOverride?: AxiosRequestConfig) => Promise<DataURL>;
/**
 * @internal
 * Use this to extract the mime type from a [[DataURL]]
 */
export declare const base64MimeType: (dUrl: DataURL) => string;
/**
 * If process.send is defined, send the message three times
 * @param {string} message - The message to send to the parent process.
 * @returns Nothing.
 */
export declare const processSend: (message: string) => void;
/**
 * Return the performance object if it is available, otherwise return the Date object
 */
export declare const perf: () => DateConstructor | import("perf_hooks").Performance;
/**
 * Return the current time in milliseconds
 */
export declare const now: () => number;
/**
 * `timePromise` returns a promise that resolves to the time it took to run the function passed to it
 * @param fn - the function to be timed.
 * @returns A string.
 */
export declare function timePromise(fn: () => Promise<any>): Promise<string>;
/**
 * It sends a message to the parent process.
 * @param {any} data - The data to be sent to the parent process.
 * @returns Nothing.
 */
export declare const processSendData: (data?: any) => boolean;
/**
 * It generates a link to the GitHub issue template for the current session
 * @param {ConfigObject} config - the config object
 * @param {SessionInfo} sessionInfo - The sessionInfo object from the CLI
 * @param {any} extras - any
 * @returns A link to the issue tracker for the current session.
 */
export declare const generateGHIssueLink: (config: ConfigObject, sessionInfo: SessionInfo, extras?: any) => string;
/**
 * If the file is a DataURL, return it. If it's a file, convert it to a DataURL. If it's a URL,
 * download it and convert it to a DataURL. If Base64, returns it.
 * @param {string} file - The file to be converted to a DataURL.
 * @param {AxiosRequestConfig} requestConfig - AxiosRequestConfig = {}
 * @param {string} filename - Filename with an extension so a datauri mimetype can be inferred.
 * @returns A DataURL
 */
export declare const ensureDUrl: (file: string | Buffer, requestConfig?: AxiosRequestConfig, filename?: string) => Promise<string>;
export declare const FileInputTypes: {
    VALIDATED_FILE_PATH: string;
    URL: string;
    DATA_URL: string;
    BASE_64: string;
    BUFFER: string;
    READ_STREAM: string;
};
export declare const FileOutputTypes: {
    TEMP_FILE_PATH: string;
    VALIDATED_FILE_PATH: string;
    URL: string;
    DATA_URL: string;
    BASE_64: string;
    BUFFER: string;
    READ_STREAM: string;
};
/**
 * Remove file asynchronously
 * @param file Filepath
 * @returns
 */
export declare function rmFileAsync(file: string): Promise<unknown>;
/**
 * Takes a file parameter and consistently returns the desired type of file.
 * @param file The file path, URL, base64 or DataURL string of the file
 * @param outfileName The ouput filename of the file
 * @param desiredOutputType The type of file output required from this function
 * @param requestConfig optional axios config if file parameter is a url
 */
export declare const assertFile: (file: AdvancedFile | Buffer, outfileName: string, desiredOutputType: keyof typeof FileOutputTypes, requestConfig?: any) => Promise<string | Buffer | Readable>;
/**
 * Checks if a given path exists.
 *
 * If exists, returns the resolved absolute path. Otherwise returns false.
 *
 * @param _path a relative, absolute or homedir path to a folder or a file
 * @param failSilent If you're expecting for the file to not exist and just want the `false` response then set this to true to prevent false-positive error messages in the logs.
 * @returns string | false
 */
export declare const pathExists: (_path: string, failSilent?: boolean) => Promise<string | false>;
/**
 * Returns an absolute file path reference
 * @param _path a relative, absolute or homedir path to a folder or a file
 * @returns string
 */
export declare const fixPath: (_path: string) => string;
/**
 *
 * Accented filenames break file sending in docker containers. This is used to replace accented chars in strings to prevent file sending failures.
 *
 * @param input The raw string
 * @returns A sanitized string with all accented chars removed
 */
export declare const sanitizeAccentedChars: (input: string) => string;
