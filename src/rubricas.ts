'use strict';

import { ES } from "./es";

export class Rubricas {

    private rubricaEntraRegex: RegExp = /^\s*(\d+)\s*(\d+)\s*-> \.+\s*(\d+)\s*([a-zA-Z0-9]+)\s*([a-zA-Z0-9]*)\s*([-+\.0-9]+)\s*\(C\)\s*([-+\.0-9]+)\s*\(P\)\s*([-+\.0-9]+)\s*\(MC\)\s*([-+\.0-9]+)\s*\(MP\)\s*$/ig;
    private rubricaSaiRegex: RegExp = /^\s*(\d+)\s*(\d+)\s*<-\s*\.+\s*(\d+)\s*([a-zA-Z0-9]+)\s*([a-zA-Z0-9]*)\s*([-+\.0-9]+)\s*\(C\)\s*([-+\.0-9]+)\s*\(P\)\s*([-+\.0-9]+)\s*\(MC\)\s*([-+\.0-9]+)\s*\(MP\)\s*$/ig;
    private pastaExecucao: string;

    constructor(pastaExecucao: string) {
        this.pastaExecucao = pastaExecucao;
    }

    public construirCaminho(c: any): string {   
        //        C:/folha/execucao/Emp_01_TOCANTINS/Destino_delta        _SRVFVJ              /VJ              /F_2016              04                           034                   _E00001                   /Debug/Folha12-NF001245988              /SF02                     -NV03                     -SV01                     -Ano2016              /SF02                     -NV03                     -SV01                     -Mes2016              04                           -SM01.dbg
        let caminho: string = `${this.pastaExecucao}/Destino_${c.ambiente}_${c.servidorCalculo}/${c.tipoCalculo}/F_${c.mesAnoFol.ano}${ES.pad(c.mesAnoFol.mes, 2)}${ES.pad(c.numFol, 3)}_E${ES.pad(c.execucao, 5)}/Debug/Folha12-NF${ES.pad(c.numFunc, 9)}/SF${ES.pad(c.seqFunc, 2)}-NV${ES.pad(c.numVinc, 2)}-SV${ES.pad(c.seqVinc, 2)}-Ano${c.mesAnoRub.ano}/SF${ES.pad(c.seqFunc, 2)}-NV${ES.pad(c.numVinc, 2)}-SV${ES.pad(c.seqVinc, 2)}-Mes${c.mesAnoRub.ano}${ES.pad(c.mesAnoRub.mes, 2)}-SM01.dbg`;
        console.log(caminho);
        return caminho;
    }

    public parseArqRubricas(conteudoArq: string): any {

        let novoConteudo: string = "";
        let index: any = {};

        // Substituindo CRLF ou CR pelo LF
        conteudoArq = conteudoArq.replace(/\r\n/g, "\n");
        conteudoArq = conteudoArq.replace(/\r/g, "\n");

        let linhas: string[] = conteudoArq.split("\n");

        let numLinha: number = 1;
        let i: any;

        for(i in linhas) {

            let linha: string = linhas[i];
            let novaLinha: string;
            let atribEntra: any = this.rubricaEntraRegex.exec(linha);
            let atribSai: any = this.rubricaSaiRegex.exec(linha);

            // Rubrica entra RE
            if(atribEntra !== null) {
                novaLinha = "<span class='rubEntra'>" + linha + "</span>";
                index[`RE_${atribEntra[1]}_${atribEntra[3]}`] = numLinha;
            }
            // Rubrica sai RS
            else if(atribSai !== null) {
                novaLinha = "<span class='rubSai'>" + linha + "</span>";
                index[`RS_${atribSai[1]}_${atribSai[3]}`] = numLinha;
            }
            else {
                novaLinha = "        " + linha;
            }

            novaLinha = `<span id='linha_${numLinha}' class='contLinha'>${numLinha}</span>${novaLinha}\n`;
            novoConteudo += novaLinha;
            numLinha++;
        }

        return {texto: novoConteudo, index: index};
    }
}