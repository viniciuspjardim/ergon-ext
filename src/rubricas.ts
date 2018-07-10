import { atualizarWebView } from "./extension";

let fs = require('fs');
let iconv = require('iconv-lite');

export function parseArqRubricas(pastaExecucao: string, c: any) {

    //   C:/folha/execucao/Emp_01_TOCANTINS/Destino_delta        _SRVFVJ              /VJ              /F_2016              04                        034                _E00001                /Debug/Folha12-NF001245988           /SF02                  -NV03                  -SV01                  -Ano2016              /SF02                  -NV03                  -SV01                  -Mes2016              04                        -SM01.dbg
    let caminho: string = `${pastaExecucao}/Destino_${c.ambiente}_${c.servidorCalculo}/${c.tipoCalculo}/F_${c.mesAnoFol.ano}${pad(c.mesAnoFol.mes, 2)}${pad(c.numFol, 3)}_E${pad(c.execucao, 5)}/Debug/Folha12-NF${pad(c.numFunc, 9)}/SF${pad(c.seqFunc, 2)}-NV${pad(c.numVinc, 2)}-SV${pad(c.seqVinc, 2)}-Ano${c.mesAnoRub.ano}/SF${pad(c.seqFunc, 2)}-NV${pad(c.numVinc, 2)}-SV${pad(c.seqVinc, 2)}-Mes${c.mesAnoRub.ano}${pad(c.mesAnoRub.mes, 2)}-SM01.dbg`;

    console.log(caminho);

    fs.readFile(caminho, 'binary', function (err: any, data: string) {
        if (err) {
            atualizarWebView(true, "");
            return console.error(err);
        }
        let conteudo: string = iconv.decode(data, '1252');
        atualizarWebView(false, conteudo);
    });
}

export function pad(num: number, padlen: number): string {
    let pad = new Array(1 + padlen).join('0');
    return (pad + num).slice(-pad.length);
}