'use strict';

import * as fs from 'fs-extra';
import * as path from 'path';

type TipoDado = 'raiz' | 'numero' | 'texto' | 'mesAno';

export function formatarValor(tipo: TipoDado, valor: string): string {
    if(tipo === 'numero') {
        return String(+valor);
    }
    return valor;
}

export class ArvoreNo {

    public campo: string;
    public tipo: TipoDado;
    public valor: string;
    public filhos: ArvoreNo[];

    constructor(campo: string, tipo: TipoDado, valor: string) {
        this.campo = campo;
        this.tipo = tipo;
        this.valor = valor;
        this.filhos = new Array();
    }

    /** Busca nó, caso não encontrado adiciona novo nó. Retorna o nó encontrado ou adicionado */
    public adicionar(campo: string, tipo: TipoDado, valor: string): ArvoreNo {

        valor = formatarValor(tipo, valor);

        for(let i in this.filhos) {
            if(this.filhos[i].tipo === tipo && this.filhos[i].valor === valor) {
                return this.filhos[i];
            }
        }

        let novoNo: ArvoreNo = new ArvoreNo(campo, tipo, valor);
        this.filhos.push(novoNo);
        return novoNo;
    }
}

/** 
 * Percorre recursivamente a pasta de execuções para descobrir dados e montar uma árvore com
 * número das execuções, datas, numfuncs etc. Esses dados serão usados para a função de
 * autocompletar nos campos do filtro.
 */
export class Descobrir {

    public raiz: ArvoreNo = new ArvoreNo('raiz', 'raiz', 'raiz');
    private pastaExecucao: string;

    private rgxNivel1: RegExp = /^Destino_([a-zA-Z]+)_([a-zA-Z]+)$/ig;
    private rgxNivel3: RegExp = /^F_([0-9]{4})([0-9]{2})([0-9]{3})_E([0-9]{5})$/ig;
    private rgxNivel4: RegExp = /^Folha12-NF([0-9]{9})$/ig;
    private rgxNivel5: RegExp = /^SF([0-9]{2})-NV([0-9]{2})-SV([0-9]{2})-Ano([0-9]{4})$/ig;
    private rgxNivel6: RegExp = /^SF([0-9]{2})-NV([0-9]{2})-SV([0-9]{2})-Mes([0-9]{4})([0-9]{2})-SM([0-9]{2}).dbg$/ig;

    constructor(pastaExecucao: string) {
        this.pastaExecucao = pastaExecucao;
    }

    /** Chama o percorrerPastasRec com os valores padrões */
    public async percorrerPastas(): Promise<void> {
        this.raiz.filhos = new Array();
        await this.percorrerPastasRec(0, this.raiz, this.pastaExecucao);
    }

    /** Percorrendo recursivamente as pastas de execução da folha e coletando dados da execução */
    private async percorrerPastasRec(nivel: number, noAtual: ArvoreNo, caminho: string): Promise<void> {

        let arquivos: string[] = await fs.readdir(caminho);
        nivel++;

        for(let i in arquivos) {

            let arq: string = arquivos[i];
            let novoCaminho: string = path.join(caminho, arq);
            let stat: fs.Stats = await fs.lstat(novoCaminho);

            // Nível 1: Destino_delta_SRVFVJ
            if(nivel === 1) {

                // Só interessa os diretórios
                if(!stat.isDirectory()) {
                    continue;
                }

                let result: RegExpExecArray | null = this.rgxNivel1.exec(arq);
                this.rgxNivel1.lastIndex = 0;

                // Só interessa as pastas que seguem a regex
                if(result === null) {
                    continue;
                }

                // Adicionando o ambiente
                let novoNo1: ArvoreNo = noAtual.adicionar('ambiente', 'texto', result[1]);

                // Adicionando o servidor de calculo
                let novoNo2: ArvoreNo = novoNo1.adicionar('servidorCalculo', 'texto',  result[2]);

                await this.percorrerPastasRec(nivel, novoNo2, novoCaminho);
            }
            // Nível 2: VJ
            else if(nivel === 2) {

                // Só interessa os diretórios
                if(!stat.isDirectory()) {
                    continue;
                }

                // Adicionando o tipo de cálculo
                let novoNo: ArvoreNo = noAtual.adicionar('tipoCalculo', 'texto',  arq);

                await this.percorrerPastasRec(nivel, novoNo, novoCaminho);
            }
            // Nível 3: F_201604034_E00001
            else if(nivel === 3) {

                // Só interessa os diretórios
                if(!stat.isDirectory()) {
                    continue;
                }

                let result: RegExpExecArray | null = this.rgxNivel3.exec(arq);
                this.rgxNivel3.lastIndex = 0;

                // Só interessa as pastas que seguem a regex
                if(result === null) {
                    continue;
                }

                // Adicionando o mês ano da folha
                let novoNo1: ArvoreNo = noAtual.adicionar('mesAnoFol', 'mesAno', `${result[2]}/${result[1]}`);

                // Adicionando o número da folha
                let novoNo2: ArvoreNo = novoNo1.adicionar('numFol', 'numero',  result[3]);

                // Adicionando a execução
                let novoNo3: ArvoreNo = novoNo2.adicionar('execucao', 'numero',  result[4]);

                // A pasta Debug pode não existir caso alguém tenha deletado
                try {
                    await this.percorrerPastasRec(nivel, novoNo3, path.join(novoCaminho, 'Debug'));
                }
                catch(e) {
                    console.log(`Erro: ${e}`);
                }
            }
            // Nível 4: Folha12-NF000099949
            else if(nivel === 4) {

                // Só interessa os diretórios
                if(!stat.isDirectory()) {
                    continue;
                }

                let result: RegExpExecArray | null = this.rgxNivel4.exec(arq);
                this.rgxNivel4.lastIndex = 0;

                // Só interessa as pastas que seguem a regex
                if(result === null) {
                    continue;
                }

                // Adicionando o número funcional
                let novoNo: ArvoreNo = noAtual.adicionar('numFunc', 'numero',  result[1]);

                await this.percorrerPastasRec(nivel, novoNo, novoCaminho);
            }
            // Nível 5: SF01-NV01-SV01-Ano2005
            else if(nivel === 5) {

                // Só interessa os diretórios
                if(!stat.isDirectory()) {
                    continue;
                }

                let result: RegExpExecArray | null = this.rgxNivel5.exec(arq);
                this.rgxNivel5.lastIndex = 0;

                // Só interessa as pastas que seguem a regex
                if(result === null) {
                    continue;
                }

                // Adicionando o número de vínculo
                let novoNo1: ArvoreNo = noAtual.adicionar('numVinc', 'numero', result[2]);

                // Adicionando a sequência de funcionário
                let novoNo2: ArvoreNo = novoNo1.adicionar('seqFunc', 'numero', result[1]);

                // Adicionando a sequência de vínculo
                let novoNo3: ArvoreNo = novoNo2.adicionar('seqVinc', 'numero', result[3]);

                await this.percorrerPastasRec(nivel, novoNo3, novoCaminho);
            }
            // Nível 6: SF02-NV01-SV01-Mes201604-SM01.dbg
            else if(nivel === 6) {

                // Só interessa os arquivos
                if(!stat.isFile()) {
                    continue;
                }

                let result: RegExpExecArray | null = this.rgxNivel6.exec(arq);
                this.rgxNivel6.lastIndex = 0;

                // Só interessa as arquivos que seguem a regex
                if(result === null) {
                    continue;
                }

                // Adicionando o mes ano de direito
                noAtual.adicionar('mesAnoRub', 'mesAno', `${result[5]}/${result[4]}`);
            }
        }
    }
}
