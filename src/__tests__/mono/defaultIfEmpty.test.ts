import mono from "../../mono";

describe('mono defaultIfEmpty', () => {

    test('test success', () => {
        const result = mono.just("1")
            .pipe(txt => txt + "-a")
            .filter(item => item == "1a1")
            .defaultIfEmpty("54")
            .blockFirst()

        expect(result).resolves.toStrictEqual("54");

    });


});