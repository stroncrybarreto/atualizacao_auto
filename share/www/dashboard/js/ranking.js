if (!!window.addEventListener) window.addEventListener('DOMContentLoaded', main);else window.attachEvent('onload', main);
curDate = new Date();
var dataDefault = curDate.getDate() + '/' + (curDate.getMonth() + 1) + '/' + curDate.getFullYear();
var empresaGrid = null;
var isIntegracaoIpp = null;
var urlDefault = "http://127.0.0.1:8000/";

function main() {
  urlDefault = urlDefault ? urlDefault : "http://127.0.0.1:8000/";
  getMain();
}

function updatePage() {
  isIE = /*@cc_on!@*/false || !!document.documentMode;
  if(isIE == true && document.getElementById("datePicker").value===dataDefault){
    window.location.reload();
  }else{
    updatePageNext()
  }  
};

function updatePageNext(){
  urlDefault = "http://127.0.0.1:8000/";
  var newDate = document.getElementById("datePicker").value;
  dataDefault = newDate ? newDate : dataDefault;
  $('#dataHora').html(dataDefault);
  $("#divLoader").show();
  getRankingVendas();
}

function logout() {
  $.getJSON(urlDefault + "Logout?", {}, function (data, status) {
  }).done(function () {
    alert('Não foi possível encerrar o serviço Dashboard!');
  }).fail(function () {
    alert('Serviço Dashboard finalizado! ');
  }).always(function () {
    window.close(this);
  });
}

function getMain() {
  $('#dataHora').html(dataDefault);
  $.getJSON(urlDefault + "Login?", {}, function (data, status) {
    if (status != 'success') {
      alert("Não foi possível localizar informações da empresa.");
    } else {
      $('#empresa').html(data.dados.empresa_nome);
      $('#usuario').html(data.dados.usuario_nome);
      empresaGrid = data.dados.empresa_grid;
      isIntegracaoIpp = data.dados.is_integracao_ipp;

      if (data.dados.is_devel === true) {
        document.getElementById("inputDate").style.display = "block";
      }

      getRankingVendas();
    }
  }).fail(function () {
    alert("Não foi possível estabelecer conexão com o serviço de Dashboard.");
  });
}

function getRankingVendas() {
  var params = {
    "empresa": empresaGrid,
    "data_base": dataDefault
  };
  $.getJSON(urlDefault + "RankingVendas?", params, function (data, status) {
    $("#divLoader").hide();

    if (status != 'success') {
      alert("Não foi possível localizar informações da empresa.");
    } else if (data.status == false || jQuery.isEmptyObject(data.dados.venda_list)) {
      document.getElementById("msgTableRanking").style.display = "block";
      document.getElementById("tableRankingContent").style.display = "none";
      var rankingVendasVip = document.getElementById('rankingVendasVip');
      rankingVendasVip.innerHTML = '&nbsp;';
    } else {
      document.getElementById("msgTableRanking").style.display = "none";
      document.getElementById("tableRankingContent").style.display = "flex";
      rankingVendas(data);
    };
  }).fail(function () {
    alert("Não foi possível estabelecer conexão com o serviço de Dashboard.");
  });
}

function rankingVendas(data) {
  // Limpar a tabela
  var myDataTable = $("#tableRankingContent").html('<table id="table_ranking" class="table-flex table"><thead></thead><tbody></tbody></table>');
  let vendaList = data.dados.venda_list;
  let produtoList = [];
  let usuarioList = [];
  let newHead = "";
  newHead = isIntegracaoIpp ? '<tr class="item item-head"><th class="name">VIP</th>' : '<tr class="item item-head"><th class="name">Vendedor</th>';

  for (var x in vendaList) {
    if (produtoList.indexOf(vendaList[x].produto_nome) == -1) {
      produtoList.push(vendaList[x].produto_nome);
      newHead += '<th class="">' + vendaList[x].produto_nome + '</th>';
    }

    ;

    if (usuarioList.indexOf(vendaList[x].vendedor_nome) == -1) {
      usuarioList.push(vendaList[x].vendedor_nome);
    }
  };
  newHead += '</tr>';
  $('thead').html(newHead);
  let newBody = "";

  for (var x in usuarioList) {
    newBody += '<tr class="item"><td class="name">' + usuarioList[x] + '</td>';
    var filtrado = vendaList.filter(function (obj) {
      return obj.vendedor_nome == usuarioList[x];
    });

    for (var y in filtrado) {
      newBody += '<td class="" ' + filtrado[y].produto_nome + '>' + filtrado[y].volume.toFixed(3) + '</td>';
    };
  };
  newBody += '</tr>';
  $('tbody').html(newBody);
  $(document).ready(function () {
    $("table", myDataTable).DataTable({
      "language": {
        "sEmptyTable": "Nenhum registro encontrado",
        "sProcessing": "A processar...",
        "sLengthMenu": "Mostrar _MENU_ registros",
        "sZeroRecords": "Não foram encontrados resultados",
        "sInfo": "Mostrando de _START_ até _END_ de _TOTAL_ registros",
        "sInfoEmpty": "Mostrando de 0 até 0 de 0 registros",
        "sInfoFiltered": "(filtrado de _MAX_ registros no total)",
        "sInfoPostFix": "",
        "sSearch": "Procurar:",
        "sUrl": "",
        "oPaginate": {
          "sFirst": "Primeiro",
          "sPrevious": "Anterior",
          "sNext": "Próximo",
          "sLast": "Último"
        },
        "oAria": {
          "sSortAscending": ": Ordenar colunas de forma ascendente",
          "sSortDescending": ": Ordenar colunas de forma descendente"
        },
        "decimal": ",",
        "thousands": "."
      }
    });
  });
  /*var newFoot = new String();
  newFoot = '<tr class="item item-head"><th class="name">VIP</th>'
  for (var x in produtos) {
  	newFoot += '<th class="">'+vendas[x].produto_nome.slice(0,20)+'</th>';
  };
  newFoot += '</tr>'
  $('tfoot').html(newFoot);	
  */

  var rankingList = data.dados.ranking_venda_list;
  var posicao = 0; // Limpar a div

  var rankingVendasVip = document.getElementById('rankingVendasVip');
  rankingVendasVip.innerHTML = '&nbsp;';

  for (var x in rankingList) {
    if (x <= 2) {
      posicao++;
      $('#rankingVendasVip').append('<div class="col ranking-col">' + '<div class="col-content">' + '<ul class="ranking-small">' + '<li id="ranking0' + posicao + '" class="item">' + '<div id="pos0' + posicao + '" class="position">' + posicao + 'º</div>' + '<span class="name0' + posicao + '">' + rankingList[x].vendedor_nome.slice(0, 25) + '</span>' + '<span class="value">' + rankingList[x].valor_venda.toLocaleString('pt-br', {
        style: 'currency',
        currency: 'BRL'
      }) + '</span>' + '</li>' + '</ul>' + '</div>' + '</div>');
    };
  }
}