import { RakunContextManager } from "./context"
import { WrappedValue_OPAQUE } from "./wrapped"

export type RakunContextManagerCallback<T> = {
    (contextManager: RakunContextManager): T
}

export type RakunSource<T> = RakunAsyncIteratorSource<T>

export type RakunAsyncIteratorSource<T> = {
    iterator(ctx: RakunContextManager): AsyncIterator<T>
    readonly [WrappedValue_OPAQUE]: string
}

export interface RakunIteratorSource<T> {
    iterator(ctx: RakunContextManager): Iterator<T>
    readonly [WrappedValue_OPAQUE]: string
}



export type UnpackArrayType<T> = T extends (infer R)[] ? R : T;
export type MergeTuple<A extends any[], B extends any[]> = [...A, ...B];

export interface ErrorConstructor<T> {
    new(...a: any): T;
}
