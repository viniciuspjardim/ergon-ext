import { atualizarWebView } from "./extension";

let fs = require('fs');
let iconv = require('iconv-lite');
let caminhoBase = "C:/folha/execucao/Emp_01_TOCANTINS";

export class Contexto {

    public ambiente: string = "";
    public servidorCalculo: string = "";
    public tipoCalculo: string = "";
    public mesAnoFol: Date = new Date();
    public numFol: number = 0;
    public execucao: number = 0;

    // func: 85409, vinc: 1, ano: 2016, mes: 6, seq_func: 2, seq_vinc: 2, rubrica: 1001, complemento: null, periodo: 2, tipo: "ini"
    public numFunc: number = 0;
    public numVinc: number = 0;
    public mesAnoRub: Date = new Date();
    public seqFunc: number = 0;
    public seqVinc: number = 0;
    public rubrica: number = 0;
    public complemento: string = "";
    public periodo: number = 0;
    public tipo: string = "";
}

export class Cache {

    // Obs: os campos json são strings para retornar true na comparação

    /** Mapa que contem um json como chave e um item no cache como valor */
    public map: Map<string, ItemCache> = new Map<any, ItemCache>();
    /** Mapa reverso: o campo arquivo::linha é o id que aponta para o json que é chave em map */
    public mapReverso: Map<string, string> = new Map<string, any>();
}

export class ItemCache {

    public arquivo: string;
    public linha: number;
    public posicao: number;
    public texto: string;
    public campos: string = "";

    constructor(arquivo: string, linha: number, posicao: number, texto: string) {
        this.arquivo = arquivo;
        this.linha = linha;
        this.posicao = posicao;
        this.texto = texto;
    }

    public gerarId(): string {
        return "";
    }
}

export let rubricasCache: Cache = new Cache();

export function parseArqRubricas(c: Contexto) {

    // C:/folha/execucao/Emp_01_TOCANTINS/Destino_delta        _SRVFVJ              /VJ              /F_2016                        04                               034                _E00001                /Debug/Folha12-NF001245988           /SF02                  -NV03                  -SV01                  -Ano2016                        /SF02                  -NV03                  -SV01                  -Mes2016                        04                               -SM01.dbg
    let caminho: string = `${caminhoBase}/Destino_${c.ambiente}_${c.servidorCalculo}/${c.tipoCalculo}/F_${c.mesAnoFol.getFullYear()}${pad(c.mesAnoFol.getMonth(), 2)}${pad(c.numFol, 3)}_E${pad(c.execucao, 5)}/Debug/Folha12-NF${pad(c.numFunc, 9)}/SF${pad(c.seqFunc, 2)}-NV${pad(c.numVinc, 2)}-SV${pad(c.seqVinc, 2)}-Ano${c.mesAnoRub.getFullYear()}/SF${pad(c.seqFunc, 2)}-NV${pad(c.numVinc, 2)}-SV${pad(c.seqVinc, 2)}-Mes${c.mesAnoRub.getFullYear()}${pad(c.mesAnoRub.getMonth(), 2)}-SM01.dbg`;

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