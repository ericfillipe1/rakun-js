export type UnpackArrayType<T> = T extends (infer R)[] ? R : T;
export type MergeTuple<A extends any[], B extends any[]> = [...A, ...B];
export interface ErrorConstructor<T> {
    new (...a: any): T;
}
