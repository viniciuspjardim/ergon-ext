'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import { ES } from './es';
import { Rubricas } from './rubricas';

/** Classe de entrada e saida de dados */
export class Controlador {

    private context: vscode.ExtensionContext;
    private panel: vscode.WebviewPanel;
    private camposPadrao: vscode.WorkspaceConfiguration;
    private pastaExecucao: string;
    private rubricas: Rubricas;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.panel = vscode.window.createWebviewPanel(
            'rubricasPeriodo',
            'Rubricas Periodo',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        // Lendo variaveis do arquivo de configuração do usuario
        this.camposPadrao = vscode.workspace.getConfiguration('ergonExt.camposPadrao');
        this.pastaExecucao = vscode.workspace.getConfiguration('ergonExt').pastaExecucao;

        this.rubricas = new Rubricas(this.pastaExecucao);

        this.adicionarListenerWebview();
    }

    /** Carrega o arquivo html do webview e envia mensagem com os campos padrão */
    public carregarWebView(): void {

        const caminhoHTML: vscode.Uri = vscode.Uri.file(path.join(this.context.extensionPath, 'src', 'html', 'rubricas.html'));
        this.panel.webview.html =  ES.lerArquivoSync(caminhoHTML.fsPath, 'utf8');
        
        if(this.camposPadrao) {
            ES.enviarParaWebviw(this.panel, 'filtro', this.camposPadrao, 500);
        }
    }

    /**
     * Cadastrando um listener para mensagens recebidas do webview.
     * Quando a mensagem chegar vai chamar a função parseArqRubricas(...)
     */
    private adicionarListenerWebview(): void {

        this.panel.webview.onDidReceiveMessage(mensagem => {
            switch (mensagem.acao) {

                // Se mensagem recebida do webview 'buscar_rubrica'
                case 'parse_rubrica':

                    const caminho: string = this.rubricas.construirCaminho(mensagem.filtro);
                    
                    // Começa a ler o arquivo de log/debug de rubircas e cadastra o callback pra
                    // quando terminar a leitura
                    ES.lerArquivo(caminho, (data: string, erro?: NodeJS.ErrnoException) => {
                        if(erro) {
                            const mensagemErr: string = '<span class="mensagemErr">Erro ao ler arquivo</span>';
                            ES.enviarParaWebviw(this.panel, 'parse_rubrica_err', mensagemErr);
                        }
                        else {
                            const resultado: any = this.rubricas.parseArqRubricas(data);
                            ES.enviarParaWebviw(this.panel, 'parse_rubrica_ok', resultado);
                        }
                    }, '1252');
                    return;

                // Se mensagem recebida do webview 'buscar_rubrica'
                case 'abrir_log_erro':
                    return;
            }
        }, undefined, this.context.subscriptions);
    }
}