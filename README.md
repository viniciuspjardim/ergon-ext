# Ergon Ext
É uma extensão do VS Code que facilita a navegação pelos arquivos de log e debug do sistema
de RH Ergon que é desenvolvido pela Techne. Para abrir a extensão aperte `Ctrl` + `Shift` +
`P` e digite `Ergon: Carregar arquivos`.

## Configurando
É necessário fornecer o caminho da pasta de execução e do arquivo com os nomes de rubricas.
Veja os passos de 1 a 3 abaixo.

Para gerar o arquivo com as rubricas execute a seguinte query no banco de dados:
`select rubrica, nome_abrev nome, mnemonico, tiporubr, fat_vant, e_cons from rubricas order by rubrica, nome;`
e exporte o arquivo como JSON.

Para evitar digitar os campos de filtro ao abrir a extensão é possível configurar também os
campos padrão.

1. Abra o arquivo de configurações de usuário do VS Code: `Ctrl` + `Shift` + `P` e digite `Preferences: Open User Settings`;
2. Do lado direito na aba `User Settings`, adicione o campo `"ergonExt": {...}` no arquivo.
Exemplo:

```json
{
    "ergonExt": {

        "caminhoExecucao": "(...)/execucao/Emp_(...)",
        "charsetExecucao": "1252",
        "caminhoRubricas": "(...)",
        "charsetRubricas": "utf8",

        "camposPadrao": {
            "ambiente": "producao",
            "servidorCalculo": "SRVF1",
            "tipoCalculo": "Real",
            "mesAnoFol": {"mes": 4, "ano": 2018},
            "numFol": 15,
            "execucao": 1,
            "numFunc": 123456,
            "numVinc": 1,
            "mesAnoRub": {"mes": 4, "ano": 2018},
            "seqFunc": 2,
            "seqVinc": 1,
            "rubrica": 1001,
            "complemento": "",
            "periodo": 1,
            "tipo": "RE",
            "acao": "abrirRubPer"
        }
    }
}
```
3. Salve o arquivo.

## Arquivos Suportados
* `(...)/Fontes/Fo*g.tmp` - mensagens de alerta e erro do compilador
* `(...)/Debug/Folha12*/*Liquido*.dbg` - logs das fórmulas de líquido
* `(...)/Debug/Folha12*/*Ano*/*.dbg` - logs das fórmulas de período e total

## Teclas Atalho
* `.` - ir para a próxima linha de cabeçalho
* `,` - ir para a linha de cabeçalho anterior

## Galeria
<img src="https://user-images.githubusercontent.com/1520962/43740025-70ede060-99a0-11e8-9907-42a959d475c5.png" width="640" height="360">
