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
  getFaturamento();
  getVendasHora();
}

function logout() {
  $.getJSON(urlDefault + "Login?", {}, function (data, status) {
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

      getFaturamento();
    };
  }).fail(function () {
    alert("Não foi possível estabelecer conexão com o serviço de Dashboard.");
  });
}

function getFaturamento(tipo) {
  if (tipo || tipo == 0) {
    $("#divLoader").show();
  }

  btSelecionado = document.getElementsByClassName('bt check')[0];

  if (tipo == undefined){
    if (btSelecionado.id == 'btMensal'){
      tipo = 0;
    } else if(btSelecionado.id == 'btSemanal'){
      tipo = 1;
    }else{
      tipo = 2;
    }    
  }
 
  if (tipo == 0 && btSelecionado.id != 'btMensal') {
    document.getElementById('btMensal').className = "bt check";
    document.getElementById(btSelecionado.id).className = "bt";
  } else if (tipo == 1 && btSelecionado.id != 'btSemanal') {
    document.getElementById('btSemanal').className = "bt check";
    document.getElementById(btSelecionado.id).className = "bt";
  } else if (tipo == 2 && btSelecionado.id != 'btDiario') {
    document.getElementById('btDiario').className = "bt check";
    document.getElementById(btSelecionado.id).className = "bt";
  }

  var paramsDict = {
    "empresa": empresaGrid,
    "data_base": dataDefault,
    "data_key": "faturamento_total",
    "tipo": tipo
  };
  $.getJSON(urlDefault + "Faturamento?", paramsDict, function (data, status) {
    $("#divLoader").hide();

    if (status != 'success') {
      alert("Não foi possível localizar informações da empresa.");
    } else if (jQuery.isEmptyObject(data.dados.faturamento_dia_list) && jQuery.isEmptyObject(data.dados.faturamento_ant_list)) {
      valor = 0;
      document.getElementById("msgFaturamento").style.display = "block";
      document.getElementById("chartFaturamentoContent").style.display = "none";
      document.getElementById("footerFaturamento").style.display = "none";
      document.getElementById("footer00").style.display = "none";
      document.getElementById("footer01").style.display = "none";
      document.getElementById("footer02").style.display = "none";

      for (var i = 0; i < 3; i++) {
        $('#fatlbl0' + i).html("TOTAL DE MÊS(Data)");
        $('#fat0' + i).html(valor.toLocaleString('pt-br', {
          style: 'currency',
          currency: 'BRL'
        }));
        $('#lven0' + i).html('<b>' + valor.toLocaleString('pt-br') + '</b> litros vendidos.');
      }
    } else {
      document.getElementById("msgFaturamento").style.display = "none";
      document.getElementById("chartFaturamentoContent").style.display = "block";
      document.getElementById("footerFaturamento").style.display = "block";
      faturamentoProduto(data.dados);
      faturamentoPeriodoAnterior(data.dados);
    }
  });
}

function faturamentoProduto(dados) {
  var fatProdutoList = dados.faturamento_dia_list;
  if(jQuery.isEmptyObject(fatProdutoList)){
    document.getElementById("msgFaturamento").style.display = "block";
    document.getElementById("chartFaturamentoContent").style.display = "none";
    document.getElementById("footerFaturamento").style.display = "none";
  } else{
    var volumeList = [];
    var produtoNomeList = [];
    var valorFaturamentoList = [];
    var lucroFaturamentoList = [];
    console.log(fatProdutoList)
    for (var i in fatProdutoList) {
      produtoNomeList.push(fatProdutoList[i].produto_nome.slice(0, 15));
      volumeList.push(parseFloat(fatProdutoList[i].volume.toFixed(2)));
      valorFaturamentoList.push(parseFloat(fatProdutoList[i].valor_venda.toFixed(2)));
      lucroFaturamentoList.push(parseFloat(fatProdutoList[i].valor_lucro.toFixed(2)));
    };
    var dataDict = {
      labels: produtoNomeList,
      datasets: [{
        label: "Volume",
        data: volumeList,
        backgroundColor: isIntegracaoIpp ? ["#ffd700", "#c0c0c0", "#cd7f32", "#00fff7", "#daa520", "#1686D0", "#F5CA00", "#FF6384", "#36A2EB", "#BC8F8F"] : ["#593672", "#EE492C", "#FBB116", "#6F7988", "#B57707", "#9BA7B9", "#D7F5FA", "#FFE4E1", "#D8BFD8", "#D2691E"]
      }, {
        label: "Faturamento",
        data: valorFaturamentoList,
        backgroundColor: isIntegracaoIpp ? ["#ffd700", "#c0c0c0", "#cd7f32", "#00fff7", "#daa520", "#1686D0", "#F5CA00", "#FF6384", "#36A2EB", "#BC8F8F"] : ["#593672", "#EE492C", "#FBB116", "#6F7988", "#B57707", "#9BA7B9", "#D7F5FA", "#FFE4E1", "#D8BFD8", "#D2691E"]
      }, {
        label: "Lucro",
        data: lucroFaturamentoList,
        backgroundColor: isIntegracaoIpp ? ["#ffd700", "#c0c0c0", "#cd7f32", "#00fff7", "#daa520", "#1686D0", "#F5CA00", "#FF6384", "#36A2EB", "#BC8F8F"] : ["#593672", "#EE492C", "#FBB116", "#6F7988", "#B57707", "#9BA7B9", "#D7F5FA", "#FFE4E1", "#D8BFD8", "#D2691E"]
      }]
    };
    var chartFaturamentoContent = document.getElementById('chartFaturamentoContent');
    chartFaturamentoContent.innerHTML = '&nbsp;';
    $('#chartFaturamentoContent').append('<canvas id="chartFaturamento"><canvas>');
    new Chart(document.getElementById("chartFaturamento").getContext('2d'), {
      type: "horizontalBar",
      data: dataDict,
      options: {
        legend: {
          display: false,
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
}

function faturamentoPeriodoAnterior(dados) {
  var vendaPeriodoList = dados.faturamento_ant_list;
  var produtoPeriodoList = dados.faturamento_dia_list;
  var valorPeriodoAnt = 0;
  var volumePeriodoAnt = 0;
  var lucroPeriodoAnt = 0;
  var valor = 0;

  for (var i = 0; i < 3; i++) {
    $('#fatlbl0' + i).html("TOTAL DE MÊS(Data)");
    $('#fat0' + i).html(valor.toLocaleString('pt-br', {
      style: 'currency',
      currency: 'BRL'
    }));
    $('#lven0' + i).html('<b>' + valor.toLocaleString('pt-br') + '</b> litros vendidos.');
    document.getElementById("footer0" + i).style.display = "none";
  }

  for (var x in produtoPeriodoList) {
    valorPeriodoAnt += produtoPeriodoList[x].valor_venda;
    volumePeriodoAnt += produtoPeriodoList[x].volume;
    lucroPeriodoAnt += produtoPeriodoList[x].valor_lucro;
  };
  $('#footerValor').html("Total valor: <b>" + valorPeriodoAnt.toLocaleString('pt-br', {
    style: 'currency',
    currency: 'BRL'
  }) + "</b>");
  $('#footerVolume').html('Total volume: <b>' + volumePeriodoAnt.toLocaleString('pt-br') + '</b> litros vendidos.');
  $('#footerLucro').html('Total lucro: <b>' + lucroPeriodoAnt.toLocaleString('pt-br') + '</b> litros vendidos.');
  const monName = new Array("JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO");
  indice = 0;

  for (var i in vendaPeriodoList) {
    if(vendaPeriodoList[i].valor_venda > 0){
      document.getElementById("footer0" + indice).style.display = "block";
    }
    
    porcentagemPeriodo = (vendaPeriodoList[i].valor_venda - valorPeriodoAnt) / vendaPeriodoList[i].valor_venda * 100; // Dados mês atual - posição 2 no array

    var arrDataPeriodo1 = vendaPeriodoList[i].periodo.replace('a', '/').split('/');
    var stringFormatada = arrDataPeriodo1[1] + '/' + arrDataPeriodo1[0] + '/' + arrDataPeriodo1[2];
    dataPeriodo1 = new Date(stringFormatada);

    if (porcentagemPeriodo < 0) {
      porcentagemPeriodo *= -1;
    }

    $('#fatlbl0' + indice).html("TOTAL DE <b>" + monName[dataPeriodo1.getMonth()] + "(" + vendaPeriodoList[i].periodo + ")</b>");
    $('#fat0' + indice).html(vendaPeriodoList[i].valor_venda.toLocaleString('pt-br', {
      style: 'currency',
      currency: 'BRL'
    }));
    $('#lven0' + indice).html('<b>' + vendaPeriodoList[i].volume.toLocaleString('pt-br') + '</b> litros vendidos.');
    let element00 = document.getElementById('footer0' + indice);

    while (element00.firstChild) {
      element00.removeChild(element00.firstChild);
    }

    if (vendaPeriodoList[i].valor_venda > 0){
      var master = $('#footer0' + indice);

      if (vendaPeriodoList[i].valor_venda <= valorPeriodoAnt) {
        master.append('<div id="footer0' + indice + '" class="kpi-footer-value">' + porcentagemPeriodo.toFixed() + '%<span>' + vendaPeriodoList[i].valor_venda.toLocaleString('pt-br', {
          style: 'currency',
          currency: 'BRL'
        }) + '</span>' + '</div>');
      } else {
        master.append('<div id="footer0' + indice + '" class="kpi-footer-value down">' + porcentagemPeriodo.toFixed() + '%<span>' + vendaPeriodoList[i].valor_venda.toLocaleString('pt-br', {
          style: 'currency',
          currency: 'BRL'
        }) + '</span>' + '</div>');
      };
    }
    indice++;
  }
}
$('#produto').change(handler);

function handler() {
  var opcaoSelecionada = $('#selProduto option:selected');
  var produtoSelecionado = opcaoSelecionada.text();
  return produtoSelecionado;
}

function getSelProduto() {
  $("#divLoader").show();
  var opcaoSelecionada = $('#selProduto option:selected')[0];
  return opcaoSelecionada.id;
}

function getVendasHora() {
  var produtoId = getSelProduto()

    paramsDict = {
      "empresa": empresaGrid,
      "data_base": dataDefault,
      "tipo": "2",
      "produto": produtoId ? produtoId : null
    };
    $.getJSON(urlDefault + "VendasHora?", paramsDict, function (data, status) {
      $("#divLoader").hide();

      if (status != 'success') {
        alert("Não foi possível localizar informações da empresa.");
      } else if (jQuery.isEmptyObject(data.dados.venda_hora_list)) {
        document.getElementById("msgVendasHora").style.display = "block";
        document.getElementById("chartVendasHoraContent").style.display = "none";
      } else {
        document.getElementById("msgVendasHora").style.display = "none";
        document.getElementById("chartVendasHoraContent").style.display = "flex";
        vendasHora(data);
      }
    });
}

function vendasHora(dados) {
  var vendaHoraList = dados.dados.venda_hora_list;
  var horaList = new Array();
  var valorHoraList = new Array();

  for (var x in vendaHoraList) {
    horaList.push(vendaHoraList[x].hora);
    valorHoraList.push(parseFloat(vendaHoraList[x].valor_venda.toFixed(2)));
  }

  var dataDict = {
    labels: horaList,
    datasets: [{
      label: 'Valor',
      data: valorHoraList,
      borderColor: isIntegracaoIpp ? "#1686D0" : "#593672",
      backgroundColor: 'transparent',
    }]
  };
  var chartVendasHoraContent = document.getElementById('chartVendasHoraContent');
  chartVendasHoraContent.innerHTML = '&nbsp;';
  $('#chartVendasHoraContent').append('<canvas id="chartVendasHora"><canvas>');
  new Chart(document.getElementById('chartVendasHora'), {
    type: 'line',
    data: dataDict
  });
}