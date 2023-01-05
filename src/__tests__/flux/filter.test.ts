import flux from "../../flux";

describe('flux filter', () => {
    test('test success', () => {
        const result = flux.just("1", 2, "3")
            .filter(item => item == 2)
            .block();
        const expectValue = [2]
        expect(result).resolves.toStrictEqual(expectValue);

    });

});