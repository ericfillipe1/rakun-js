import { flux } from "../..";
import mono from "../../mono";

describe('mono flatPipeMany', () => {
    test('test success', () => {
        const result = mono.just(1)
            .pipe(() => [1, 2, 3])
            .flatPipeMany(flux.fromArray)
            .block()
        expect(result).resolves.toStrictEqual([1, 2, 3]);
    });

    test('test success sum values', () => {
        const list = flux.just(1, 2, 3)
        const result = mono.just(1).flatPipeMany(v1 => list.pipe(v2 => v2 + v1))
            .block();
        expect(result).resolves.toStrictEqual([2, 3, 4]);
    });

});