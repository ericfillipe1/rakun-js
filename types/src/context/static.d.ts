import { RakunContext, RakunStaticContext } from "./interface";
export declare class RakunStaticContextImpl implements RakunStaticContext {
    create<T>(value: T): RakunContext<T>;
}
export declare const context: RakunStaticContext;
