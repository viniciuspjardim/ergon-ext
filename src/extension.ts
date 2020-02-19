'use strict';

/*
 * Autor: Vinícius Petrocione Jardim
 */

import * as vscode from 'vscode';
import { Controlador } from './controlador';

export let panel: vscode.WebviewPanel;
export let controlador: Controlador;

export function activate(context: vscode.ExtensionContext) {

    console.log('ErgonExt inicio...');

    let disposable = vscode.commands.registerCommand('extension.carregarArquivos', () => {
        controlador = new Controlador(context);
        controlador.carregarWebView();
        controlador.carregarNomeRubricas();
        controlador.carregarFiltro();
        controlador.descobrirDados();
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
    if(controlador) {
        controlador.dispose();
    }
    console.log('ErgonExt fim!');
}
