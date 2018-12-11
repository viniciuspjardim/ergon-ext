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

    private periodoRegex: RegExp = /^\s*-\s+(\d+)\s+:\s+((\d{4})(\d{2})(\d{2}))-((\d{4})(\d{2})(\d{2}))\s+(\d+)\s+dias\s*$/ig;
    private rubricaEntraRegex: RegExp = /^\s*(\d+)\s*(\d+)\s*-> \.+\s*(\d+)\s*([a-zA-Z0-9_]+)\s+((?:[^\s][a-zA-Z0-9\s]*[^\s])*)\s+([-+\.0-9]+)\s*\(C\)\s*([-+\.0-9]+)\s*\(P\)\s*([-+\.0-9]+)\s*\(MC\)\s*([-+\.0-9]+)\s*\(MP\)\s*$/ig;
    private rubricaSaiRegex: RegExp = /^\s*(\d+)\s*(\d+)\s*<-\s*\.+\s*(\d+)\s*([a-zA-Z0-9_]+)\s+((?:[^\s][a-zA-Z0-9\s]*[^\s])*)\s+([-+\.0-9]+)\s*\(C\)\s*([-+\.0-9]+)\s*\(P\)\s*([-+\.0-9]+)\s*\(MC\)\s*([-+\.0-9]+)\s*\(MP\)\s*$/ig;
    private pastaExecucao: string;
    private caminho: string;
    private nomeRubricas: any;

    constructor(pastaExecucao: string) {
        this.pastaExecucao = pastaExecucao;
        this.caminho = '';
    }

    public setNomeRubricas(nomeRubricas: any) {
        this.nomeRubricas = nomeRubricas;
    }

    public construirCaminho(c: any, acao: string): string {

        if(acao === 'abrirRubPer') {
            //        C:/folha/execucao/Emp_01_TOCANTINS/Destino_delta        _SRVFVJ              /VJ              /F_2016              04                           034                   _E00001                   /Debug/Folha12-NF001245988              /SF02                     -NV03                     -SV01                     -Ano2016              /SF02                     -NV03                     -SV01                     -Mes2016              04                           -SM01.dbg
            this.caminho = `${this.pastaExecucao}/Destino_${c.ambiente}_${c.servidorCalculo}/${c.tipoCalculo}/F_${c.mesAnoFol.ano}${ES.pad(c.mesAnoFol.mes, 2)}${ES.pad(c.numFol, 3)}_E${ES.pad(c.execucao, 5)}/Debug/Folha12-NF${ES.pad(c.numFunc, 9)}/SF${ES.pad(c.seqFunc, 2)}-NV${ES.pad(c.numVinc, 2)}-SV${ES.pad(c.seqVinc, 2)}-Ano${c.mesAnoRub.ano}/SF${ES.pad(c.seqFunc, 2)}-NV${ES.pad(c.numVinc, 2)}-SV${ES.pad(c.seqVinc, 2)}-Mes${c.mesAnoRub.ano}${ES.pad(c.mesAnoRub.mes, 2)}-SM01.dbg`;
            console.log(this.caminho);
        }
        if(acao === 'abrirRubLiq') {
            //        C:/folha/execucao/Emp_01_TOCANTINS/Destino_delta        _SRVFVJ              /VJ              /F_2016              04                           034                   _E00001                   /Debug/Folha12-NF001245988              /SF02                     -NV03                     -SV01                     -Liquido-SL01.dbg
            this.caminho = `${this.pastaExecucao}/Destino_${c.ambiente}_${c.servidorCalculo}/${c.tipoCalculo}/F_${c.mesAnoFol.ano}${ES.pad(c.mesAnoFol.mes, 2)}${ES.pad(c.numFol, 3)}_E${ES.pad(c.execucao, 5)}/Debug/Folha12-NF${ES.pad(c.numFunc, 9)}/SF${ES.pad(c.seqFunc, 2)}-NV${ES.pad(c.numVinc, 2)}-SV${ES.pad(c.seqVinc, 2)}-Liquido-SL01.dbg`;
            console.log(this.caminho);
        }

        return this.caminho;
    }

    public parseArquivo(conteudoArq: string): any {

        // TODO: refatorar esse método

        let novoConteudo: string = '';
        let index: any = {};
        let indexLinha: any[] = [];
        let indexPeriodo: any[] = [];
        let diasPerTotal: number = -1;

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
            let novaLinha: string;
            let rubInfo: string = '';
            let perInfo: string = '';
            let periodoDados: RegExpExecArray | null = this.periodoRegex.exec(linha);
            this.periodoRegex.lastIndex = 0;
            let atribEntra: RegExpExecArray | null = this.rubricaEntraRegex.exec(linha);
            this.rubricaEntraRegex.lastIndex = 0;
            let atribSai: RegExpExecArray | null = this.rubricaSaiRegex.exec(linha);
            this.rubricaSaiRegex.lastIndex = 0;

            let fmt = (dados: DadosLinha, rubInfo:string, perInfo:string): string => {
                
                let campoRubrica: string;
                let nomeRubrica: string = '?';

                if(this.nomeRubricas[dados.rubrica]) {
                    nomeRubrica = this.nomeRubricas[dados.rubrica].nome.trim();
                }

                if(dados.rubrica !== '0') {
                    let cpl: string = dados.complemento === '' ? '' : ` - "${dados.complemento}"`;
                    campoRubrica = `${dados.rubrica} ${nomeRubrica}${cpl}`;
                }
                else {
                    campoRubrica = dados.mnemonico;
                }
                
                let linhaFmt: string =
                        `<span class="nomeRubrica">${campoRubrica}${rubInfo}</span>` +
                        `<span class="c periodo">${dados.periodo}${perInfo}</span>` +
                        `<span class="c resultadoRub">${dados.valCalc}</span>` +
                        `<span class="c resultadoRub">${dados.valPago}</span>` +
                        `<span class="c resultadoRub">${dados.valLiq}</span>` +
                        `<span class="c resultadoRub">${dados.movCalc}</span>` +
                        `<span class="c resultadoRub">${dados.movPago}</span>` +
                        `<span class="c resultadoRub">${dados.movLiq}</span>`;
                
                return linhaFmt;
            };

            if(periodoDados) {
                novaLinha = `<span class="texto">${linha}</span>`;

                if(+periodoDados[1] === 0) {
                    diasPerTotal = +periodoDados[10];
                }

                indexPeriodo.push({
                    priodo: +periodoDados[1],
                    dataIni: +periodoDados[2],
                    diaIni: +periodoDados[5],
                    dataFim: +periodoDados[6],
                    diaFim: +periodoDados[9],
                    dias: +periodoDados[10],
                    fracao: +periodoDados[10] / diasPerTotal
                });
            }
            // Rubrica entra 'RE'
            else if(atribEntra) {
                const dados: DadosLinha = this.novoDadosLinha(atribEntra, 'RE');

                pilha.push(dados.rubrica);
                for(let item of pilha) {
                    rubInfo += `<span class="c csb">>></span>${item}`;
                }

                rubInfo = `<span class="tooltip">Pilha: ${rubInfo}<span class="c csb">>></span></span>\n`;

                if(+dados.periodo < indexPeriodo.length) {
                    let dadosPer: any = indexPeriodo[+dados.periodo];
                    perInfo = `<span class="tooltip">Período ${dadosPer.priodo}: de ${dadosPer.diaIni} à ${dadosPer.diaFim} | ${dadosPer.dias} dia(s)</span>\n`;
                }

                let linhaFmt: string = '<span class="c csb">>></span>' + fmt(dados, rubInfo, perInfo);
                
                novaLinha = `<div class="rubEntra">${linhaFmt}</div>`;
                index[`RE_${dados.periodo}_${dados.rubrica}`] = numLinha;
                indexLinha.push({
                    linha: numLinha,
                    tipo: 'RE',
                    perido: dados.periodo,
                    rubrica: dados.rubrica
                });
            }
            // Rubrica sai 'RS'
            else if(atribSai) {
                const dados: DadosLinha = this.novoDadosLinha(atribSai, 'RS');

                // Removendo a rubrica da pilha de rubricas
                if(pilha[pilha.length -1] === dados.rubrica) {
                    pilha.pop();
                }

                rubInfo = '<span class="c csb"><<</span>';
                for(let item of pilha) {
                    rubInfo += `${item}<span class="c csb"><<</span>`;
                }

                rubInfo = `<span class="tooltip">Pilha: ${rubInfo}</span>\n`;

                if(+dados.periodo < indexPeriodo.length) {
                    let dadosPer: any = indexPeriodo[+dados.periodo];
                    perInfo = `<span class="tooltip">Período ${dadosPer.priodo}: de ${dadosPer.diaIni} à ${dadosPer.diaFim} | ${dadosPer.dias} dia(s)</span>\n`;
                }
                
                let linhaFmt: string = `<span class="c csb"><<</span>` + fmt(dados, rubInfo, perInfo);
                
                novaLinha = `<div class="rubSai">${linhaFmt}</div>`;
                
                // TODO: complemento não indexado, busca por complemento não está funcionando
                index[`RS_${dados.periodo}_${dados.rubrica}`] = numLinha;
                indexLinha.push({
                    linha: numLinha,
                    tipo: 'RS',
                    perido: dados.periodo,
                    rubrica: dados.rubrica
                });
            }
            else {
                novaLinha = `<span class="texto">${linha}</span>`;
            }

            novaLinha = `<div class="lin"><span id="linha_${numLinha}" class="contLinha">${numLinha}</span>${novaLinha}</div>\n`;
            novoConteudo += novaLinha;
            numLinha++;
        }

        return {texto: novoConteudo, caminho: this.caminho, index: index, indexLinha: indexLinha, indexPeriodo: indexPeriodo};
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