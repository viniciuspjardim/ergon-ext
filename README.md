# Ergon Ext

![Ergon Ext](imagens/icone.png)

É uma extensão do VS Code que facilita a navegação pelos arquivos de log e debug do sistema
de RH Ergon que é desenvolvido pela Techne.

## Instalando
1. Baixe a última versão da extensão (arquivo `.vsix`) em
[releases](https://github.com/viniciuspjardim/ergon-ext/releases) no GitHub; 
2. Abra a guia de extensões no VS Code (`Ctrl` + `Shift` + `X`), clique em `...`
na parte superior da guia e `Install from VSIX...`;
3. Selecione o arquivo baixado.

## Configurando
É necessário fornecer a pasta de execução da folha do Ergon e o arquivo com os nomes de
rubricas. Veja os passos abaixo.

```sql
select rubrica, nome_abrev nome, mnemonico, tiporubr, fat_vant, e_cons
    from rubricas
    order by rubrica, nome
;
```

1. Para gerar o arquivo com os nomes das rubricas execute a query acima no banco de
dados e exporte o resultado como arquivo JSON;

2. Abra a paleta de comandos do VS Code (`Ctrl` + `Shift` + `P`) e digite: 
`Ergon: Caminho da pasta de execução da folha`;

3. Selecione a pasta da empresa que fica dentro da pasta de execução da folha.
Exemplo: `C:\folha\execucao\Emp_01_TOCANTINS`;

4. Na paleta de comandos digite:
`Ergon: Caminho do arquivo de rubricas` e selecione o arquivo de rubricas exportado
na etapa 1.

## Abrir a extensão
Abra a paleta de comandos (`Ctrl` + `Shift` + `P`) e digite: `Ergon: Carregar arquivos`.

## Recursos
* Abrir o arquivo correto simplesmente alterando os campos do filtro;
* Função de autocompletar para os campos do filtro (escaneia as pastas de execução para
sugerir os valores);
* Indexa pontos importantes dos arquivos, como entrada e saída de rubricas, sendo possível
navegar alterando os filtros ou com teclas atalho;
* Formata os arquivos de texto facilitando a legibilidade;
* Salva os campos de filtro para quando a extensão for aberta novamente continuar de onde
parou;
* Clicar nos caminhos de arquivos (de erros de compilação por exemplo) e abrir o arquivo
na linha correta;
* Suporta os diferentes temas do VS Code.

## Arquivos Suportados
* Per - `.../Debug/Folha12*/*Ano*/*.dbg` - logs das fórmulas de período e total;
* Liq - `.../Debug/Folha12*/*Liquido*.dbg` - logs das fórmulas de líquido;
* Err - `.../Fontes/Fo*g.tmp` - mensagens de alerta e erro do compilador;
* Dump - `.../Log/Folha11.LOG` - arquivos de dump das tabelas utilizadas pela folha.

## Teclas Atalho
* `a` - selecionar valor do campo `Ambiente`;
* `f` - selecionar valor do campo `Func` (número funcional);
* `v` - selecionar valor do campo `Vinc` (número de vínculo);
* `d` - selecionar valor do campo `DataRub` (mês ano direito);
* `r` - selecionar valor do campo `Rub` (rubrica);
* `p` - selecionar valor do campo `Per` (período);
* `e` - selecionar linha de entrada da rubrica (campo `E\S`);
* `s` - selecionar linha de saída da rubrica (campo `E\S`);
* `.` - ir para a próxima linha de cabeçalho;
* `,` - ir para a linha de cabeçalho anterior;
* `c` - forçar recarregar arquivo e campos do autocompletar. Útil quando há alterações.
externas

## Galeria

<img src="https://user-images.githubusercontent.com/1520962/56060144-50692600-5d3c-11e9-962e-4b04131fdbdb.png" width="640">

Ver a galeria completa [aqui](galeria.md).
