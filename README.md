# Ergon Ext

![Ergon Ext](imagens/icone.png)

É uma extensão do VS Code que facilita a navegação pelos arquivos de log e debug do sistema
de RH Ergon que é desenvolvido pela Techne.

## Instalando
1. Baixe a última versão da extensão (arquivo `.vsix`) em
[releases](https://github.com/viniciuspjardim/ergon-ext/releases) no GitHub; 
2. Abra a guia de extensões no Visual Studio Code (`Ctrl` + `Shift` + `X`), clique em `...`
na parte superior da guia e `Install from VSIX...`;
3. Selecione o arquivo baixado.

## Configurando
É necessário fornecer o caminho da pasta de execução da folha do Ergon e o caminho do
arquivo com os nomes de rubricas. Veja os passos de 1 a 3 abaixo.

Para gerar o arquivo com os nomes das rubricas execute a seguinte query no banco de dados:
`select rubrica, nome_abrev nome, mnemonico, tiporubr, fat_vant, e_cons from rubricas order by rubrica, nome;`
e exporte o arquivo como JSON.

1. Abra o arquivo de configurações de usuário do VS Code: `Ctrl` + `Shift` + `P` e digite
`Preferences: Open User Settings`;
2. Do lado direito na aba `User Settings`, adicione o campo `"ergonExt": {...}` no arquivo.
Exemplo:

```json
{
    ...,

    "ergonExt": {
        "caminhoExecucao": ".../execucao/Emp_...",
        "charsetExecucao": "1252",
        "caminhoRubricas": "...",
        "charsetRubricas": "utf8"
    }
}
```
3. Salve o arquivo.
4. Para abrir a extensão aperte `Ctrl` + `Shift` + `P` e digite `Ergon: Carregar arquivos`.

## Recursos
* Abrir o arquivo correto simplesmente alterando os campos do filtro
* Função de autocompletar para os campos do filtro (escaneia as pastas de execução para
sugerir os valores)
* Indexa pontos importantes dos arquivos, como entrada e saída de rubricas, sendo possível
navegar com teclas atalho. Exemplo: ir para a rubrica 3001 no período 0
* Formata os arquivos de texto facilitando a legibilidade
* Salva os campos de filtro para quando a extensão for aberta novamente continuar de onde
parou
* Clicar nos caminhos de arquivos (de erros de compilação por exemplo) e abrir o arquivo
na linha correta

## Arquivos Suportados
* Per - `.../Debug/Folha12*/*Ano*/*.dbg` - logs das fórmulas de período e total
* Liq - `.../Debug/Folha12*/*Liquido*.dbg` - logs das fórmulas de líquido
* Err - `.../Fontes/Fo*g.tmp` - mensagens de alerta e erro do compilador
* Dump - `.../Log/Folha11.LOG` - arquivos de dump das tabelas utilizadas pela folha

## Teclas Atalho
* `a` - selecionar valor do campo `Ambiente`
* `f` - selecionar valor do campo `Func` (número funcional)
* `v` - selecionar valor do campo `Vinc` (número de vínculo)
* `d` - selecionar valor do campo `DataRub` (mês ano direito)
* `r` - selecionar valor do campo `Rub` (rubrica)
* `p` - selecionar valor do campo `Per` (período)
* `e` - selecionar linha de entrada da rubrica (campo `E\S`)
* `s` - selecionar linha de saída da rubrica (campo `E\S`)
* `.` - ir para a próxima linha de cabeçalho
* `,` - ir para a linha de cabeçalho anterior
* `c` - forçar recarregar arquivo e campos do autocompletar. Útil quando há alterações
externas

## Galeria

<img src="https://user-images.githubusercontent.com/1520962/56060144-50692600-5d3c-11e9-962e-4b04131fdbdb.png" width="640">

Ver a galeria completa [aqui](galeria.md).
