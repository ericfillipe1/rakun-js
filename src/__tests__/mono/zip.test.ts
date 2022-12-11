import mono from "../../mono";

describe('mono zip', () => {
    test('success', () => {
        const result = mono.just(1)
            .zip(mono.just("2"), mono.just(3))
            .pipe(([m1, m2, m3]) => `${m1},${m2},${m3}`)
            .blockFirst()
        const expectValue = "1,2,3"
        expect(result).resolves.toStrictEqual(expectValue);
    });

});