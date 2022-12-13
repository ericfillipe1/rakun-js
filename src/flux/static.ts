
import { UnpackArrayType } from "../types";
import { RakunFlux, RakunStaticFlux } from "./interface";
import sourceBuild, { RakunCallback, RakunSourceBuild } from "../sourceBuild";
import { RakunFluxImpl } from "./impl";


export class RakunStaticFluxImpl implements RakunStaticFlux {
    fromCallBack<T>(...callbacks: RakunCallback<T>[]): RakunFlux<T> {
        return this.fromSourceBuild<T>(sourceBuild.fromCallback(...callbacks));
    }
    fromSourceBuild<T>(sourceBuild: RakunSourceBuild<T>): RakunFlux<T> {
        return new RakunFluxImpl<T>(sourceBuild);
    }
    fromPromise<T>(promise: Promise<T[]>): RakunFlux<T> {
        return this.fromSourceBuild(sourceBuild.fromArray(promise));
    }
    fromArray<R>(values: R[]): RakunFlux<R> {
        return this.fromSourceBuild(sourceBuild.fromArray(values));
    }
    just<T extends any[]>(...values: T): RakunFlux<UnpackArrayType<T>> {
        return this.fromSourceBuild(sourceBuild.fromArray(values));
    }
}

export const flux: RakunStaticFlux = new RakunStaticFluxImpl();
