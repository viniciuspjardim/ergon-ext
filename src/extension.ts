'use strict';

/*
 * Autor: Vinícius Petrocione Jardim
 */

import * as vscode from 'vscode';
import { Controlador } from './controlador';

export let panel: vscode.WebviewPanel;
export let controlador: Controlador;

export function activate(context: vscode.ExtensionContext) {

    const carregarArquivos = vscode.commands.registerCommand('extension.carregarArquivos', async () => {
        controlador = new Controlador(context);
        if(await controlador.carregarWebView()) {
            await controlador.carregarNomeRubricas();
            await controlador.carregarFiltro();
            await controlador.descobrirDados();
        }
    });

    const caminhoExecucao = vscode.commands.registerCommand('extension.caminhoExecucao', async () => {
        const caminho: vscode.Uri[] | undefined = await vscode.window.showOpenDialog({
            canSelectFiles: false, canSelectFolders: true
        });
        if(caminho) {
            try {
                await context.globalState.update('caminhoExecucao', caminho[0].fsPath);
            }
            catch(e) {
                vscode.window.showErrorMessage('Erro ao salvar propriedade');
            }
        }
    });

    const charsetExecucao = vscode.commands.registerCommand('extension.charsetExecucao', async () => {
        const charset: string | undefined = await vscode.window.showQuickPick(
            ['1252', 'utf8']
        );
        if(charset) {
            try {
                await context.globalState.update('charsetExecucao', charset);
            }
            catch(e) {
                vscode.window.showErrorMessage('Erro ao salvar propriedade');
            }
        }
    });

    const caminhoRubricas = vscode.commands.registerCommand('extension.caminhoRubricas', async () => {
        const caminho: vscode.Uri[] | undefined = await vscode.window.showOpenDialog({
            canSelectFiles: true, canSelectFolders: false
        });
        if(caminho) {
            try {
                await context.globalState.update('caminhoRubricas', caminho[0].fsPath);
            }
            catch(e) {
                vscode.window.showErrorMessage('Erro ao salvar propriedade');
            }
        }
    });

    const charsetRubricas = vscode.commands.registerCommand('extension.charsetRubricas', async () => {
        const charset: string | undefined = await vscode.window.showQuickPick(
            ['1252', 'utf8']
        );
        if(charset) {
            try {
                await context.globalState.update('charsetRubricas', charset);
            }
            catch(e) {
                vscode.window.showErrorMessage('Erro ao salvar propriedade');
            }
        }
    });

    context.subscriptions.push(carregarArquivos);
    context.subscriptions.push(caminhoExecucao);
    context.subscriptions.push(charsetExecucao);
    context.subscriptions.push(caminhoRubricas);
    context.subscriptions.push(charsetRubricas);
}

export function deactivate() {
    if(controlador) {
        controlador.dispose();
    }
    console.log('ErgonExt fim!');
}
