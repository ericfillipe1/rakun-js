import { RakunContextManager } from "./context"
import { RakunIterator } from "./iterator"


export type RakunNextResult<T> = RakunNextResultValues<T> | RakunNextResultDone | RakunNextResultPromise<T>

export type RakunNextResultValues<T> = {
    type: 'values',
    values: T[]
}


export type RakunNextResultDone = {
    type: 'done'
}



export type RakunNextResultPromise<T> = {
    type: 'promise',
    promise: Promise<T[]>
}

export interface RakunIteratorSource<T> {
    iterator: RakunIterator<T>
}

export type ReturnUnzip<T> = { [K in keyof T]: T[K] extends RakunIteratorSource<infer R> ? R : never }
export type ReturnUnzipWhen<T> = { [K in keyof T]: [K] extends (value: any) => RakunIteratorSource<infer R> ? R : never }
export type Unzip<T, R extends RakunIteratorSource<any>[]> = [T, ...ReturnUnzip<R>]


export type RakunNext<T> = (ctx: RakunContextManager) => RakunNextResult<T>
export type RakunContextManagerCallback<T> = {
    (contextManager: RakunContextManager): T
}



export type UnpackArrayType<T> = T extends (infer R)[] ? R : T;
export type MergeTuple<A extends any[], B extends any[]> = [...A, ...B];

export interface ErrorConstructor<T> {
    new(...a: any): T;
}
