import { RakunMono } from "../mono/interface";
import { RakunContext } from "./interface";
import { Void } from "../wrapped";
export declare class RakunContextImpl<T> implements RakunContext<T> {
    defualtValue: T;
    constructor(defualtValue: T);
    get(): RakunMono<T>;
    define(value: T): RakunMono<typeof Void>;
}
