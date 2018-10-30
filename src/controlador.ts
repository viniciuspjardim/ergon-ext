'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import { ES } from './es';
import { Rubricas } from './rubricas';

/** Classe de entrada e saida de dados */
export class Controlador {

    private context: vscode.ExtensionContext;
    private panel: vscode.WebviewPanel;
    /** Preferências do usuário */
    private pref: vscode.WorkspaceConfiguration;
    private rubricas: Rubricas;
    private caminhoArq: string;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.panel = vscode.window.createWebviewPanel(
            'rubricasPeriodo',
            'Rubricas Periodo',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        // Lendo variaveis do arquivo de configuração do usuario
        this.pref = vscode.workspace.getConfiguration('ergonExt');

        this.rubricas = new Rubricas(this.pref.caminhoExecucao);
        this.caminhoArq = '';

        this.adicionarListenerWebview();
    }

    /** Carrega o arquivo html do webview e envia mensagem com os campos padrão */
    public carregarWebView(): void {

        const caminho: vscode.Uri = vscode.Uri.file(path.join(this.context.extensionPath, 'html', 'rubricas.html'));
        this.panel.webview.html =  ES.lerArquivoSync(caminho.fsPath, 'utf8');
        
        if(this.pref.camposPadrao) {
            ES.enviarParaWebviw(this.panel, 'filtro', this.pref.camposPadrao, 500);
        }
    }

    public carregarNomeRubricas(): void {
        const jsonStr: string =  ES.lerArquivoSync(this.pref.caminhoRubricas, this.pref.charsetRubricas);
        const json: any = JSON.parse(jsonStr);
        let nomeRubricas: any = {};

        for(let rubrica of json.rubricas) {
            nomeRubricas[`${rubrica.rubrica}`] = rubrica;
        }
        this.rubricas.setNomeRubricas(nomeRubricas);
    }

    /**
     * Cadastrando um listener para mensagens recebidas do webview.
     * Quando a mensagem chegar vai chamar a função parseArqRubricas(...)
     */
    private adicionarListenerWebview(): void {

        this.panel.webview.onDidReceiveMessage(mensagem => {

            let caminho: string;
            let mensagemErr: string;

            // Se mensagem recebida do webview 'abrirRubPer' ou 'abrirRubLiq'
            if(mensagem.acao === 'abrirRubPer' || mensagem.acao === 'abrirRubLiq') {

                caminho = this.rubricas.construirCaminho(mensagem.filtro, mensagem.acao);

                // É o mesmo arquivo, então não precisa ser carregado novamente
                if(caminho === this.caminhoArq) {
                    ES.enviarParaWebviw(this.panel, 'parse_rubrica_ok', {texto: null, index: null});
                    return;
                }

                // Começa a ler o arquivo de rubricas periodo, total ou liquido e cadastra o
                // callback pra quando terminar a leitura
                ES.lerArquivo(caminho, (data: string, erro?: NodeJS.ErrnoException) => {
                    if(erro) {
                        this.caminhoArq = '';
                        mensagemErr = '<span class="mensagemErr">Erro ao ler arquivo</span>';
                        ES.enviarParaWebviw(this.panel, 'parse_rubrica_err', mensagemErr);
                    }
                    else {
                        this.caminhoArq = caminho;
                        const resultado: any = this.rubricas.parseArqRubricas(data);
                        ES.enviarParaWebviw(this.panel, 'parse_rubrica_ok', resultado);
                    }
                }, this.pref.charsetExecucao);

                return;
            }
            // Se mensagem recebida do webview 'abrirLogErro' ou 'abrirDump'
            else if(mensagem.acao === 'abrirLogErro' || mensagem.acao === 'abrirDump') {

                caminho = this.rubricas.construirCaminho(mensagem.filtro, mensagem.acao);

                // Começa a ler o arquivo de log/debug ou dump de dados da execução e
                // cadastra o callback pra quando terminar a leitura
                ES.lerArquivo(caminho, (data: string, erro?: NodeJS.ErrnoException) => {
                    if(erro) {
                        this.caminhoArq = '';
                        mensagemErr = '<span class="mensagemErr">Erro ao ler arquivo</span>';
                        ES.enviarParaWebviw(this.panel, 'parse_rubrica_err', mensagemErr);
                    }
                    else {
                        this.caminhoArq = caminho;
                        const resultado: any = this.rubricas.parseArqRubricas(data);
                        ES.enviarParaWebviw(this.panel, 'parse_rubrica_ok', resultado);
                    }
                }, this.pref.charsetExecucao);
                return;
            }
        }, undefined, this.context.subscriptions);
    }
}