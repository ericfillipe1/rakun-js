import mono from "../../mono";

describe('mono static zip', () => {
    test('test concat value', () => {
        const result = mono.zip(mono.just(1), mono.just("2"), mono.just("3"))
            .pipe(([m1, m2, m3]) => `${m1},${m2},${m3}`)
            .blockFirst()
        const expectValue = "1,2,3"
        expect(result).resolves.toStrictEqual(expectValue);
    });

});