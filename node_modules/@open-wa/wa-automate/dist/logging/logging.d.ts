import * as winston from 'winston';
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
export declare const log: winston.Logger;
export declare const addRotateFileLogTransport: (options?: any) => void;
/**
 * @private
 */
export declare const addSysLogTransport: (options?: any) => void;
export type ConfigLogTransport = {
    /**
     * The type of winston transport. At the moment only `file`, `console`, `ev` and `syslog` are supported.
     */
    type: 'syslog' | 'console' | 'file' | 'ev';
    /**
     * The options for the transport. Generally only required for syslog but you can use this to override default options for other types of transports.
     */
    options?: any;
    /**
     * If the transport has already been added to the logger. The logging set up command handles this for you.
     * @readonly
     */
    done?: boolean;
};
/**
 * @private
 */
export declare const setupLogging: (logging: ConfigLogTransport[], sessionId?: string) => ConfigLogTransport[];
