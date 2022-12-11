import mono from "../../mono";

describe('mono zip', () => {
    test('zipWhen', () => {
        const result = mono.just(1)
            .flatPipe(() => mono.empty<string>())
            .zipWhen((r) => mono.just(r + "-test"), (r) => mono.just(r + 5))
            .pipe(([m1, m2, m3]) => `${m1},${m2},${m3}`)
            .blockFirst()
        expect(result).resolves.toStrictEqual(undefined);
    });

});