'use strict';

import { ES } from './es';

export class Dump {

    // private rxTabIni: RegExp = /^\s*Tabela\s+([a-zA-Z0-9_]+)\s*iniciada\s*\.+\s*(([0-9]{2})\/([0-9]{2})\/([0-9]{4}))\s+(([0-9]{2}):([0-9]{2}):([0-9]{2}))\s*$/ig;
    // private rxTabSai: RegExp = /^\s*\.+\s+em\s+([a-zA-Z0-9_]+)\s*lidos\s*([0-9]+)\s+gravados\s+([0-9]+)\s+(([0-9]{2})\/([0-9]{2})\/([0-9]{4}))\s+(([0-9]{2}):([0-9]{2}):([0-9]{2}))\s*$/ig;
    private pastaExecucao: string;
    private caminho: string;
    
    constructor(pastaExecucao: string) {
        this.pastaExecucao = pastaExecucao;
        this.caminho = '';
    }

    public construirCaminho(c: any, acao: string): string {
        if(acao === 'abrirDump') {
            //        C:/folha/execucao/Emp_01_TOCANTINS/Destino_delta        _SRVFVJ              /VJ              /F_2016              04                           034                   _E00001                   /Log/Folha11.LOG
            this.caminho = `${this.pastaExecucao}/Destino_${c.ambiente}_${c.servidorCalculo}/${c.tipoCalculo}/F_${c.mesAnoFol.ano}${ES.pad(c.mesAnoFol.mes, 2)}${ES.pad(c.numFol, 3)}_E${ES.pad(c.execucao, 5)}/Log/Folha11.LOG`;
            console.log(this.caminho);
        }
        return this.caminho;
    }

    public parseArquivo(conteudoArq: string): any {

        let novoConteudo: string = '';

        // Substituindo CRLF ou CR pelo LF
        conteudoArq = conteudoArq.replace(/\r\n/g, '\n');
        conteudoArq = conteudoArq.replace(/\r/g, '\n');

        let linhas: string[] = conteudoArq.split('\n');

        let numLinha: number = 1;
        let i: any;

        // TODO: finish file parse
        for(i in linhas) {
            
            /* let linha: string = linhas[i];
            let novaLinha: string;
            let tabIni: RegExpExecArray | null = this.rxTabIni.exec(linha);
            this.rxTabIni.lastIndex = 0;
            let tabSai: RegExpExecArray | null = this.rxTabSai.exec(linha);
            this.rxTabSai.lastIndex = 0;

            if(tabIni) {
                novaLinha = tabIni[1];
            }
            else if(tabSai) {
                novaLinha = tabSai[1];
            }
            else {
                novaLinha = '';
            } */

            let linha: string = linhas[i];
            let novaLinha: string;
            novaLinha = `<div class="lin"><span id="linha_${numLinha}" class="contLinha">${numLinha}</span><span class="texto">${linha}</span></div>\n`;
            novoConteudo += novaLinha;
            numLinha++;
        }

        return {texto: novoConteudo, caminho: this.caminho};
    }
}