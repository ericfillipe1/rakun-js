import mono from "../../mono";

describe('flux pipe', () => {

    test('test plus value', () => {
        const result = mono.just("1")
            .pipe(txt => txt + "-a")
            .filter(item => item == "1")
            .blockFirst()

        expect(result).resolves.toStrictEqual(undefined);

    });


});