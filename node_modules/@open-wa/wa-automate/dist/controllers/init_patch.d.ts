import type { Page } from 'puppeteer';
/**
 * @private
 */
export declare function injectInitPatch(page: Page): Promise<void>;
/**
 * @private
 */
export declare function injectProgObserver(page: Page): Promise<void>;
/**
 * @private
 */
export declare function injectInternalEventHandler(page: Page): Promise<void>;
