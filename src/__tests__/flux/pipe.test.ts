import flux from "../../flux";

jest.useFakeTimers()

describe('flux pipe', () => {
    test('test async', () => {
        const result = flux.just(30, 10, 20)
            .pipe(n => {
                return n + "-a"
            })
            .array()
            .blockFirst()

        const expectValue = [
            "30-a",
            "10-a",
            "20-a"
        ]

        expect(result).resolves.toStrictEqual(expectValue);

    });

    test('test plus value', () => {
        const result = flux.just("1", 2, "3")
            .pipe(txt => txt + "-a")
            .array()
            .blockFirst()

        const expectValue = ["1-a", "2-a", "3-a"]

        expect(result).resolves.toStrictEqual(expectValue);

    });


});