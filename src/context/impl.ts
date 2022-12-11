import { RakunMono } from "../mono/interface";
import { RakunContext } from "./interface";
import { Void } from "../wrapped";
import mono from "../mono";


export class RakunContextImpl<T> implements RakunContext<T>{
    constructor(public defualtValue: T) {
    }
    get(): RakunMono<T> {
        return mono.fromCallBack<T>((ctx) => [ctx.getValue(this)]);
    }
    define(value: T): RakunMono<Void> {
        return mono.fromCallBack<Void>((ctx) => [ctx.setValue(this, value)]);
    }
}
