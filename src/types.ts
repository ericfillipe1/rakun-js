import { RakunContextManager } from "./context"



export type RakunExec<T> = RakunContextManagerCallback<AsyncIterable<T> | Iterable<T>>

export type RakunContextManagerCallback<T> = {
    (contextManager: RakunContextManager): T
}

export type RakunSource<T> = {
    exec(ctx: RakunContextManager): AsyncIterable<T> | Iterable<T>
    blockFirst(contextManager: RakunContextManager): Promise<T> | T
    block(contextManager: RakunContextManager): Promise<T[]> | T[]
}



export type UnpackArrayType<T> = T extends (infer R)[] ? R : T;
export type MergeTuple<A extends any[], B extends any[]> = [...A, ...B];

export interface ErrorConstructor<T> {
    new(...a: any): T;
}
