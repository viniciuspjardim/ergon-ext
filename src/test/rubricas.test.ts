// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as vscode from 'vscode';
// import * as myExtension from '../extension';

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", function () {

    test("Regex", function() {

        let linha1: string = " 1    1  -> .. 1001 R1001                                      -139999999999.00(C)             0.01(P)             0.02(MC)             0.03(MP)";
        let linha2: string = " 1    0  -> ..    0 STARTUP                                                0.00(C)             0.00(P)             0.00(MC)             0.00(MP)";
        
        let rx: RegExp = /^\s*(\d+)\s*(\d+)\s*-> ..\s*(\d+)\s*([a-zA-Z0-9]+)\s*([-+\.0-9]+)\s*\(C\)\s*([-+\.0-9]+)\s*\(P\)\s*([-+\.0-9]+)\s*\(MC\)\s*([-+\.0-9]+)\s*\(MP\)\s*$/ig;

        let dados = rx.exec(linha1);

        console.log(dados);

        if(dados !== null) {
            assert.equal(dados[1], "1"); // periodo
            assert.equal(dados[2], "1"); // id da rubrica
            assert.equal(dados[3], "1001"); // rubrica
            assert.equal(dados[4], "R1001"); // mnemonico
            assert.equal(dados[5], "-139999999999.00"); // valor calculado
            assert.equal(dados[6], "0.01"); // valor pago
            assert.equal(dados[7], "0.02"); // movimento calculado
            assert.equal(dados[8], "0.03"); // movimento pago
        }
        else {
            assert.fail("null", "array", "dados2 == null");
        }
    });
});