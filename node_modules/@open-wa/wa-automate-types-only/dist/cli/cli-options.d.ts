import { AnyFlag } from "meow";
import { Merge } from "type-fest";
export declare const optionList: Merge<Merge<{
    name?: string;
    description?: string;
    typeLabel?: string;
}, AnyFlag>, {
    type?: typeof Boolean | typeof Number | typeof String;
}>[];
