if (!!window.addEventListener) window.addEventListener('DOMContentLoaded', main);else window.attachEvent('onload', main);
curDate = new Date();
var dataDefault = curDate.getDate() + '/' + (curDate.getMonth() + 1) + '/' + curDate.getFullYear();
var empresaGrid = null;
var isIntegracaoIpp = null;
var urlDefault = "http://127.0.0.1:8000/";

function main() {
  urlDefault = urlDefault ? urlDefault : "http://127.0.0.1:8000/";
  handler();
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
  getEstoque();
  getProjecaoEstoque();
  getPerdasSobras();
}

$('#produto').change(handler);

function handler() {
  var opcaoSelecionada = $('#selProduto option:selected');
  var produtoSelecionado = opcaoSelecionada.text();
  return produtoSelecionado;
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

      getEstoque();
      getPerdasSobras();
    }
  }).fail(function () {
    alert("Não foi possível estabelecer conexão com o serviço de Dashboard.");
  });
}

function getEstoque() {
  var paramsDict = {
    "empresa": empresaGrid,
    "data_base": dataDefault
  };
  $.getJSON(urlDefault + "NivelTanques?", paramsDict, function (data, status) {
    $("#divLoader").hide();

    if (status != 'success') {
      alert("Não foi possível localizar informações da empresa.");
    } else {
      nivelTanques(data);
    }
  });
}

function nivelTanques(dados) {
  var tanqueList = dados.dados.tanques;
  var estoqueList = [];
  var tanqueNomeList = [];
  var capacidadeList = [];

  for (var x in tanqueList) {
    var capacidade = tanqueList[x].capacidade
    if (tanqueList[x].estoque > 0) {
      capacidade = tanqueList[x].capacidade - tanqueList[x].estoque
    }
    tanqueNomeList.push(tanqueList[x].tanque_nome.slice(0, 5));
    capacidadeList.push(capacidade);
    estoqueList.push(tanqueList[x].estoque);
  }
   // Monta o gráfico

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
  var chartEstoqueContent = document.getElementById('chartEstoqueContent');
  chartEstoqueContent.innerHTML = '&nbsp;';
  $('#chartEstoqueContent').append('<canvas id="chartEstoque"><canvas>');
  new Chart(document.getElementById('chartEstoque').getContext('2d'), {
    type: 'bar',
    data: dataDict,
    options: {
      legend: {
        display: true,
        position: 'bottom'
      },
      responsive: true,
      maintainAspectRatio: false,
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

function getSelProduto() {
  $("#divLoader").show();
  var opcaoSelecionada = $('#selProduto option:selected')[0];
  return opcaoSelecionada.id;
}

function getProjecaoEstoque() {
  produtoId = getSelProduto();

    var paramsDict = {
      "empresa": empresaGrid,
      "data_base": dataDefault,
      "produto": produtoId ? produtoId : null
    }; // Busca dados de projeção de estoque

    $.getJSON(urlDefault + "ProjecaoEstoque?", paramsDict, function (data, status) {
      $("#divLoader").hide();

      if (status != 'success') {
        alert("Não foi possível localizar informações da empresa.");
      } else if (data.status == false || !!data.dados.estoque.length == 0) {
        document.getElementById("msgProjecao").style.display = "block";
        document.getElementById("chartProjecaoContent").style.display = "none";
      } else {
        document.getElementById("msgProjecao").style.display = "none";
        document.getElementById("chartProjecaoContent").style.display = "flex";
        projecaoEstoque(data);
      }
    });
}

function projecaoEstoque(dados) {
  var projecaoList = dados.dados.estoque;
  var labelsList = [];
  var volumeMediaList = [];
  var estoqueMediaList = [];

  for (var i in projecaoList) {
    labelsList.push(projecaoList[i].data);
    volumeMediaList.push(projecaoList[i].media_volume_diaria);
    estoqueMediaList.push(projecaoList[i].media_estoque_diaria);
  }

  var dataDict = {
    labels: labelsList,
    datasets: [{
      label: 'Projeção de Vendas',
      borderColor: isIntegracaoIpp ? "#1686D0" : "#EE492C",
      backgroundColor: isIntegracaoIpp ? "#1686D0" : "#EE492C",
      fill: false,
      data: volumeMediaList,
      yAxisID: 'y-axis-1',
      pointRadius: 10,
      pointHoverRadius: 15
    }, {
      label: 'Projeção de Estoque',
      borderColor: isIntegracaoIpp ? "#FBB116" : "#FBB116",
      backgroundColor: isIntegracaoIpp ? "#FBB116" : "#FBB116",
      fill: false,
      data: estoqueMediaList,
      yAxisID: 'y-axis-2',
      pointRadius: 10,
      pointHoverRadius: 15
    }]
  };
  var chartProjecaoContent = document.getElementById('chartProjecaoContent');
  chartProjecaoContent.innerHTML = '&nbsp;';
  $('#chartProjecaoContent').append('<canvas id="chartProjecao"><canvas>');
  new Chart(document.getElementById('chartProjecao'), {
    type: 'line',
    data: dataDict,
    options: {
      responsive: true,
      hoverMode: 'index',
      stacked: false,
      showLines: false,
      radius: 100,
      maintainAspectRatio: false,
      scales: {
        yAxes: [{
          type: 'linear',
          // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
          display: true,
          position: 'left',
          id: 'y-axis-1'
        }, {
          type: 'linear',
          // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
          display: true,
          position: 'right',
          id: 'y-axis-2',
          // grid line settings
          gridLines: {
            drawOnChartArea: false // only want the grid lines for one axis to show up

          }
        }]
      }
    }
  });
}

function getPerdasSobras() {
  var paramsDict = {
    "empresa": empresaGrid,
    "data_base": dataDefault
  }; // Busca dados de perdas e sobras

  $.getJSON(urlDefault + "PerdasSobras?", paramsDict, function (data, status) {
    $("#divLoader").hide();

    if (status != 'success') {
      alert("Não foi possível localizar informações da empresa.");
    } else if (data.status == false || data.dados.total_sobra_falta == '0') {
      document.getElementById("msgPerdasSobras").style.display = "block";
      document.getElementById("chartPerdasSobrasContent").style.display = "none";
    } else {
      document.getElementById("msgPerdasSobras").style.display = "none";
      document.getElementById("chartPerdasSobrasContent").style.display = "flex";
      perdasSobras(data);
    }
  });
}

function perdasSobras(dados) {
  var produtoList = dados.dados.produto_list;
  var valorList = [];
  var produtoNomeList = [];

  for (var x in produtoList) {
    valorList.push(produtoList[x].sobra_falta_quantidade);
    produtoNomeList.push(produtoList[x].produto_nome.slice(0, 15));
  }

  var dataDict = {
    labels: produtoNomeList,
    datasets: [{
      label: 'Perda e Sobras',
      backgroundColor: isIntegracaoIpp ? "#F5CA00" : "#FBB116",
      data: valorList
    }]
  };
  var chartPerdasSobrasContent = document.getElementById('chartPerdasSobrasContent');
  chartPerdasSobrasContent.innerHTML = '&nbsp;';
  $('#chartPerdasSobrasContent').append('<canvas id="chartPerdasSobras"><canvas>');
  new Chart(document.getElementById('chartPerdasSobras').getContext('2d'), {
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
      },
      responsive: true,
      maintainAspectRatio: false
    }
  });
}