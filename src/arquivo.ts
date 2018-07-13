'use strict';

import * as vscode from 'vscode';

export class Arquivo {

    private panel: vscode.WebviewPanel;

    constructor(panel: vscode.WebviewPanel) {
        this.panel = panel;
    }

    public enviarParaWebviw(acao: string, conteudo: any, delay?: number) {
        const mensagem: any  = {
            acao: acao,
            conteudo: conteudo
        };

        if(!delay) {
            this.panel.webview.postMessage(mensagem);
        }
        else {
            setTimeout(() => {this.panel.webview.postMessage(mensagem);}, delay);
        }
    }
}