'use strict';

import fs = require('fs');
import * as path from 'path';

export class ArvoreNo {

    public nivel: number;
    public tipo: string;
    public valor: string;
    public filhos: ArvoreNo[];

    constructor(nivel: number, tipo: string, valor: string) {
        this.nivel = nivel;
        this.tipo = tipo;
        this.valor = valor;
        this.filhos = new Array();
    }

    /** Busca nó, caso não encontrado adiciona novo nó. Retorna o nó encontrado ou adicionado */
    public adicionar(tipo: string, valor: string): ArvoreNo {

        for(let i in this.filhos) {
            if(this.filhos[i].tipo === tipo && this.filhos[i].valor === valor) {
                return this.filhos[i];
            }
        }

        let novoNo: ArvoreNo = new ArvoreNo(this.nivel + 1, tipo, valor);
        this.filhos.push(novoNo);
        return novoNo;
    }
}

export class Descobrir {

    public raiz: ArvoreNo = new ArvoreNo(0, 'raiz', 'raiz');
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
    public percorrerPastas(): void {
        this.percorrerPastasRec(0, this.raiz, this.pastaExecucao);
    }

    /** Percorrendo recursivamente as pastas de execução da folha e coletando dados da execução */
    private percorrerPastasRec(nivel: number, noAtual: ArvoreNo, caminho: string): void {

        let arquivos: string[] = fs.readdirSync(caminho);
        nivel++;

        for(let i in arquivos) {

            let arq: string = arquivos[i];
            let novoCaminho: string = path.join(caminho, arq);
            let stat: fs.Stats = fs.lstatSync(novoCaminho);

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
                let novoNo1: ArvoreNo = noAtual.adicionar('ambiente', result[1]);

                // Adicionando o servidor de calculo
                let novoNo2: ArvoreNo = novoNo1.adicionar('servidorCalculo', result[2]);

                this.percorrerPastasRec(nivel, novoNo2, novoCaminho);
            }
            // Nível 2: VJ
            else if(nivel === 2) {

                // Só interessa os diretórios
                if(!stat.isDirectory()) {
                    continue;
                }

                // Adicionando o tipo de cálculo
                let novoNo: ArvoreNo = noAtual.adicionar('tipoCalculo', arq);

                this.percorrerPastasRec(nivel, novoNo, novoCaminho);
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
                let novoNo1: ArvoreNo = noAtual.adicionar('mesAnoFol', `${result[2]}/${result[1]}`);

                // Adicionando o número da folha
                let novoNo2: ArvoreNo = novoNo1.adicionar('numFol', result[3]);

                // Adicionando a execução
                let novoNo3: ArvoreNo = novoNo2.adicionar('execucao', result[4]);

                this.percorrerPastasRec(nivel, novoNo3, path.join(novoCaminho, 'Debug'));
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
                let novoNo1: ArvoreNo = noAtual.adicionar('mesAnoFol', `${result[2]}/${result[1]}`);

                // Adicionando o número da folha
                let novoNo2: ArvoreNo = novoNo1.adicionar('numFol', result[3]);

                // Adicionando a execução
                let novoNo3: ArvoreNo = novoNo2.adicionar('execucao', result[4]);

                this.percorrerPastasRec(nivel, novoNo3, path.join(novoCaminho, 'Debug'));
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
                let novoNo: ArvoreNo = noAtual.adicionar('numFunc', result[1]);

                this.percorrerPastasRec(nivel, novoNo, novoCaminho);
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
                let novoNo1: ArvoreNo = noAtual.adicionar('numVinc', result[2]);

                // Adicionando a sequência de funcionário
                let novoNo2: ArvoreNo = novoNo1.adicionar('seqFunc', result[1]);

                // Adicionando a sequência de vínculo
                let novoNo3: ArvoreNo = novoNo2.adicionar('seqVinc', result[3]);

                this.percorrerPastasRec(nivel, novoNo3, novoCaminho);
            }
            // Nível 6: SF02-NV01-SV01-Mes201604-SM01.dbg
            else if(nivel === 6) {

                // Só interessa os arquivos
                if(!stat.isFile()) {
                    continue;
                }

                let result: RegExpExecArray | null = this.rgxNivel6.exec(arq);
                this.rgxNivel6.lastIndex = 0;

                // Só interessa as pastas que seguem a regex
                if(result === null) {
                    continue;
                }

                // Adicionando o mes ano de direito
                noAtual.adicionar('mesAnoRub',`${result[5]}/${result[4]}`);
            }
        }
    }
}