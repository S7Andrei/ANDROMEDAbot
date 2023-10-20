import { Client } from '../api/Client';
import { AdvancedConfig, ConfigObject } from '../api/model/index';
export declare const pkg: any, configWithCases: any, timeout: (ms: number) => Promise<string>;
export declare let screenshot: any;
/**
 * Used to initialize the client session.
 *
 * *Note* It is required to set all config variables as [ConfigObject](https://open-wa.github.io/wa-automate-nodejs/interfaces/configobject.html) that includes both [sessionId](https://open-wa.github.io/wa-automate-nodejs/interfaces/configobject.html#sessionId). Setting the session id as the first variable is no longer valid
 *
 * e.g
 *
 * ```javascript
 * create({
 * sessionId: 'main',
 * customUserAgent: ' 'WhatsApp/2.16.352 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Safari/605.1.15',
 * blockCrashLogs true,
 * ...
 * })....
 * ```
 * @param config AdvancedConfig The extended custom configuration
 */
export declare function create(config?: AdvancedConfig | ConfigObject): Promise<Client>;
