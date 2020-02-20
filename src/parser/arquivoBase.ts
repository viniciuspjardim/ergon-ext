'use strict';

import { ES } from '../es';

export class ArquivoBase implements Parser {

    private pastaExecucao: string;
    private caminho: string;
    
    constructor(pastaExecucao: string) {
        this.pastaExecucao = pastaExecucao;
        this.caminho = '';
    }

    public construirCaminho(c: any, acao: string): string {
        
        if(acao === 'abrirLogErro') {
            // C:/folha/execucao/Emp_01_TOCANTINS/Destino_delta        _SRVFVJ              /VJ              /F_2016              04                           034                   _E00001                   /Fontes/Fo12180732                                                                          g.tmp
            this.caminho = `${this.pastaExecucao}/Destino_${c.ambiente}_${c.servidorCalculo}/${c.tipoCalculo}/F_${c.mesAnoFol.ano}${ES.pad(c.mesAnoFol.mes, 2)}${ES.pad(c.numFol, 3)}_E${ES.pad(c.execucao, 5)}/Fontes/Fo12${ES.pad(c.mesAnoFol.ano, 2)}${ES.pad(c.mesAnoFol.mes, 2)}${ES.pad(c.numFol, 2)}g.tmp`;
            console.log(this.caminho);
        }
        return this.caminho;
    }

    public parseArquivo(conteudoArq: string): any {

        let novoConteudo: string = '';
        let numLinha: number = 1;

        // Substituindo CRLF ou CR pelo LF
        conteudoArq = conteudoArq.replace(/\r\n/g, '\n');
        conteudoArq = conteudoArq.replace(/\r/g, '\n');

        let linhas: string[] = conteudoArq.split('\n');

        let i: any;

        for(i in linhas) {
            let linha: string = linhas[i];
            let novaLinha: string;
            novaLinha = `<div class="lin"><span id="linha_${numLinha}" class="contLinha">${numLinha}</span><span class="texto">${linha}</span></div>\n`;
            novoConteudo += novaLinha;
            numLinha++;
        }

        return {texto: novoConteudo, caminho: this.caminho};
    }
}
