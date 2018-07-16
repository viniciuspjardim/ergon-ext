'use strict';

import * as vscode from 'vscode';
import fs = require('fs');
import iconv = require('iconv-lite');

/** Classe de entrada e saida de dados */
export class ES {

    public static decodeBuffer(data: Buffer, charset: string): string {
        return iconv.decode(data, charset);
    }

    /** Lê arquivo de forma assincrona */
    public static lerArquivo(caminho: string, callback: (err: NodeJS.ErrnoException, data: string) => void, charset: string = "utf8"): void {
        fs.readFile(caminho, (erro: NodeJS.ErrnoException, buffer: Buffer) => {
            const data: string = iconv.decode(buffer, charset);
            callback(erro, data);
        });
    }

    /** Lê arquivo de forma sincrona */
    public static lerArquivoSync(caminho: string, charset: string = "utf8"): string {
        return iconv.decode(fs.readFileSync(caminho), charset);
    }

    /** Envia conteudo para o webview */
    public static enviarParaWebviw(panel: vscode.WebviewPanel, acao: string, conteudo: any, delay?: number): void {
        const mensagem: any  = {
            acao: acao,
            conteudo: conteudo
        };

        if(!delay) {
            panel.webview.postMessage(mensagem);
        }
        else {
            setTimeout(() => {panel.webview.postMessage(mensagem);}, delay);
        }
    }

    public static pad(num: number, padlen: number): string {
        let pad = new Array(1 + padlen).join('0');
        return (pad + num).slice(-pad.length);
    }
}