import { atualizarWebView } from "./extension";

import fs = require('fs');
import iconv = require('iconv-lite');
const rubricaEntraRegex: RegExp = /^\s*(\d+)\s*(\d+)\s*-> \.+\s*(\d+)\s*([a-zA-Z0-9]+)\s*([a-zA-Z0-9]*)\s*([-+\.0-9]+)\s*\(C\)\s*([-+\.0-9]+)\s*\(P\)\s*([-+\.0-9]+)\s*\(MC\)\s*([-+\.0-9]+)\s*\(MP\)\s*$/ig;
const rubricaSaiRegex: RegExp = /^\s*(\d+)\s*(\d+)\s*<-\s*\.+\s*(\d+)\s*([a-zA-Z0-9]+)\s*([a-zA-Z0-9]*)\s*([-+\.0-9]+)\s*\(C\)\s*([-+\.0-9]+)\s*\(P\)\s*([-+\.0-9]+)\s*\(MC\)\s*([-+\.0-9]+)\s*\(MP\)\s*$/ig;


// Todo converter estas funções para uma classe

export function lerArqRubricas(pastaExecucao: string, c: any) {

    //   C:/folha/execucao/Emp_01_TOCANTINS/Destino_delta        _SRVFVJ              /VJ              /F_2016              04                        034                _E00001                /Debug/Folha12-NF001245988           /SF02                  -NV03                  -SV01                  -Ano2016              /SF02                  -NV03                  -SV01                  -Mes2016              04                        -SM01.dbg
    let caminho: string = `${pastaExecucao}/Destino_${c.ambiente}_${c.servidorCalculo}/${c.tipoCalculo}/F_${c.mesAnoFol.ano}${pad(c.mesAnoFol.mes, 2)}${pad(c.numFol, 3)}_E${pad(c.execucao, 5)}/Debug/Folha12-NF${pad(c.numFunc, 9)}/SF${pad(c.seqFunc, 2)}-NV${pad(c.numVinc, 2)}-SV${pad(c.seqVinc, 2)}-Ano${c.mesAnoRub.ano}/SF${pad(c.seqFunc, 2)}-NV${pad(c.numVinc, 2)}-SV${pad(c.seqVinc, 2)}-Mes${c.mesAnoRub.ano}${pad(c.mesAnoRub.mes, 2)}-SM01.dbg`;

    console.log(caminho);

    fs.readFile(caminho, function (err: any, data: Buffer) {
        if (err) {
            atualizarWebView(true, "");
            return console.error(err);
        }
        let conteudo: string = parseArqRubricas(iconv.decode(data, '1252'));

        atualizarWebView(false, conteudo);
    });
}

export function parseArqRubricas(conteudoArq: string): string {

    let novoConteudo: string = "";

    // Substituindo CRLF ou CR pelo LF
    conteudoArq = conteudoArq.replace(/\r\n/g, "\n");
    conteudoArq = conteudoArq.replace(/\r/g, "\n");

    let linhas: string[] = conteudoArq.split("\n");
    
    let numLinha: number = 1;
    let i: any;
    let cache: any = {};
    
    for(i in linhas) {

        let linha: string = linhas[i];
        let novaLinha: string;
        let atribEntra: any = rubricaEntraRegex.exec(linha);
        let atribSai: any = rubricaSaiRegex.exec(linha);

        if(atribEntra !== null) {
            novaLinha = "<span class='rubEntra'>" + linha + "</span>";
            // Rubrica entra RE
            cache[`RE_${atribEntra[1]}_${atribEntra[3]}`] = numLinha;
        }
        else if(atribSai !== null) {
            novaLinha = "<span class='rubSai'>" + linha + "</span>";
            // Rubrica sai RS
            cache[`RS_${atribSai[1]}_${atribSai[3]}`] = numLinha;
        }
        else {
            novaLinha = "        " + linha;
        }

        novaLinha = `<span id='linha${numLinha}' class='contLinha'>${numLinha}</span>${novaLinha}\n`;
        novoConteudo += novaLinha;
        numLinha++;
    }

    console.log(cache);

    return novoConteudo;
}

export function enviarArqRubricas(conteudoArq: string) { }

export function pad(num: number, padlen: number): string {
    let pad = new Array(1 + padlen).join('0');
    return (pad + num).slice(-pad.length);
}