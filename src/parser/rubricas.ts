'use strict';

import { ES } from '../es';

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

export class Rubricas implements Parser {

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
            // C:/folha/execucao/Emp_01_TOCANTINS/Destino_delta        _SRVFVJ              /VJ              /F_2016              04                           034                   _E00001                   /Debug/Folha12-NF001245988              /SF02                     -NV03                     -SV01                     -Ano2016              /SF02                     -NV03                     -SV01                     -Mes2016              04                           -SM01.dbg
            this.caminho = `${this.pastaExecucao}/Destino_${c.ambiente}_${c.servidorCalculo}/${c.tipoCalculo}/F_${c.mesAnoFol.ano}${ES.pad(c.mesAnoFol.mes, 2)}${ES.pad(c.numFol, 3)}_E${ES.pad(c.execucao, 5)}/Debug/Folha12-NF${ES.pad(c.numFunc, 9)}/SF${ES.pad(c.seqFunc, 2)}-NV${ES.pad(c.numVinc, 2)}-SV${ES.pad(c.seqVinc, 2)}-Ano${c.mesAnoRub.ano}/SF${ES.pad(c.seqFunc, 2)}-NV${ES.pad(c.numVinc, 2)}-SV${ES.pad(c.seqVinc, 2)}-Mes${c.mesAnoRub.ano}${ES.pad(c.mesAnoRub.mes, 2)}-SM01.dbg`;
            console.log(this.caminho);
        }
        if(acao === 'abrirRubLiq') {
            // C:/folha/execucao/Emp_01_TOCANTINS/Destino_delta        _SRVFVJ              /VJ              /F_2016              04                           034                   _E00001                   /Debug/Folha12-NF001245988              /SF02                     -NV03                     -SV01                     -Liquido-SL01.dbg
            this.caminho = `${this.pastaExecucao}/Destino_${c.ambiente}_${c.servidorCalculo}/${c.tipoCalculo}/F_${c.mesAnoFol.ano}${ES.pad(c.mesAnoFol.mes, 2)}${ES.pad(c.numFol, 3)}_E${ES.pad(c.execucao, 5)}/Debug/Folha12-NF${ES.pad(c.numFunc, 9)}/SF${ES.pad(c.seqFunc, 2)}-NV${ES.pad(c.numVinc, 2)}-SV${ES.pad(c.seqVinc, 2)}-Liquido-SL01.dbg`;
            console.log(this.caminho);
        }

        return this.caminho;
    }

    /** Percorre as linhas do arquivo formatando e indexando os tipos de linhas conhecidos */
    public parseArquivo(conteudoArq: string): any {
        
        let rubricaLinhaIdx: any = {};
        let linhaRubricaIdx: any[] = [];
        let periodoIdx: any[] = [];

        // Adiciona valores nos índices
        const addIdx = (d: DadosLinha): void => {

            // Hash Table / índice onde a chave é <RE|RS, periodo, rubrica e complemento> e o
            // valor é a linha onde essa rubrica está no arquivo.
            // Usado para encontar a linha de uma rubrica
            rubricaLinhaIdx[`${d.tipoLinha}\n${d.periodo}\n${d.rubrica}\n${d.complemento}`] = numLinha;

            // Adicionando uma chave sem complemento na primeira vez que encontra a rubica X com
            // complemento. Útil para encontrar a primeira ocorrência da rubrica X sem passar
            // o campo complemento no filtro
            if(d.complemento !== '') {
                const chave = `${d.tipoLinha}\n${d.periodo}\n${d.rubrica}\n`;

                // Adiciona caso não exista
                if(!rubricaLinhaIdx[chave]) {
                    rubricaLinhaIdx[chave] = numLinha;
                }
            }
                
            // Array ordenado por linha onde contém os dados de qual rubrica está naquela linha.
            // Usado para encontrar rubricas próximas a uma linha
            linhaRubricaIdx.push({
                linha: numLinha,
                tipo: d.tipoLinha,
                perido: d.periodo,
                rubrica: d.rubrica,
                complemento: d.complemento
            });
        };

        // Conteúdo original pós processado/formatado
        let html: string = '';
        
        // Número de dias do perído total, ou seja do mês ano direito
        let diasPerTotal: number = -1;

        // Substituindo CRLF ou CR pelo LF
        conteudoArq = conteudoArq.replace(/\r\n/g, '\n');
        conteudoArq = conteudoArq.replace(/\r/g, '\n');

        let linhas: string[] = conteudoArq.split('\n');

        // Pilha da chamadas das rubricas
        let pilha: string[] = [];
        let numLinha: number = 1;
        let i: any;

        for(i in linhas) {

            let linha: string = linhas[i];
            let novaLinha: string;
            let rubInfo: string = '';
            let perInfo: string = '';
            
            let periodoDados: RegExpExecArray | null = null;
            let atribEntra: RegExpExecArray | null = null;
            let atribSai: RegExpExecArray | null = null;

            // Vendo se é uma linha do tipo periodoRegex
            periodoDados = this.periodoRegex.exec(linha);
            this.periodoRegex.lastIndex = 0;

            // Se não for, ve se é de rubricaEntraRegex
            if(!periodoDados) {
                atribEntra = this.rubricaEntraRegex.exec(linha);
                this.rubricaEntraRegex.lastIndex = 0;
            }

            // Se não for nenhum dos dois acima, ve se é de rubricaSaiRegex
            if(!periodoDados && !atribEntra) {
                atribSai = this.rubricaSaiRegex.exec(linha);
                this.rubricaSaiRegex.lastIndex = 0;
            }

            // Linha de periodoRegex
            if(periodoDados) {
                novaLinha = `<span class="tab texto">${linha}</span>`;

                if(+periodoDados[1] === 0) {
                    diasPerTotal = +periodoDados[10];
                }

                periodoIdx.push({
                    priodo: +periodoDados[1],
                    dataIni: +periodoDados[2],
                    diaIni: +periodoDados[5],
                    dataFim: +periodoDados[6],
                    diaFim: +periodoDados[9],
                    dias: +periodoDados[10],
                    fracao: +periodoDados[10] / diasPerTotal
                });
            }
            // Rubrica entra 'RE' (rubricaEntraRegex)
            else if(atribEntra) {
                const dados: DadosLinha = this.novoDadosLinha(atribEntra, 'RE');

                // Adicionando a rubrica da pilha de chamadas
                pilha.push(dados.rubrica);
                for(let item of pilha) {
                    rubInfo += `<span class="c csb">>></span>${item}`;
                }

                rubInfo = `<span class="tooltip">Pilha: ${rubInfo}<span class="c csb">>></span></span>\n`;

                if(+dados.periodo < periodoIdx.length) {
                    let dadosPer: any = periodoIdx[+dados.periodo];
                    perInfo = `<span class="tooltip">Período ${dadosPer.priodo}: de ${dadosPer.diaIni} à ${dadosPer.diaFim} | ${dadosPer.dias} de ${diasPerTotal} dias</span>\n`;
                }

                let linhaFmt: string = '<span class="c csb">>></span>' + this.fmt(dados, rubInfo, perInfo);
                
                novaLinha = `<div class="rubEntra">${linhaFmt}</div>`;

                // Adicionando dados aos índices
                addIdx(dados);
            }
            // Rubrica sai 'RS' (rubricaSaiRegex)
            else if(atribSai) {
                const dados: DadosLinha = this.novoDadosLinha(atribSai, 'RS');

                // Removendo a rubrica da pilha de chamadas
                if(pilha[pilha.length -1] === dados.rubrica) {
                    pilha.pop();
                }

                rubInfo = '<span class="c csb"><<</span>';
                for(let item of pilha) {
                    rubInfo += `${item}<span class="c csb"><<</span>`;
                }

                rubInfo = `<span class="tooltip">Pilha: ${rubInfo}</span>\n`;

                if(+dados.periodo < periodoIdx.length) {
                    let dadosPer: any = periodoIdx[+dados.periodo];
                    perInfo = `<span class="tooltip">Período ${dadosPer.priodo}: de ${dadosPer.diaIni} à ${dadosPer.diaFim} | ${dadosPer.dias} de ${diasPerTotal} dias</span>\n`;
                }
                
                let linhaFmt: string = `<span class="c csb"><<</span>` + this.fmt(dados, rubInfo, perInfo);
                
                novaLinha = `<div class="rubSai">${linhaFmt}</div>`;
                
                // Adicionando dados aos índices
                addIdx(dados);
            }
            else {
                novaLinha = `<span class="tab texto">${linha}</span>`;
            }

            novaLinha = `<div class="lin"><span id="linha_${numLinha}" class="contLinha">${numLinha}</span>${novaLinha}</div>\n`;
            html += novaLinha;
            numLinha++;
        }

        return {texto: html, caminho: this.caminho, rubricaLinhaIdx: rubricaLinhaIdx,
            linhaRubricaIdx: linhaRubricaIdx, periodoIdx: periodoIdx};
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

    /** Formata linha de header */
    private fmt (d: DadosLinha, rubInfo:string, perInfo:string): string {
                
        let campoRubrica: string;
        let nomeRubrica: string = '?';

        if(this.nomeRubricas[d.rubrica]) {
            nomeRubrica = this.nomeRubricas[d.rubrica].nome.trim();
        }

        if(d.rubrica !== '0') {
            let cpl: string = d.complemento === '' ? '' : ` - "${d.complemento}"`;
            campoRubrica = `${d.rubrica} ${nomeRubrica}${cpl}`;
        }
        else {
            campoRubrica = d.mnemonico;
        }
        
        let linhaFmt: string =
                `<span class="nomeRubrica">${campoRubrica}${rubInfo}</span>` +
                `<span class="c periodo">${d.periodo}${perInfo}</span>` +
                this.formatarValor(d.valCalc) +
                this.formatarValor(d.valPago) +
                this.formatarValor(d.valLiq) +
                this.formatarValor(d.movCalc) +
                this.formatarValor(d.movPago) +
                this.formatarValor(d.movLiq);
        
        return linhaFmt;
    }

    private valorEmNumero(valorStr: string): number {
        let valor: number = Number(valorStr);
        return valor <= -139999999999 ? 0 : valor;
    }

    private formatarValor(valor: number): string {
        if(valor === 0) {
            return '<span class="c vRub z">0</span>';
        }
        else {
            return `<span class="c vRub">${valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>`;
        }
    }
}
