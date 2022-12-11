import { UnpackArrayType } from "../types";
import { RakunFlux, RakunStaticFlux } from "./interface";
import { RakunSourceBuild } from "../sourceBuild";
export declare class RakunStaticFluxImpl implements RakunStaticFlux {
    fromSourceBuild<T>(sourceBuild: RakunSourceBuild<T>): RakunFlux<T>;
    fromPromise<T>(promise: Promise<T[]>): RakunFlux<T>;
    fromArray<R>(values: R[]): RakunFlux<R>;
    just<T extends any[]>(...values: T): RakunFlux<UnpackArrayType<T>>;
}
export declare const flux: RakunStaticFlux;
