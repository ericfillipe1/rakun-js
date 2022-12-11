


import { RakunCallback, RakunSourceBuild, ReturnUnzip } from "../sourceBuild";
import { sourceBuild } from "../sourceBuild/static";
import { Void } from "../wrapped";
import { fromSourceBuild } from "./impl";
import { RakunMono, RakunStaticMono } from "./interface";

export class StaticMonoImpl implements RakunStaticMono {
    fromCallBack<T>(...callbacks: RakunCallback<T>[]): RakunMono<T> {
        return this.fromSourceBuild<T>(sourceBuild.fromCallback(...callbacks));
    }
    fromSourceBuild<T>(p: RakunSourceBuild<T>): RakunMono<T> {
        return fromSourceBuild(p)
    }
    returnVoid(): RakunMono<Void> {
        return this.fromSourceBuild(sourceBuild.returnVoid())
    }
    empty<T>(): RakunMono<T> {
        return this.fromSourceBuild(sourceBuild.empty())
    }
    zip<T extends RakunMono<any>[]>(...monoArray: T): RakunMono<ReturnUnzip<T>> {
        return this.fromSourceBuild<ReturnUnzip<T>>(sourceBuild.zip<T>(...monoArray))
    }
    just<T>(value: T): RakunMono<T> {
        return this.fromSourceBuild<T>(sourceBuild.just(value));
    }
    fromPromise<T>(promise: Promise<T>) {
        return this.fromSourceBuild<T>(sourceBuild.just(promise));
    }
    error<T>(error: any) {
        return this.fromSourceBuild<T>(sourceBuild.error(error));
    }
}

export const mono: RakunStaticMono = new StaticMonoImpl();