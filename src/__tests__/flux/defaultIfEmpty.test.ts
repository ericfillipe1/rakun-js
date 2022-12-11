import flux from "../../flux";

describe('flux filter', () => {
    test('test filter value', () => {
        const result = flux.just("1", 2, "3")
            .filter(item => item == 20)
            .defaultIfEmpty(54)
            .block();
        expect(result).resolves.toStrictEqual([54]);

    });

});