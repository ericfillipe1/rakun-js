import mono from "../../mono";

describe('mono pipe', () => {

    test('test concat value', () => {
        const result = mono.just("1")
            .pipe(txt => txt + "-a")
            .blockFirst()

        const expectValue = "1-a"
        expect(result).resolves.toStrictEqual(expectValue);

    });


});