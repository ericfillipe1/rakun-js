import flux from "../../flux";
import mono from "../../mono";

describe('flux flatPipe', () => {
    test('test success', () => {
        const result = flux.just("1", 2, "3")
            .flatPipe(txt => mono.just(txt + "--1a"))
            .array()
            .blockFirst();
        const expectValue = [
            "1--1a",
            "2--1a",
            "3--1a"
        ]
        expect(result).resolves.toStrictEqual(expectValue);

    });

});