import meow, { AnyFlags } from 'meow';
import { Merge, JsonObject } from 'type-fest';
import { ConfigObject } from '../api/model/config';
import { Spin } from '../controllers/events';
export declare const optionKeys: string[];
export declare const optionKeysWithDefalts: string[];
export declare const PrimitiveConverter: {
    Number: number;
    Boolean: boolean;
    String: string;
};
export declare const cliOptionNames: import("type-fest").Simplify<import("type-fest/source/merge").Merge_<import("type-fest").Simplify<import("type-fest/source/merge").Merge_<{
    name?: string;
    description?: string;
    typeLabel?: string;
}, meow.AnyFlag>>, {
    type?: StringConstructor | BooleanConstructor | NumberConstructor;
}>>;
export declare const meowFlags: () => AnyFlags;
export declare const helptext: string;
export declare const envArgs: () => JsonObject;
export declare const configFile: (config?: string) => Promise<JsonObject>;
export declare const cli: () => Promise<{
    createConfig: ConfigObject;
    cliConfig: Merge<ConfigObject, {
        [k: string]: any;
    }>;
    PORT: number;
    spinner: Spin;
}>;
