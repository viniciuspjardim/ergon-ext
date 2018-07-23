// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as vscode from 'vscode';
// import * as myExtension from '../extension';

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", function () {

    test("Regex", function() {
        //  1  379 <-  ...... 7119 R7119
        let linha1: string = " 1    1  -> ..... 1001 R1001                                      -139999999999.00(C)             0.01(P)             0.02(MC)             0.03(MP)";
        let linha2: string = " 1    0  -> ..       0 STARTUP                                                0.00(C)             0.00(P)             0.00(MC)             0.00(MP)";
        let linha3: string = "1002: categoria = CARGO COMISSAO; sEVEDados.strReferencia: AE-7; sEVEDados.strTipoEvento: NOMEACAO CC?";

        let rx: RegExp = /^\s*(\d+)\s*(\d+)\s*-> \.+\s*(\d+)\s*([a-zA-Z0-9]+)\s*([-+\.0-9]+)\s*\(C\)\s*([-+\.0-9]+)\s*\(P\)\s*([-+\.0-9]+)\s*\(MC\)\s*([-+\.0-9]+)\s*\(MP\)\s*$/ig;

        let dados1 = rx.exec(linha1);
        rx.lastIndex = 0;
        
        let dados2 = rx.exec(linha2);
        rx.lastIndex = 0;
        
        let dados3 = rx.exec(linha3);
        rx.lastIndex = 0;

        console.log(dados1);
        console.log(dados2);
        console.log(dados3);

        if(dados1 !== null) {

            assert.equal(dados1[1], "1"); // periodo
            assert.equal(dados1[2], "1"); // id da rubrica
            assert.equal(dados1[3], "1001"); // rubrica
            assert.equal(dados1[4], "R1001"); // mnemonico
            assert.equal(dados1[5], "-139999999999.00"); // valor calculado
            assert.equal(dados1[6], "0.01"); // valor pago
            assert.equal(dados1[7], "0.02"); // movimento calculado
            assert.equal(dados1[8], "0.03"); // movimento pago
        }
        else {
            assert.fail("null", "array", "dados1 == null");
        }

        if(dados2 !== null) {

            assert.equal(dados2[1], "1"); // periodo
            assert.equal(dados2[2], "0"); // id da rubrica
            assert.equal(dados2[3], "0"); // rubrica
            assert.equal(dados2[4], "STARTUP"); // mnemonico
            assert.equal(dados2[5], "0.00"); // valor calculado
            assert.equal(dados2[6], "0.00"); // valor pago
            assert.equal(dados2[7], "0.00"); // movimento calculado
            assert.equal(dados2[8], "0.00"); // movimento pago
        }
        else {
            assert.fail("null", "array", "dados2 == null");
        }

        assert.equal(dados3, null);
    });
});