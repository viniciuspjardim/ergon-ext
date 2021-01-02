'use strict';

import { Rubricas } from './rubricas';

// Rodar testes no modo watch
// npm run test -- --watch

describe('periodoRegex', () => {

    it('lê perido, data inicial, final e número de dias', () => {
        const parser: Rubricas = new Rubricas('pasta');
        const linha = '  -   00   :   20180801-20180831      31 dias  ';
        const result = parser['periodoRegex'].exec(linha);

        ['00', '20180801', '2018', '08', '01', '20180831', '31']
            .forEach((val) => { expect(result).toContainEqual(val); });
    });
});

describe('rubricaEntraRegex', () => {

    it('lê número da rubrica, valor padrão e valor zerado', () => {
        const parser: Rubricas = new Rubricas('pasta');
        const linha = ' 1  100  -> .... 1101 R1101    -13999.00(C)    0.00(P)    0.00(MC)    0.00(MP) ';
        const result = parser['rubricaEntraRegex'].exec(linha);

        ['1101', '-13999.00', '0.00']
            .forEach((val) => { expect(result).toContainEqual(val); });
    });

    it('lê mnemônico, valor pago e valor zerado', () => {
        const parser: Rubricas = new Rubricas('pasta');
        const linha = '  0    1  -> .. 1001 R1001    -13999.00(C)    2227.53(P)    100(MC)    0.00(MP)  ';
        const result = parser['rubricaEntraRegex'].exec(linha);

        ['R1001', '2227.53', '0.00', '100']
            .forEach((val) => { expect(result).toContainEqual(val); });
    });

    it('lê complemento', () => {
        const parser: Rubricas = new Rubricas('pasta');
        const linha = '1  151  -> .. 1240 R1240    2017    -13999.00(C)    0.00(P)    0.00(MC)    0.00(MP)';
        const result = parser['rubricaEntraRegex'].exec(linha);

        ['2017']
            .forEach((val) => { expect(result).toContainEqual(val); });
    });

    it('lê complemento com caracteres especiais e espaço', () => {
        const parser: Rubricas = new Rubricas('pasta');
        const linha = ' 1  240  -> .. 3226 R322   Cartão Crédito I    -139.00(C)    0.00(P)    0.00(MC)    0.00(MP)';
        const result = parser['rubricaEntraRegex'].exec(linha);

        ['Cartão Crédito I']
            .forEach((val) => { expect(result).toContainEqual(val); });
    });

    it('lê linhas de STARTUP', () => {
        const parser: Rubricas = new Rubricas('pasta');
        const linha = ' 1    0  -> ..    0 STARTUP    0.00(C)    0.00(P)     0.00(MC)    0.00(MP)';
        const result = parser['rubricaEntraRegex'].exec(linha);

        ['STARTUP']
            .forEach((val) => { expect(result).toContainEqual(val); });
    });
});

describe('rubricaSaiRegex', () => {

    it('lê complemento com caracteres especiais e espaço e lê valores', () => {
        const parser: Rubricas = new Rubricas('pasta');
        const linha = ' 1    2 <-  .... 3226 R322   Cartão Crédito I    -139.00(C)    0.00(P)    0.00(MC)    0.00(MP)';
        const result = parser['rubricaSaiRegex'].exec(linha);

        ['Cartão Crédito I', '-139.00', '0.00']
            .forEach((val) => { expect(result).toContainEqual(val); });
    });

    it('lê linhas de STARTUP', () => {
        const parser: Rubricas = new Rubricas('pasta');
        const linha = '  1    0 <-  ..    0 STARTUP    0.00(C)    0.00(P)     0.00(MC)    0.00(MP)';
        const result = parser['rubricaSaiRegex'].exec(linha);

        ['STARTUP']
            .forEach((val) => { expect(result).toContainEqual(val); });
    });
});

describe('construirCaminho', () => {

    it('sem os campos deve lançar uma excessão', () => {
        const parser: Rubricas = new Rubricas('pasta');
        expect(() => parser.construirCaminho({}, 'abrirRubPer')).toThrow();
    });
});
