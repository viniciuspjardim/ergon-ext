'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import * as vscode from 'vscode';
import * as path from 'path';
import { parseArqRubricas, Contexto } from './cache';

let fs = require('fs');

let panel: vscode.WebviewPanel;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('ErgonExt init...');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.carregarArquivos', () => {
        // The code you place here will be executed every time your command is executed

        let c: Contexto = new Contexto();

        c.ambiente = "delta";
        c.servidorCalculo = "SRVFVJ";
        c.tipoCalculo = "VJ";
        c.mesAnoFol = new Date(2016, 4, 1);
        c.numFol = 34;
        c.execucao = 1;

        c.numFunc = 1245988;
        c.numVinc = 3;
        c.mesAnoRub = new Date(2016, 5, 1);
        c.seqFunc = 2;
        c.seqVinc = 1;
        c.rubrica = 1001;
        c.complemento = "";
        c.periodo = 0;
        c.tipo = "entra";
        
        parseArqRubricas(c);
        
        // Create and show a new webview
        panel = vscode.window.createWebviewPanel(
            'rubricasPeriodo', // Identifies the type of the webview. Used internally
            "Rubricas Periodo", // Title of the panel displayed to the user
            vscode.ViewColumn.One, // Editor column to show the new webview panel in.
            { enableScripts: true } // Webview options. More on these later.
        );

        // And set its HTML content
        let caminho = vscode.Uri.file(path.join(context.extensionPath, 'src', 'html', 'rubricas.html'));

        panel.webview.html = carregarWebView(caminho.fsPath);
    });

    context.subscriptions.push(disposable);
}

export function carregarWebView(caminho: string): string {
    return fs.readFileSync(caminho, 'utf8');
}

export function atualizarWebView(erro: boolean, conteudo: string) {
    if(erro) {
        conteudo = "Falha ao carregar arquivo";
    }
    panel.webview.postMessage({ erro: erro, conteudo: conteudo });
}

// this method is called when your extension is deactivated
export function deactivate() {
    console.log('ErgonExt end');
}