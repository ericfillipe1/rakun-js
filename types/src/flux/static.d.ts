import { UnpackArrayType } from "../types";
import { RakunFlux, RakunStaticFlux } from "./interface";
import { RakunCallback } from "../sourceBuild";
export declare class RakunStaticFluxImpl implements RakunStaticFlux {
    fromCallback<T>(...callbacks: RakunCallback<T[] | Promise<T[]> | Promise<T>[]>[]): RakunFlux<T>;
    fromSourceBuild: <T>(sourceBuild: import("../sourceBuild").RakunAsyncIterator<T>) => RakunFlux<T>;
    fromPromise<T>(promise: Promise<T[]>): RakunFlux<T>;
    fromArray<R>(values: R[]): RakunFlux<R>;
    just<T extends any[]>(...values: T): RakunFlux<UnpackArrayType<T>>;
}
export declare const flux: RakunStaticFlux;
