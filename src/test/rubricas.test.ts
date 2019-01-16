import { Rubricas } from '../rubricas';

describe('construirCaminho', () => {

    it('sem os campos deve lançar uma excessão', () => {
        const parser: Rubricas = new Rubricas('pasta');
        expect(() => parser.construirCaminho({}, 'abrirRubPer')).toThrow();
    });

    it('Passa', () => {
        expect(0).toBe(0);
    });
});