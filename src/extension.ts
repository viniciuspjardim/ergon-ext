'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import { parseArqRubricas} from './rubricas';


let fs = require('fs');
let panel: vscode.WebviewPanel;

export function activate(context: vscode.ExtensionContext) {

    console.log('ErgonExt init...');

    let disposable = vscode.commands.registerCommand('extension.carregarArquivos', () => {

        // Lendo variaveis do arquivo de configuração do usuario
        let camposPadrao = vscode.workspace.getConfiguration('ergonExt.camposPadrao');
        let pastaExecucao = vscode.workspace.getConfiguration('ergonExt').pastaExecucao;

        // Criando e exibindo um webview
        panel = vscode.window.createWebviewPanel(
            'rubricasPeriodo',
            "Rubricas Periodo",
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        let caminho = vscode.Uri.file(path.join(context.extensionPath, 'src', 'html', 'rubricas.html'));

        // Lendo html do arquivo e inserindo no webview
        panel.webview.html = carregarWebView(caminho.fsPath);

        // Caso os campos padrões existam são enviados para o webview
        if(camposPadrao !== undefined) {
            panel.webview.postMessage({
                acao: "filtro",
                filtro: camposPadrao
            });
        }

        // Cadastrando um listener para mensagens recebidas do webview.
        // Quando a mensagem chegar vai chamar a função parseArqRubricas(...)
        panel.webview.onDidReceiveMessage(mensagem => {
            switch (mensagem.acao) {
                case 'buscar_rubrica':
                    parseArqRubricas(pastaExecucao, mensagem.filtro);
                    return;
            }
        }, undefined, context.subscriptions);
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
    // Enviar mensagens para o webview
    panel.webview.postMessage({ acao: "arquivo_carregado", erro: erro, conteudo: conteudo });
}

export function deactivate() {
    console.log('ErgonExt end');
}