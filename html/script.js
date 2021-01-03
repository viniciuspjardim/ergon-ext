window.vscode = acquireVsCodeApi();

window.rubricaLinhaIdx = {};
window.linhaRubricaIdx = {};
window.periodoIdx = {};

window.autoCompletar = null;
window.autoCompletarLista = [];
window.camposAutoCompletar = ['ambiente', 'servidorCalculo', 'tipoCalculo', 'mesAnoFol', 'numFol',
  'execucao', 'numFunc', 'numVinc', 'seqFunc', 'seqVinc', 'mesAnoRub'];

window.forcarRecarregar = false;
window.filtrarAutocompletar = true;

window.carregandoAutocompletar = true;
window.carregandoArquivos = false;

/**
 * Tentativa da melhorar o el.innerHTML = 'algo', pois demora pra remover os elementos
 * bem mais do que pra incluir. Pra remover demora +- 10s pra incluir +- 2s.
 * Mesmo se trantando exatamente dos mesmos elementos...
 * Existem vários posts falando sobre isso, mas nenhum conseguiu reduzir o tempo
 * para remover os elementos.
 * 
 * Não está sendo usado, pois não melhorou o desempenho e quebrou as teclas
 * atalho
 */
function replaceInnerHTML(html) {
  let el = document.getElementById('conteudoArquivo');
  el.remove();
  let newEl = document.createElement("PRE");
  newEl.id = 'conteudoArquivo';
  newEl.tabIndex = 50;
  newEl.innerHTML = html;
  document.getElementById('main').appendChild(newEl);
  console.log('shit');
};

function mensagem() {
  let el = document.getElementById('msgAoCarregar');
  if(window.carregandoArquivos) {
    el.innerHTML = 'Carregando...';
    el.style.visibility = 'visible';
  }
  else if(window.carregandoAutocompletar) {
    el.innerHTML = 'Carregando autocompletar...';
    el.style.visibility = 'visible';
  }
  else {
    el.style.visibility = 'hidden';
  }
}

mensagem();

function pad(num, padlen) {
  var pad = new Array(1 + padlen).join('0');
  return (pad + num).slice(-pad.length);
}

function textoParaData(texto) {
  if (!texto) return '';
  let arr = texto.trim().split('/');
  return { mes: parseInt(arr[0]), ano: parseInt(arr[1]) };
}

function dataParaTexto(data) {
  if (!data || !data.mes || !data.ano) return '';
  return pad(data.mes, 2) + '/' + pad(data.ano, 4)
}

function getCampos() {
  let campos = {
    ambiente: document.getElementById('ambiente').value,
    servidorCalculo: document.getElementById('servidorCalculo').value,
    tipoCalculo: document.getElementById('tipoCalculo').value,
    mesAnoFol: textoParaData(document.getElementById('mesAnoFol').value),
    numFol: document.getElementById('numFol').value,
    execucao: document.getElementById('execucao').value,
    numFunc: document.getElementById('numFunc').value,
    numVinc: document.getElementById('numVinc').value,
    seqFunc: document.getElementById('seqFunc').value,
    seqVinc: document.getElementById('seqVinc').value,
    mesAnoRub: textoParaData(document.getElementById('mesAnoRub').value),
    rubrica: document.getElementById('rubrica').value,
    complemento: document.getElementById('complemento').value,
    periodo: document.getElementById('periodo').value,
    tipo: document.getElementById('tipo').value,
    acao: document.getElementById('acao').value
  };
  return campos;
}

window.addEventListener('message', event => {

  let m = event.data;

  switch (m.acao) {

    case 'parse_rubrica_ok':

      window.carregandoArquivos = false;  
      mensagem();

      // Quando não é nulo o arquivo mudou, então precisa alterar o conteúdo
      // da página e voltar a barra de rolagem pro começo
      if (m.conteudo.texto !== null) {

        // Inserindo dados no elemento
        const html =
          '<a class="caminho" href="' + m.conteudo.caminho + '">'
          + m.conteudo.caminho.replace(/\//g, '\\') + '</a>'
          + m.conteudo.texto;
        
        document.getElementById('conteudoArquivo').innerHTML = html;

        window.rubricaLinhaIdx = m.conteudo.rubricaLinhaIdx;
        window.linhaRubricaIdx = m.conteudo.linhaRubricaIdx;
        window.periodoIdx = m.conteudo.periodoIdx;
        window.scrollTo(0, 0);

        // Enviando mensagem para o controlador ao clicar nos links para
        // abrir o arquivo correspondente
        var aTags = document.getElementsByTagName('a');

        for (i = 0; i < aTags.length; i++) {
          aTags[i].addEventListener('click', function (event) {
            window.vscode.postMessage({
              acao: 'abrirCaminho',
              caminho: event.target.getAttribute("href"),
              linha: event.target.getAttribute("nlin")
            });
          });
        }
      }

      // Montando a chave do índice com os valores do filtro para encontrar a linha
      // da rubrica buscada

      const tipo = document.getElementById('tipo').value;
      const perido = document.getElementById('periodo').value;
      const rubrica = document.getElementById('rubrica').value;
      const complemento = document.getElementById('complemento').value;

      const linhaId = 'linha_' + window.rubricaLinhaIdx[tipo + '\n' + perido +
        '\n' + rubrica + '\n' + complemento];

      const elemento = document.getElementById(linhaId);

      if (elemento) {
        elemento.scrollIntoView();
        window.scrollBy(0, -document.getElementById('cabeçalho').offsetHeight);
      }
      else {
        console.log('Elemento não econtrado!');
      }

      // Colocando o foco no conteúdo do arquivo para as teclas atalhos funcionarem
      document.getElementById('conteudoArquivo').focus();

      break;
    case 'parse_rubrica_err':
      window.carregandoArquivos = false;  
      mensagem();
      document.getElementById('conteudoArquivo').innerHTML = m.conteudo;
      break;
    case 'filtro':
      document.getElementById('ambiente').value = m.conteudo.ambiente;
      document.getElementById('servidorCalculo').value = m.conteudo.servidorCalculo;
      document.getElementById('tipoCalculo').value = m.conteudo.tipoCalculo;
      document.getElementById('mesAnoFol').value = dataParaTexto(m.conteudo.mesAnoFol);
      document.getElementById('numFol').value = m.conteudo.numFol;
      document.getElementById('execucao').value = m.conteudo.execucao;
      document.getElementById('numFunc').value = m.conteudo.numFunc;
      document.getElementById('numVinc').value = m.conteudo.numVinc;
      document.getElementById('seqFunc').value = m.conteudo.seqFunc;
      document.getElementById('seqVinc').value = m.conteudo.seqVinc;
      document.getElementById('mesAnoRub').value = dataParaTexto(m.conteudo.mesAnoRub);
      document.getElementById('rubrica').value = m.conteudo.rubrica;
      document.getElementById('complemento').value = m.conteudo.complemento;
      document.getElementById('periodo').value = m.conteudo.periodo;
      document.getElementById('tipo').value = m.conteudo.tipo;
      document.getElementById('acao').value = m.conteudo.acao;
      break;
    case 'autocompletar_ok':
      window.carregandoAutocompletar = false;  
      mensagem();
      window.autoCompletar = m.conteudo;
      break;
    case 'autocompletar_err':
      window.carregandoAutocompletar = false;  
      mensagem();
      break;
  }
});

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('rubrica').focus();
}, false);

document.getElementById('abrirIr').addEventListener('click', function () {
  window.carregandoArquivos = true;  
  if(window.forcarRecarregar) window.carregandoAutocompletar = true;  
  mensagem();

  let acao = document.getElementById('acao').value;
  let campos = getCampos();
  let forcar = window.forcarRecarregar;

  window.vscode.postMessage({
    acao: acao,
    filtro: campos,
    // Forçar recarregamento do arquivo
    forcar: forcar
  });

  window.forcarRecarregar = false;
});

document.getElementById('campos').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    document.getElementById('abrirIr').click();
  }
});

function getProximoHeader(idAtual) {
  let linhaAtual = parseInt(idAtual.split('_')[1]);

  // Converter para busca binária
  for (var i = 0; i < window.linhaRubricaIdx.length; i++) {
    if (window.linhaRubricaIdx[i].linha > linhaAtual) {
      return window.linhaRubricaIdx[i];
    }
  }
  return null;
}

function getHeaderAnterior(idAtual) {
  let linhaAtual = parseInt(idAtual.split('_')[1]);

  // Converter para busca binária
  for (var i = window.linhaRubricaIdx.length - 1; i >= 0; i--) {
    if (window.linhaRubricaIdx[i].linha < linhaAtual) {
      return window.linhaRubricaIdx[i];
    }
  }
  return null;
}

function focoNoCampo(idCampo, e) {

  document.getElementById(idCampo).focus();
  document.getElementById(idCampo).select();

  // Bloqueando o evento padrão para a tecla atalho pressionada não ser inserida no campo
  if (e.preventDefault) e.preventDefault();
  e.returnValue = false;

  return false;
}

document.getElementById('conteudoArquivo').addEventListener('keypress', function (e) {
  // Pega o id da primeira linha visível
  let id = document.elementFromPoint(50, document.getElementById('cabeçalho').offsetHeight + 1).id;
  let key = e.key.toLowerCase();

  if (key === '.') {
    let proximoHeader = getProximoHeader(id);
    // Se existe um próximo header scroll até ele
    if (proximoHeader) {
      const linhaId = 'linha_' + proximoHeader.linha;
      document.getElementById(linhaId).scrollIntoView();
      window.scrollBy(0, -document.getElementById('cabeçalho').offsetHeight);
    }
  }
  else if (key === ',') {
    let headerAnterior = getHeaderAnterior(id);
    // Se existe um header anterior scroll até ele
    if (headerAnterior) {
      const linhaId = 'linha_' + headerAnterior.linha;
      document.getElementById(linhaId).scrollIntoView();
      window.scrollBy(0, -document.getElementById('cabeçalho').offsetHeight);
    }
  }
  else if (key === 'a') return focoNoCampo('ambiente', e);
  else if (key === 'f') return focoNoCampo('numFunc', e);
  else if (key === 'v') return focoNoCampo('numVinc', e);
  else if (key === 'd') return focoNoCampo('mesAnoRub', e);
  else if (key === 'r') return focoNoCampo('rubrica', e);
  else if (key === 'p') return focoNoCampo('periodo', e);
  else if (key === 'e' || key === 's') {
    if (key === 'e') document.getElementById('tipo').value = 'RE';
    else document.getElementById('tipo').value = 'RS';
    focoNoCampo('tipo', e);
  }
  else if (key === 'c') {
    window.forcarRecarregar = true;
    document.getElementById('abrirIr').click();
  }

  return true;
});

function listaAutoCompletarRec(inputId, noArvore, arr) {

  // Se é um dos campos buscados, adiciona no array
  if (noArvore.campo == inputId) {
    arr.push(noArvore.valor);
  }
  // Se não é, mas é um campo pai e o valor bate com o que está no filtro, chama recursivo
  // para aprofundar um nível
  else if (noArvore.campo === 'raiz' || noArvore.valor === document.getElementById(noArvore.campo).value) {
    for (var i = 0; i < noArvore.filhos.length; i++) {
      listaAutoCompletarRec(inputId, noArvore.filhos[i], arr);
    }
  }
}

function listaAutoCompletar(inputId) {

  if (window.autoCompletar == null) {
    return [];
  }
  var arr = [];
  listaAutoCompletarRec(inputId, window.autoCompletar, arr);
  return arr;
}

function autocomplete(inp) {

  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;

  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function (e) {

    var arr = window.autoCompletarLista;

    // Valor que será o filtro do auto completar
    var val = '';

    // Não filtra, pois o usuário acabou de clicar nele
    // É pra filtrar apenas se o usuário digitar algo
    if (this.selectionStart === 0 || !window.filtrarAutocompletar) val = '';
    else val = this.value;

    var a, b, i;
    /*close any already open lists of autocompleted values*/
    closeAllLists();
    // if (!val) { return false; }
    currentFocus = -1;
    /*create a DIV element that will contain the items (values):*/
    a = document.createElement("DIV");
    a.setAttribute("id", this.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    /*append the DIV element as a child of the autocomplete container:*/
    this.parentNode.appendChild(a);
    /*for each item in the array...*/
    for (var i = 0; i < arr.length; i++) {
      /*check if the item starts with the same letters as the text field value:*/
      if (val == '' || arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
        /*create a DIV element for each matching element:*/
        b = document.createElement("DIV");
        /*make the matching letters bold:*/
        b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
        b.innerHTML += arr[i].substr(val.length);
        /*insert a input field that will hold the current array item's value:*/
        b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
        /*execute a function when someone clicks on the item value (DIV element):*/
        b.addEventListener("click", function (e) {
          /*insert the value for the autocomplete text field:*/
          inp.value = this.getElementsByTagName("input")[0].value;
          /*close the list of autocompleted values,
          (or any other open lists of autocompleted values:*/
          closeAllLists();
        });
        a.appendChild(b);
      }
    }
  });

  // Gera a lista e força um evento para abrir a lista de auto complete ao receber foco.
  inp.addEventListener("focus", function (e) {

    // Forçando não filtrar o autocompletar ao receber o foco
    window.filtrarAutocompletar = false;
    setTimeout(() => {
      window.filtrarAutocompletar = true;
    }, 1);

    window.autoCompletarLista = listaAutoCompletar(this.id);

    // Invertendo a lista se for os campos de data para ficar o mais recente primeiro
    if (['mesAnoFol', 'mesAnoRub'].includes(this.id)) {
      window.autoCompletarLista = window.autoCompletarLista.reverse();
    }

    inp.dispatchEvent(new Event('input'));
  });

  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function (e) {

    if (window.autoCompletarLista == null || window.autoCompletarLista.length < 1) return;

    var x = document.getElementById(this.id + "autocomplete-list");
    if (x) x = x.getElementsByTagName("div");
    if (e.keyCode == 40) {
      /*If the arrow DOWN key is pressed,
      increase the currentFocus variable:*/
      currentFocus++;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 38) { //up
      /*If the arrow UP key is pressed,
      decrease the currentFocus variable:*/
      currentFocus--;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 13) {

      if (currentFocus > -1) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        /*and simulate a click on the "active" item:*/
        if (x) {
          x[currentFocus].click();
          currentFocus = -1;
        }
      }
    }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    if (x && x[currentFocus]) {
      x[currentFocus].classList.add("autocomplete-active");
    }
  }
  function removeActive(x) {

    if (!x) return false;

    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {

    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/

    var x = document.getElementsByClassName("autocomplete-items");

    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
    if (e.target instanceof HTMLInputElement) {
      e.target.select();
      if (e.target.id && window.camposAutoCompletar.includes(e.target.id)) {
        return false;
      }
    }
    closeAllLists(e.target);
  });
}

function adicionarAutoComplete() {
  for (var i = 0; i < window.camposAutoCompletar.length; i++) {
    autocomplete(document.getElementById(window.camposAutoCompletar[i]));
  }
}

adicionarAutoComplete();
