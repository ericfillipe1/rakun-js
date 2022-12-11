import mono from "../../mono";

describe('flux pipe', () => {

    test('test plus value', () => {
        const result = mono.just("1")
            .pipe(txt => txt + "-a")
            .blockFirst()

        const expectValue = "1-a"
        expect(result).resolves.toStrictEqual(expectValue);

    });


});