'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import { ES } from './es';
import { Rubricas } from './rubricas';
import { Dump } from './dump';
import { Descobrir } from './descobrir';
import { Erros } from './erros';

/** Classe de entrada e saida de dados */
export class Controlador {

    private context: vscode.ExtensionContext;
    private panel: vscode.WebviewPanel;
    /** Preferências do usuário */
    private pref: vscode.WorkspaceConfiguration;

    private ultimoFiltro: any = null;

    private descobrir: Descobrir;
    private rubricas: Rubricas;
    private dump: Dump;
    private erros: Erros;
    // private arquivoBase: ArquivoBase;

    private caminhoArq: string;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;

        // Lendo variaveis do arquivo de configuração do usuario
        this.pref = vscode.workspace.getConfiguration('ergonExt');

        this.panel = vscode.window.createWebviewPanel(
            'rubricasPeriodo',
            'Ergon Ext',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );
        
        this.descobrir = new Descobrir(this.pref.caminhoExecucao);
        this.rubricas = new Rubricas(this.pref.caminhoExecucao);
        this.dump = new Dump(this.pref.caminhoExecucao);
        this.erros = new Erros(this.pref.caminhoExecucao);
        // this.arquivoBase = new ArquivoBase(this.pref.caminhoExecucao);
        this.caminhoArq = '';

        this.adicionarListenerWebview();
    }

    /** Carrega o arquivo html do webview e envia mensagem com os campos padrão */
    public carregarWebView(): void {
        
        try {
            // Lendo o arquivo HTML
            const caminho: vscode.Uri = vscode.Uri.file(path.join(this.context.extensionPath, 'html', 'rubricas.html'));
            this.panel.webview.html =  ES.lerArquivoSync(caminho.fsPath, 'utf8');
            
            // Lendo o arquivo de filtro caso exista, se não tenta pegar das preferências do vscode
            const homedir: string = require('os').homedir();
            
            ES.lerArquivo(path.join(homedir, 'AppData/Roaming/ErgonExtFiltro.json'), (data: string, erro?: NodeJS.ErrnoException) => {
                
                if(erro) {
                    console.log(`Aviso: ${erro}`);

                    if(this.pref.camposPadrao) {
                        ES.enviarParaWebviw(this.panel, 'filtro', this.pref.camposPadrao, 300);
                    }
                }
                else {
                    ES.enviarParaWebviw(this.panel, 'filtro', JSON.parse(data), 300);
                }
            });

            // Criando o callback para quando o painel for fechado. Salva os campos do filtro em um arquivo
            this.panel.onDidDispose(() => {
                this.salvarFiltro();
                console.log('ErgonExt dispose');
            }, null, this.context.subscriptions);
        }
        catch(e) {
            console.log(`Erro: ${e}`);
        }
    }

    /** Carrega o arquivo com os nomes das rubricas */
    public carregarNomeRubricas(): void {
        try {
            const jsonStr: string =  ES.lerArquivoSync(this.pref.caminhoRubricas, this.pref.charsetRubricas);
            const json: any = JSON.parse(jsonStr);
            let nomeRubricas: any = {};

            for(let rubrica of json.rubricas) {
                nomeRubricas[`${rubrica.rubrica}`] = rubrica;
            }
            this.rubricas.setNomeRubricas(nomeRubricas);
        }
        catch(e) {
            console.log(`Erro: ${e}`);
            this.rubricas.setNomeRubricas({});
        }
    }

    /** Percorre as pastas de execução buscando por dados para preecher os formulários */
    public descobrirDados(): void {
        try {
            this.descobrir.percorrerPastas();
            if(this.descobrir.raiz) {
                ES.enviarParaWebviw(this.panel, 'auto_completar', this.descobrir.raiz, 400);
            }
        }
        catch(e) {
            console.log(`Erro: ${e}`);
        }
    }

    /**
     * Cadastrando um listener para mensagens recebidas do webview.
     * Quando a mensagem chegar vai chamar a função parseArqRubricas(...)
     */
    private adicionarListenerWebview(): void {

        this.panel.webview.onDidReceiveMessage(mensagem => {

            let caminho: string;
            let mensagemErr: string;

            if(mensagem.filtro) {
                this.ultimoFiltro = mensagem.filtro;
            }

            // Se mensagem recebida do webview for 'abrirRubPer' ou 'abrirRubLiq'
            if(mensagem.acao === 'abrirRubPer' || mensagem.acao === 'abrirRubLiq') {

                caminho = this.rubricas.construirCaminho(mensagem.filtro, mensagem.acao);

                // O arquivo não precisa ser recarregado quando é o mesmo caminho e não tem flag
                // para forçar o recarregamento
                if(!mensagem.forcar && caminho === this.caminhoArq) {
                    ES.enviarParaWebviw(this.panel, 'parse_rubrica_ok', {texto: null, index: null});
                    console.log('Caminhos iguais');
                    return;
                }

                // Refaz a execução do descobrir dados
                if(mensagem.forcar) {
                    this.descobrirDados();
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
                        const resultado: any = this.rubricas.parseArquivo(data);
                        ES.enviarParaWebviw(this.panel, 'parse_rubrica_ok', resultado);
                    }
                }, this.pref.charsetExecucao);

                return;
            }
            // Se mensagem recebida do webview for 'abrirLogErro'
            else if(mensagem.acao === 'abrirLogErro') {

                caminho = this.erros.construirCaminho(mensagem.filtro, mensagem.acao);

                // Começa a ler o arquivo de log/debug de dados da execução e cadastra
                // o callback pra quando terminar a leitura
                ES.lerArquivo(caminho, (data: string, erro?: NodeJS.ErrnoException) => {
                    if(erro) {
                        this.caminhoArq = '';
                        mensagemErr = '<span class="mensagemErr">Erro ao ler arquivo</span>';
                        ES.enviarParaWebviw(this.panel, 'parse_rubrica_err', mensagemErr);
                    }
                    else {
                        this.caminhoArq = caminho;
                        const resultado: any = this.erros.parseArquivo(data);
                        ES.enviarParaWebviw(this.panel, 'parse_rubrica_ok', resultado);
                    }
                }, this.pref.charsetExecucao);
                
                return;
            }
            // Se mensagem recebida do webview for 'abrirDump'
            else if(mensagem.acao === 'abrirDump') {

                caminho = this.dump.construirCaminho(mensagem.filtro, mensagem.acao);

                // Começa a ler o arquivo de dump de dados da execução e cadastra
                // o callback pra quando terminar a leitura
                ES.lerArquivo(caminho, (data: string, erro?: NodeJS.ErrnoException) => {
                    if(erro) {
                        this.caminhoArq = '';
                        mensagemErr = '<span class="mensagemErr">Erro ao ler arquivo</span>';
                        ES.enviarParaWebviw(this.panel, 'parse_rubrica_err', mensagemErr);
                    }
                    else {
                        this.caminhoArq = caminho;
                        const resultado: any = this.dump.parseArquivo(data);
                        ES.enviarParaWebviw(this.panel, 'parse_rubrica_ok', resultado);
                    }
                }, this.pref.charsetExecucao);

                return;
            }
            // Se mensagem recebida do webview for 'abrirCaminho'
            else if(mensagem.acao === 'abrirCaminho') {

                caminho = mensagem.caminho;
                console.log(caminho);

                let uri = vscode.Uri.file(caminho);
                
                let range;

                if(mensagem.linha) {
                    range = new vscode.Range((+mensagem.linha)-1, 0, +mensagem.linha-1, 200);
                }
                else {
                    range = new vscode.Range(0, 0, 0, 0);
                }

                // Abre o arquivo em uma nova guia
                vscode.window.showTextDocument(uri, {selection: range});
            }
            
        }, undefined, this.context.subscriptions);
    }

    /** Salva o ultimo filtro */
    public salvarFiltro(): void {

        if(!this.ultimoFiltro) {
            return;
        }
        try {
            const homedir: string = require('os').homedir();
            ES.escreverArquivoSync(path.join(homedir, 'AppData/Roaming/ErgonExtFiltro.json'), JSON.stringify(this.ultimoFiltro));
        }
        catch(e) {
            console.log(`Erro: ${e}`);
        }
    }

    /** Chamado ao fechar o vscode. Chama o dispose do painel para salvar o ultimo filtro */
    public dispose(): void {
        if(this.panel) {
            this.panel.dispose();
        }
    }
}