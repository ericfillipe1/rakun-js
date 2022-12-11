
import { Void, VoidValue } from "../wrapped";
import { fromCallback, fromAsyncIterator } from "./impl";
import { RakunSourceBuild, RakunSource, RakunStaticSourceBuild, ReturnUnzip, RakunCallback } from "./interface";



export class StaticSourceBuildImpl implements RakunStaticSourceBuild {
    fromCallback<R>(...callbacks: RakunCallback<R>[]): RakunSourceBuild<R> {
        return fromCallback(...callbacks);
    }
    just<T>(...promises: Promise<T>[] | T[]): RakunSourceBuild<T> {
        return fromCallback<T>(() => promises)
    }
    fromArray<R>(values: R[] | Promise<R[]>): RakunSourceBuild<R> {
        return fromCallback(() => values);
    }
    returnVoid(): RakunSourceBuild<Void> {
        return fromCallback<Void>(() => [VoidValue])
    }
    empty<T>(): RakunSourceBuild<T> {
        return fromCallback(() => [])
    }
    zip<R extends RakunSource<any>[]>(...sources: R): RakunSourceBuild<[...ReturnUnzip<R>]> {
        return fromAsyncIterator((ctx) => {
            let finish = false
            return {
                [Symbol.asyncIterator]: () => {
                    let asyncIterator: AsyncIterator<[...ReturnUnzip<R>]> = {
                        async next() {
                            if (!finish) {
                                finish = true;
                                let value = await Promise.all(sources.map(source => source.asyncIterator(ctx).next()))
                                    .then(array => array.map(item => item.done ? null : item.value));
                                return {
                                    done: false,
                                    value: value as [...ReturnUnzip<R>]
                                }
                            }
                            return {
                                done: true,
                                value: null
                            }
                        }
                    };
                    return asyncIterator;
                }
            }
        })
    }
    error<T>(error: any): RakunSourceBuild<T> {
        return fromCallback<T>(async () => {
            throw error
        })
    }

}

export const sourceBuild: RakunStaticSourceBuild = new StaticSourceBuildImpl();
