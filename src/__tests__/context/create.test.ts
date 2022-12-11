import context from "../../context";

describe('context create', () => {
    test('test create', () => {
        const MyNameContext = context.create<string | null>(null);

        const getPerson = () => {
            return MyNameContext
                .get()
                .pipe(name => ({ name, email: "test@gmai.com" }))

        }

        const result = MyNameContext.define("TESTE")
            .thenReturn(getPerson())
            .blockFirst();

        const expectValue = { "email": "test@gmai.com", "name": "TESTE" }
        expect(result).resolves.toStrictEqual(expectValue);


    });
});