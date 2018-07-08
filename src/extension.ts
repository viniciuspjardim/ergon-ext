'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { parseArqRubricas, Contexto } from './cache';

var panel: any;

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
        panel.webview.html = criarWebView();
    });

    context.subscriptions.push(disposable);
}

export function atualizarWebView(erro: boolean, conteudo: string) {
    if(erro) {
        conteudo = "Falha ao carregar arquivo";
    }
    panel.webview.postMessage({ erro: erro, conteudo: conteudo });
}

export function criarWebView(): string {
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <title>Rubricas Periodo</title>
        <style>
            body {
                margin: 10px 5px 0px 0px;
            }
            .arquivo {
                font-size: 16px;
            }
</style>
    </head>
    <body>
        <form>
            <div>
                <samp>Ambiente<input id="ambiente"/></samp>
                <samp>ServCalc<input id="servidorCalculo"/></samp>
                <samp>TipoCalc<input id="tipoCalculo"/></samp>
                <samp>MesAnoFol<input id="mesAnoFol"/></samp>
                <samp>NumFol<input id="numFol"/></samp>
                <samp>Exec<input id="execucao"/></samp>
                <samp>Func<input id="numFunc"/></samp>
                <samp>Vinc<input id="numVinc"/></samp>
                <samp>MesAno<input id="mesAnoRub"/></samp>
                <samp>SeqFunc<input id="seqFunc"/></samp>
                <samp>SeqVinc<input id="seqVinc"/></samp>
                <samp>Rub<input id="rubrica"/></samp>
                <samp>Cpl<input id="complemento"/></samp>
                <samp>Per<input id="periodo"/></samp>
                <samp>Tipo<input id="tipo"/></samp>
                <button type="button">Ok</button>
            </div>
        </form>
        <div class="arquivo">
            <pre id="conteudo">Nada para exibir</pre>
        </div>
        <script>
            // Handle the message inside the webview
            window.addEventListener('message', event => {
                const message = event.data; // The JSON data our extension sent
                document.getElementById("conteudo").innerHTML = message.conteudo; 
            });
        </script>
    </body>
    </html>`;
}

// this method is called when your extension is deactivated
export function deactivate() {
    console.log('ErgonExt end');
}