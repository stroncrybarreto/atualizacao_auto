if (!!window.addEventListener) {
  window.addEventListener('DOMContentLoaded', main);
} else {
  window.attachEvent('onload', main);
}

curDate = new Date();
var dataDefault = curDate.getDate() + '/' + (curDate.getMonth() + 1) + '/' + curDate.getFullYear();
var empresaGrid = null;
var isIntegracaoIpp = null;
var urlDefault = "http://127.0.0.1:8000/";
var isFirefox = typeof InstallTrigger !== 'undefined';
var isChrome = navigator.userAgent.indexOf("Chrome") != -1;

function main() {
  urlDefault = urlDefault ? urlDefault : "http://127.0.0.1:8000/";

  if(isFirefox == false && isChrome == false){
    mensagem = "Este navegador não está homologado para utilização do recurso de Dashboard Gerencial."
    mensagem += "\nPara esta operação, deverá ser utilizado o Mozilla Firefox ou Google Chrome."
    mensagem += "\nOs processos serão finalizados."
    alert(mensagem);
    logout();
  }else{
    getMain();
  }  
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
  getFaturamento();
  getNivelTanques();
  getRankingProdutos();
  getTicketMedio();
  getRankingVendas();
}

function logout() {
  $.getJSON(urlDefault + "Logout?", {}, function (data, status) {
  }).done(function () {
    alert('Não foi possível encerrar o serviço Dashboard!');
  }).fail(function () {
    alert('Serviço Dashboard finalizado! ');
  }).always(function () {
    if(isChrome == true){
      window.close(this);
    } else{
      //window.close();
      //close();
      //Para funcionar no firefoz, tem que fazer a configuração
      //Na barra de endereços digitar: about:config
      //Localizar a chave "dom.allow_scripts_to_close_windows", clicar sobre ela com botão direito do mouse e
      //Inverter o valor.
      window.close();
    }
    
  });
}

function getMain() {
  $('#dataHora').html(dataDefault);
  $.getJSON(urlDefault + "Login?", {}, function (data, status) {
    if (status != 'success') {
      alert("Não foi possível localizar informações da empresa.");
    } else if (jQuery.isEmptyObject(data.dados)) {
      alert("Não foi possível pesquisar dados.\n" + data.message);
      window.close();
    } else {
      $('#empresa').html(data.dados.empresa_nome);
      $('#usuario').html(data.dados.usuario_nome);
      empresaGrid = data.dados.empresa_grid;
      isIntegracaoIpp = data.dados.is_integracao_ipp;

      if (data.dados.is_devel === true) {
        document.getElementById("inputDate").style.display = "block";
      }

      getFaturamento();
      getNivelTanques();
      getRankingProdutos();
      getTicketMedio();
      getRankingVendas();
    }
  }).fail(function () {
    alert("Não foi possível estabelecer conexão com o serviço de Dashboard.");
    window.close();
  });
}

function getFaturamento() {
  var paramsDict = {
    "empresa": empresaGrid,
    "data_base": dataDefault
  };
  $.getJSON(urlDefault + "FaturamentoKpi?", paramsDict, function (data, status) {
    if (status != 'success') {
      alert("Não foi possível localizar informações da empresa.");
    } else if (jQuery.isEmptyObject(data.dados.kpi_dict)) {
      valor = 0;
      $('#fat00').html(valor.toLocaleString('pt-br', {
        style: 'currency',
        currency: 'BRL'
      }));
      $('#ven00').html('<b>' + valor.toLocaleString('pt-br') + '</b> Vendas realizadas.');
      $('#fat01').html(valor.toLocaleString('pt-br', {
        style: 'currency',
        currency: 'BRL'
      }));
      $('#ven01').html('<b>' + valor.toLocaleString('pt-br') + '</b> Vendas realizadas.');
      $('#fat02').html(valor.toLocaleString('pt-br', {
        style: 'currency',
        currency: 'BRL'
      }));
      $('#ven02').html('<b>' + valor.toLocaleString('pt-br') + '</b> Vendas realizadas.');
    } else {
      var vendaDict = data.dados.kpi_dict;
      $('#fat00').html(vendaDict.valor_vendas.toLocaleString('pt-br', {
        style: 'currency',
        currency: 'BRL'
      }));
      $('#ven00').html('<b>' + vendaDict.quantidade_vendas.toLocaleString('pt-br') + '</b> Vendas realizadas.');
      $('#fat01').html(vendaDict.valor_ticket_medio.toLocaleString('pt-br', {
        style: 'currency',
        currency: 'BRL'
      }));
      $('#ven01').html('<b>' + vendaDict.quantidade_vendas.toLocaleString('pt-br') + '</b> Vendas realizadas.');
      $('#fat02').html(vendaDict.valor_lucro.toLocaleString('pt-br', {
        style: 'currency',
        currency: 'BRL'
      }));
      $('#ven02').html('<b>' + vendaDict.quantidade_vendas.toLocaleString('pt-br') + '</b> Vendas realizadas.');
    };
  });
}

function getNivelTanques() {
  var paramsDict = {
    "empresa": empresaGrid,
    "data_base": dataDefault
  };
  $.getJSON(urlDefault + "NivelTanques?", paramsDict, function (data, status) {
    $("#divLoader").hide();

    if (status != "success") {
      alert("Não foi possível localizar informações da empresa.");
    } else {
      nivelTanques(data);
    };
  });
}

function nivelTanques(dados) {
  var tanqueList = dados.dados.tanques;
  var tanqueNomeList = [];
  var capacidadeList = [];
  var estoqueList = [];
  var valorNivelMin = tanqueList[0].estoque;
  var nivelMinimoDict = {};

  for (var x in tanqueList) {
    var capacidade = tanqueList[x].capacidade
    if (tanqueList[x].estoque > 0) {
      capacidade = tanqueList[x].capacidade - tanqueList[x].estoque
    }
    tanqueNomeList.push(tanqueList[x].tanque_nome.slice(0, 5));
    capacidadeList.push(capacidade);
    estoqueList.push(tanqueList[x].estoque);

    if (tanqueList[x].estoque <= valorNivelMin) {
      valorNivelMin = tanqueList[x].estoque;
      nivelMinimoDict = tanqueList[x];
    }
  };
  porcentagemCapacidade = (nivelMinimoDict.estoque * 100 / nivelMinimoDict.capacidade).toFixed();
  valorEstoque = (nivelMinimoDict.estoque / 1000).toFixed(); // Coloca as informações no Menor volume em Tanque

  $('#fat03').html(valorEstoque.toLocaleString('pt-br') + 'K Litros <span>/' + (nivelMinimoDict.capacidade / 1000).toLocaleString('pt-br') + ' K Litros.</span>');
  $('#ven03').html('<b> ' + nivelMinimoDict.tanque_nome + ': ' + porcentagemCapacidade.toLocaleString('pt-br') + '</b> % Disponível.'); // Monta o gráfico

  var dataDict = {
    labels: tanqueNomeList,
    datasets: [{
      label: 'Estoque',
      backgroundColor: isIntegracaoIpp ? "#1686D0" : "#593672",
      data: estoqueList
    }, {
      label: 'Capacidade',
      backgroundColor: isIntegracaoIpp ? "#F5CA00" : "#FBB116",
      data: capacidadeList
    }]
  };
  var chartNivelTanquesContent = document.getElementById('chartNivelTanquesContent');
  chartNivelTanquesContent.innerHTML = '&nbsp;';
  $('#chartNivelTanquesContent').append('<canvas id="chartNivelTanques"><canvas>');
  new Chart(document.getElementById('chartNivelTanques').getContext('2d'), {
    type: 'bar',
    data: dataDict,
    options: {
      legend: {
        display: true,
        position: 'bottom'
      },
      scales: {
        xAxes: [{
          stacked: true,
          gridLines: {
            display: true,
            offsetGridLines: false
          }
        }],
        yAxes: [{
          stacked: true,
          gridLines: {
            display: true,
            color: "#E7E8EB",
            offsetGridLines: false
          }
        }]
      }
    }
  });
}

function getRankingProdutos() {
  var paramsDict = {
    "empresa": empresaGrid,
    "data_base": dataDefault,
    "data_key": "ranking_combustivel"
  };
  $.getJSON(urlDefault + "Faturamento?", paramsDict, function (data, status) {
    $("#divLoader").hide();

    if (status != "success") {
      alert("Não foi possível localizar informações da empresa.");
    } else if (data.status == false || jQuery.isEmptyObject(data.dados.produto_list)) {
      document.getElementById("msgRankingProdutos").style.display = "block";
      document.getElementById("chartRankingProdutosContent").style.display = "none";
    } else {
      document.getElementById("msgRankingProdutos").style.display = "none";
      document.getElementById("chartRankingProdutosContent").style.display = "block";
      rankingProdutos(data);
    }

    ;
  });
}

function rankingProdutos(dados) {
  var produtoList = dados.dados.produto_list;
  var produtoNomeList = [];
  var volumeList = [];

  for (var x in produtoList) {
    produtoNomeList.push(produtoList[x].produto_nome.slice(0, 15));
    volumeList.push(produtoList[x].volume);
  };
  var dataDict = {
    labels: produtoNomeList,
    datasets: [{
      data: volumeList,
      backgroundColor: isIntegracaoIpp ? ["#ffd700", "#c0c0c0", "#cd7f32", "#00fff7", "#daa520", "#1686D0", "#F5CA00", "#FF6384", "#36A2EB", "#BC8F8F"] : ["#593672", "#EE492C", "#FBB116", "#6F7988", "#B57707", "#9BA7B9", "#D7F5FA", "#FFE4E1", "#D8BFD8", "#D2691E"],
      hoverBackgroundColor: isIntegracaoIpp ? ["#ffd700", "#c0c0c0", "#cd7f32", "#00fff7", "#daa520", "#1686D0", "#F5CA00", "#FF6384", "#36A2EB", "#BC8F8F"] : ["#593672", "#EE492C", "#FBB116", "#6F7988", "#B57707", "#9BA7B9", "#D7F5FA", "#FFE4E1", "#D8BFD8", "#D2691E"]
    }]
  };
  var chartRankingProdutosContent = document.getElementById('chartRankingProdutosContent');
  chartRankingProdutosContent.innerHTML = '&nbsp;';
  $('#chartRankingProdutosContent').append('<canvas id="chartRankingProdutos" height="300"><canvas>');
  new Chart(document.getElementById('chartRankingProdutos'), {
    type: 'doughnut',
    data: dataDict,
    options: {
      reponsive: false,
      legend: {
        // display: false
        position: 'bottom',
        labels: {
          fontSize: 10,
          fontFamily: 'Helvetica'
        }
      }
    }
  });
}

function getTicketMedio() {
  var paramsDict = {
    "empresa": empresaGrid,
    "data_base": dataDefault,
    "data_key": "resumo_diario"
  };
  $.getJSON(urlDefault + "TicketMedio?", paramsDict, function (data, status) {
    $("#divLoader").hide();

    if (status != "success") {
      alert("Não foi possível localizar informações da empresa.");
    } else if (data.status == false || jQuery.isEmptyObject(data.dados.resumo_diario_list)) {
      document.getElementById("msgTicketMedio").style.display = "block";
      document.getElementById("chartTicketMedioContent").style.display = "none";
    } else {
      document.getElementById("msgTicketMedio").style.display = "none";
      document.getElementById("chartTicketMedioContent").style.display = "block";
      ticketMedio(data);
    }

    ;
  });
}

function ticketMedio(dados) {
  var ticketList = dados.dados.resumo_diario_list;
  var produtoNomeList = [];
  var vendaList = [];

  for (var x in ticketList) {
    produtoNomeList.push(ticketList[x].produto_nome.slice(0, 12));
    vendaList.push(parseFloat(ticketList[x].ticket_medio.toFixed(2)));
  };
  var dataDict = {
    labels: produtoNomeList,
    datasets: [{
      label: 'Ticket Médio',
      backgroundColor: isIntegracaoIpp ? '#1686D0' : "#593672",
      data: vendaList
    }]
  };
  var chartTicketMedioContent = document.getElementById('chartTicketMedioContent');
  chartTicketMedioContent.innerHTML = '&nbsp;';
  $('#chartTicketMedioContent').append('<canvas id="chartTicketMedio"><canvas>');
  new Chart(document.getElementById('chartTicketMedio').getContext("2d"), {
    type: 'bar',
    data: dataDict,
    options: {
      legend: {
        // display: false
        position: 'bottom',
        labels: {
          fontFamily: 'Helvetica'
        }
      }
    }
  });
}

function getRankingVendas() {
  var paramsDict = {
    "empresa": empresaGrid,
    "data_base": dataDefault,
    "data_key": "ranking"
  };
  $.getJSON(urlDefault + "RankingVendas?", paramsDict, function (data, status) {
    $("#divLoader").hide();

    if (status != "success") {
      alert("Não foi possível localizar informações da empresa.");
    } else if (data.status == false || jQuery.isEmptyObject(data.dados.ranking_venda_list)) {
      document.getElementById("msgRankingVip").style.display = "block";
      document.getElementById("rankingVip").style.display = "none";
    } else {
      document.getElementById("msgRankingVip").style.display = "none";
      document.getElementById("rankingVip").style.display = "block";
      var rankingList = data.dados.ranking_venda_list;
      let indice = 0;

      for (let i in rankingList) {
        indice++;
        document.getElementById("ranking0" + indice).style.display = "flex";
        $('#name0' + indice).html(rankingList[i].vendedor_nome);
        $('#value0' + indice).html(rankingList[i].valor_venda.toLocaleString('pt-br', {
          style: 'currency',
          currency: 'BRL'
        }));
      }
    }
  });
};
