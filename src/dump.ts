'use strict';

import { ES } from './es';

export class Dump {

    //                              Tabela    FUNCIONARIOS     iniciada ...      21        / 01        / 2019         17       : 46       : 40
    private rxTabIni: RegExp = /^\s*Tabela\s+([a-zA-Z0-9_]+)\s*iniciada\s*\.+\s*([0-9]{2})\/([0-9]{2})\/([0-9]{4})\s+([0-9]{2}):([0-9]{2}):([0-9]{2})\s*$/ig;
    //                              ...   em    FUNCIONARIOS     lidos    1         gravados    1          21        / 01        / 2019         17       : 46       : 40
    private rxTabSai: RegExp = /^\s*\.+\s+em\s+([a-zA-Z0-9_]+)\s*lidos\s*([0-9]+)\s+gravados\s+([0-9]+)\s+([0-9]{2})\/([0-9]{2})\/([0-9]{4})\s+([0-9]{2}):([0-9]{2}):([0-9]{2})\s*$/ig;
    private pastaExecucao: string;
    private caminho: string;
    
    constructor(pastaExecucao: string) {
        this.pastaExecucao = pastaExecucao;
        this.caminho = '';
    }

    public construirCaminho(c: any, acao: string): string {
        if(acao === 'abrirDump') {
            // C:/folha/execucao/Emp_01_TOCANTINS/Destino_delta        _SRVFVJ              /VJ              /F_2016              04                           034                   _E00001                   /Log/Folha11.LOG
            this.caminho = `${this.pastaExecucao}/Destino_${c.ambiente}_${c.servidorCalculo}/${c.tipoCalculo}/F_${c.mesAnoFol.ano}${ES.pad(c.mesAnoFol.mes, 2)}${ES.pad(c.numFol, 3)}_E${ES.pad(c.execucao, 5)}/Log/Folha11.LOG`;
            console.log(this.caminho);
        }
        return this.caminho;
    }

    public parseArquivo(conteudoArq: string): any {

        // Substituindo CRLF ou CR pelo LF
        conteudoArq = conteudoArq.replace(/\r\n/g, '\n');
        conteudoArq = conteudoArq.replace(/\r/g, '\n');

        let linhas: string[] = conteudoArq.split('\n');
        let tabelas: any[] = [];

        let novoConteudo: string = '';
        let i: any;

        for(i in linhas) {
            
            let linha: string = linhas[i];

            let tabIni: RegExpExecArray | null = this.rxTabIni.exec(linha);
            this.rxTabIni.lastIndex = 0;
            let tabSai: RegExpExecArray | null = this.rxTabSai.exec(linha);
            this.rxTabSai.lastIndex = 0;

            if(tabIni) {
                tabelas.push({
                    tabela: tabIni[1],
                    registros: 0,
                    tempo: 0,
                    inicio: new Date(+tabIni[4], +tabIni[3] -1, +tabIni[2], +tabIni[5], +tabIni[6], +tabIni[7], 0),
                    fim: new Date(0, 0, 0)
                });
            }
            else if(tabSai) {
                let tabela = tabelas[tabelas.length -1];
                if(tabela.tabela !== tabSai[1]) {
                    throw new Error('Tabelas diferentes');
                }
                tabela.registros = tabSai[2];
                tabela.fim = new Date(+tabSai[6], +tabSai[5] -1, +tabSai[4], +tabSai[7], +tabSai[8], +tabSai[9], 0);
                tabela.tempo = (tabela.fim - tabela.inicio) / 1000;
            }
        }

        // Ordenar pelo tempo de execução
        tabelas.sort((t1, t2) => {
            return t1.tempo - t2.tempo;
        });

        for(i in tabelas) {
            let tabela = tabelas[i];
            let novaLinha: string;
            novaLinha = `
                <tr>
                    <td>${tabela.tabela}</td>
                    <td>${tabela.registros}</td>
                    <td>${tabela.tempo}</td>
                    <td>${Dump.formatarDataHora(tabela.inicio)}</td>
                    <td>${Dump.formatarDataHora(tabela.fim)}</td>
                </tr>\n`
            ;
                
            novoConteudo += novaLinha;
        }

        novoConteudo = `
            <table>
                <tr>
                    <th>Tabela / View</th>
                    <th>Registros</th>
                    <th>Tempo(s)</th>
                    <th>Início</th>
                    <th>Fim</th>
                </tr>
                ${novoConteudo}
            </table>`
        ;

        return {texto: novoConteudo, caminho: this.caminho};
    }

    public static formatarDataHora(data: Date): string {
        return `${data.getDate()}/${data.getMonth()+1}/${data.getFullYear()} ${
            data.getHours()}:${data.getMinutes()}:${data.getSeconds()}`;
    }
}
