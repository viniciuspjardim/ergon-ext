let fs = require('fs');

export class Contexto {
    public ambiente: string = "";
    public servidorCalculo: string = "";
    public tipoCalculo: string = "";
    public mesAnoFol: number = 0;
    public numFol: number = 0;
    public execucao: number = 0;
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

export function parseArqRubricas() {
    
    let caminho: string = "C:/folha/execucao/Emp_01_TOCANTINS/Destino_delta_SRVFVJ/VJ/F_201604034_E00001/Debug/Folha12-NF001245988/SF02-NV03-SV01-Ano2016/teste.txt"; // SF02-NV03-SV01-Mes201604-SM01.dbg";

    fs.readFile(caminho, 'utf8', function (err: any, data: string) {
        if (err) {
            return console.error(err);
        }
        console.log("Asynchronous read: " + data.toString());
    });
}