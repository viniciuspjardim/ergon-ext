'use strict';

import { ES } from './es';

/** Entrando na rubrica, saindo da rubrica */
type TipoLinha = 'RE' | 'RS';

export interface DadosLinha {
    periodo: string;
    indiceRubrica: string;
    rubrica: string;
    mnemonico: string;
    complemento: string;
    valCalc: number;
    valPago: number;
    valLiq: number;
    movCalc: number;
    movPago: number;
    movLiq: number;
    tipoLinha: TipoLinha;
}

export class Rubricas {

    private rubricaEntraRegex: RegExp = /^\s*(\d+)\s*(\d+)\s*-> \.+\s*(\d+)\s*([a-zA-Z0-9]+)\s+([a-zA-Z0-9]*)\s+([-+\.0-9]+)\s*\(C\)\s*([-+\.0-9]+)\s*\(P\)\s*([-+\.0-9]+)\s*\(MC\)\s*([-+\.0-9]+)\s*\(MP\)\s*$/ig;
    private rubricaSaiRegex: RegExp = /^\s*(\d+)\s*(\d+)\s*<-\s*\.+\s*(\d+)\s*([a-zA-Z0-9]+)\s+([a-zA-Z0-9]*)\s+([-+\.0-9]+)\s*\(C\)\s*([-+\.0-9]+)\s*\(P\)\s*([-+\.0-9]+)\s*\(MC\)\s*([-+\.0-9]+)\s*\(MP\)\s*$/ig;
    private pastaExecucao: string;
    private nomeRubricas: any;

    constructor(pastaExecucao: string) {
        this.pastaExecucao = pastaExecucao;
    }

    public setNomeRubricas(nomeRubricas: any) {
        this.nomeRubricas = nomeRubricas;
    }

    public construirCaminho(c: any): string {
        //        C:/folha/execucao/Emp_01_TOCANTINS/Destino_delta        _SRVFVJ              /VJ              /F_2016              04                           034                   _E00001                   /Debug/Folha12-NF001245988              /SF02                     -NV03                     -SV01                     -Ano2016              /SF02                     -NV03                     -SV01                     -Mes2016              04                           -SM01.dbg
        let caminho: string = `${this.pastaExecucao}/Destino_${c.ambiente}_${c.servidorCalculo}/${c.tipoCalculo}/F_${c.mesAnoFol.ano}${ES.pad(c.mesAnoFol.mes, 2)}${ES.pad(c.numFol, 3)}_E${ES.pad(c.execucao, 5)}/Debug/Folha12-NF${ES.pad(c.numFunc, 9)}/SF${ES.pad(c.seqFunc, 2)}-NV${ES.pad(c.numVinc, 2)}-SV${ES.pad(c.seqVinc, 2)}-Ano${c.mesAnoRub.ano}/SF${ES.pad(c.seqFunc, 2)}-NV${ES.pad(c.numVinc, 2)}-SV${ES.pad(c.seqVinc, 2)}-Mes${c.mesAnoRub.ano}${ES.pad(c.mesAnoRub.mes, 2)}-SM01.dbg`;
        console.log(caminho);
        return caminho;
    }

    public parseArqRubricas(conteudoArq: string): any {

        let novoConteudo: string = '';
        let index: any = {};

        // Substituindo CRLF ou CR pelo LF
        conteudoArq = conteudoArq.replace(/\r\n/g, '\n');
        conteudoArq = conteudoArq.replace(/\r/g, '\n');

        let linhas: string[] = conteudoArq.split('\n');

        // Pilha da chamada das rubricas
        let pilha: string[] = [];
        let numLinha: number = 1;
        let i: any;

        for(i in linhas) {

            let linha: string = linhas[i];
            let linhaFmt: string = "";
            let novaLinha: string;
            let preLinha: string = "";
            let posLinha: string = "";
            let atribEntra: RegExpExecArray | null = this.rubricaEntraRegex.exec(linha);
            this.rubricaEntraRegex.lastIndex = 0;
            let atribSai: RegExpExecArray | null = this.rubricaSaiRegex.exec(linha);
            this.rubricaSaiRegex.lastIndex = 0;

            // Rubrica entra 'RE'
            if(atribEntra) {
                const dados: DadosLinha = this.novoDadosLinha(atribEntra, 'RE');

                pilha.push(dados.rubrica);
                for(let item of pilha) {
                    preLinha += `<span class="campo semBorda">>></span>${item}`;
                }

                let nomeRubrica: string = '?';
                if(this.nomeRubricas[dados.rubrica]) {
                    nomeRubrica = this.nomeRubricas[dados.rubrica].nome.trim();
                }

                preLinha =
                        `<div class="hlinha">` +
                        `<span id="preLinha_${numLinha}" class="contLinha">&nbsp</span>` +
                        `<span class="linha preLinha">${preLinha}</span>` +
                        `</div>\n`;
                
                linhaFmt =
                        `<span class="campo semBorda">>></span>${dados.mnemonico}` +
                        `<span class="campo">rubrica</span>` +
                        `<span class="nomeRubrica">` +
                        `${dados.rubrica} ${nomeRubrica} - "${dados.complemento}"` +
                        `</span>` +
                        `<span class="campo">periodo</span>${dados.periodo}` +
                        `<span class="campo">valCalc</span>${dados.valCalc}` +
                        `<span class="campo">valPag</span>${dados.valPago}` +
                        `<span class="campo">valLiq</span>${dados.valLiq}` +
                        `<span class="campo">movCalc</span>${dados.movCalc}` +
                        `<span class="campo">movPag</span>${dados.movPago}` +
                        `<span class="campo">movLiq</span>${dados.movLiq}`;
                
                novaLinha = `<span class="rubEntra">${linhaFmt}</span>`;
                index[`RE_${dados.periodo}_${dados.rubrica}`] = numLinha;
            }
            // Rubrica sai 'RS'
            else if(atribSai) {
                const dados: DadosLinha = this.novoDadosLinha(atribSai, 'RS');

                // Removendo a rubrica da pilha de rubricas
                if(pilha[pilha.length -1] === dados.rubrica) {
                    pilha.pop();
                }

                posLinha = '<span class="campo semBorda"><<</span>';
                for(let item of pilha) {
                    posLinha += `${item}<span class="campo semBorda"><<</span>`;
                }

                let nomeRubrica: string = '?';
                if(this.nomeRubricas[dados.rubrica]) {
                    nomeRubrica = this.nomeRubricas[dados.rubrica].nome.trim();
                }

                posLinha =
                        `<div class="hlinha">` +
                        `<span id="posLinha_${numLinha}" class="contLinha">&nbsp</span>` +
                        `<span class="linha posLinha">${posLinha}</span>` +
                        `</div>\n`;
                
                        linhaFmt =
                        `<span class="campo semBorda"><<</span>${dados.mnemonico}` +
                        `<span class="campo">rubrica</span>` +
                        `<span class="nomeRubrica">` +
                        `${dados.rubrica} ${nomeRubrica} - "${dados.complemento}"` +
                        `</span>` +
                        `<span class="campo">periodo</span>${dados.periodo}` +
                        `<span class="campo">valCalc</span>${dados.valCalc}` +
                        `<span class="campo">valPag</span>${dados.valPago}` +
                        `<span class="campo">valLiq</span>${dados.valLiq}` +
                        `<span class="campo">movCalc</span>${dados.movCalc}` +
                        `<span class="campo">movPag</span>${dados.movPago}` +
                        `<span class="campo">movLiq</span>${dados.movLiq}`;
                
                novaLinha = `<span class="rubSai">${linhaFmt}</span>`;
                index[`RS_${dados.periodo}_${dados.rubrica}`] = numLinha;
            }
            else {
                novaLinha = `<span class="linha">        ${linha}</span>`;
            }

            novaLinha = `${preLinha}<div class="hlinha"><span id="linha_${numLinha}" class="contLinha">${numLinha}</span>${novaLinha}</div>\n${posLinha}`;
            novoConteudo += novaLinha;
            numLinha++;
        }

        return {texto: novoConteudo, index: index};
    }

    private novoDadosLinha(dados: RegExpExecArray, tipoLinha: TipoLinha): DadosLinha {

        let valCalc: number =  this.valorEmNumero(dados[6].trim());
        let valPago: number =  this.valorEmNumero(dados[7].trim());
        let valLiq: number =  valCalc - valPago;
        let movCalc: number =  this.valorEmNumero(dados[8].trim());
        let movPago: number =  this.valorEmNumero(dados[9].trim());
        let movLiq: number =  movCalc - movPago;

        return {
            periodo: dados[1].trim(),
            indiceRubrica: dados[2].trim(),
            rubrica: dados[3].trim(),
            mnemonico: dados[4].trim(),
            complemento: dados[5].trim(),
            valCalc: valCalc,
            valPago: valPago,
            valLiq: valLiq,
            movCalc: movCalc,
            movPago: movPago,
            movLiq: movLiq,
            tipoLinha: tipoLinha
        };
    }

    private valorEmNumero(valorStr: string): number {
        let valor: number = Number(valorStr);
        return valor <= -139999999999 ? 0 : valor;
    }
}