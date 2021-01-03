'use strict';

import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as iconv from 'iconv-lite';

/** Classe de entrada e saida de dados */
export class ES {

    public static decodeBuffer(data: Buffer, charset: string): string {
        return iconv.decode(data, charset);
    }

    /** Lê arquivo de forma assíncrona */
    public static async lerArquivo(caminho: string, charset: string = 'utf8'): Promise<string> {
        return iconv.decode(await fs.readFile(caminho), charset);
    }

    /** Escreve arquivo de forma assíncrona */
    public static async escreverArquivo(caminho: string, conteudo: string, charset: string = 'utf8'): Promise<void> {
        await fs.writeFile(caminho, iconv.encode(conteudo, charset));
    }

    /** Envia conteúdo para o webview */
    public static async enviarParaWebviw(panel: vscode.WebviewPanel, acao: string, conteudo: any): Promise<boolean> {
        const mensagem: any  = { acao, conteudo };
        return await panel.webview.postMessage(mensagem);
    }

    public static pad(num: number, padlen: number): string {
        let pad = new Array(1 + padlen).join('0');
        return (pad + num).slice(-pad.length);
    }
}
