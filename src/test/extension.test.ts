//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as vscode from 'vscode';
// import * as myExtension from '../extension';

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", function () {

    test("JSON comparsion", function() {
        
        let j1: any = {
            vaca: 6,
            bota: 10
        };
        let j2: any = {
            juba: 7,
            bota: "Leviatã"
        };
        let j3: any = {
            juba:       7,
            "bota": 'Leviatã'
        };
        let j4: any = {
            juba: 7,
            bota: "Leviatã"
        };

        assert.notEqual(j1, j2);
        assert.notEqual(j2, j3);
        assert.notEqual(j2, j4);
        assert.notEqual(JSON.stringify(j1), JSON.stringify(j2));
        assert.equal(JSON.stringify(j2), JSON.stringify(j3));
    });
});