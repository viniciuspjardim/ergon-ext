'use strict';

import * as vscode from 'vscode';
import { Controlador } from './controlador';

export let panel: vscode.WebviewPanel;
export let controlador: Controlador;

export function activate(context: vscode.ExtensionContext) {

    console.log('ErgonExt init...');

    let disposable = vscode.commands.registerCommand('extension.carregarArquivos', () => {
        controlador = new Controlador(context);
        controlador.carregarWebView();
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
    console.log('ErgonExt end');
}