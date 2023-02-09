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
  btSelecionado = document.getElementsByClassName('bt check')[0];

  if (btSelecionado.id == 'btMensal') {
    tipo = 0;
  } else if (btSelecionado.id == 'btSemanal') {
    tipo = 1;
  } else {
    tipo = 2;
  }

  getTicketMedioProduto(tipo);
  getTicketMedioVip(tipo);
  getTicketMedioHora(tipo);
}

function updateBt(tipo) {
  $("#divLoader").show();
  btSelecionado = document.getElementsByClassName('bt check')[0];

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

  getTicketMedioProduto(tipo);
  getTicketMedioVip(tipo);
  getTicketMedioHora(tipo);
}

$('.modal-close').click(function () {
  $('.modal').hide();
});
$(document).on("click", "#openModal .item", function () {
  vendedor = this.id;
  getDetailTicketMedioVip(vendedor);
});

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
      btSelecionado = document.getElementsByClassName('bt check')[0];

      if (btSelecionado.id == 'btMensal') {
        tipo = 0;
      } else if (btSelecionado.id == 'btSemanal') {
        tipo = 1;
      } else {
        tipo = 2;
      }

      getTicketMedioProduto(tipo);
      getTicketMedioVip(tipo);
      getTicketMedioHora(tipo);
    }
  }).fail(function () {
    alert("Não foi possível estabelecer conexão com o serviço de Dashboard.");
  });
}

function getTicketMedioProduto(tipo) {
  var paramsDict = {
    "empresa": empresaGrid,
    "data_base": dataDefault,
    "data_key": "produtos",
    "tipo": tipo
  };
  $.getJSON(urlDefault + "TicketMedio?", paramsDict, function (data, status) {
    $("#divLoader").hide();

    if (status != 'success') {
      alert("Não foi possível localizar informações da empresa.");
    } else if (jQuery.isEmptyObject(data.dados.produtos)) {
      document.getElementById("ticketMedioProduto").style.display = "none";
    } else {
      document.getElementById("ticketMedioProduto").style.display = "flex";
      ticketMedioProduto(data);
    }

    ;
  });
}

function ticketMedioProduto(data) {
  var produtoList = data.dados.produtos;
  let element = document.getElementById('ticketMedioProduto');

  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }

  var master = $('#ticketMedioProduto');

  for (var x in produtoList) {
    master.append('<div id="child" class="col kpi">' + '<div class="col-content">' + '<div class="head">' + '<span class="label">' + produtoList[x].produto_nome + '</span>' + '<h4 class="heading">' + produtoList[x].ticket_medio.toLocaleString('pt-br', {
      style: 'currency',
      currency: 'BRL'
    }) + '</h4>' + '</div>' + '<div class="kpi-valor"><b>' + produtoList[x].volume.toLocaleString() + '</b> litros vendidos.</div>' + '</div>');
  };
}

function getTicketMedioVip(tipo) {
  var paramsDict = {
    "empresa": empresaGrid,
    "data_base": dataDefault,
    "data_key": "vips",
    "tipo": tipo
  };
  $.getJSON(urlDefault + "TicketMedio?", paramsDict, function (data, status) {
    $("#divLoader").hide();

    if (status != 'success') {
      alert("Não foi possível localizar informações da empresa.");
    } else if (jQuery.isEmptyObject(data.dados.vips)) {
      document.getElementById("msgticketMedioVip").style.display = "block";
      document.getElementById("ticketMedioVipContent").style.display = "none";
    } else {
      document.getElementById("msgticketMedioVip").style.display = "none";
      document.getElementById("ticketMedioVipContent").style.display = "flex";
      ticketMedioVip(data);
    }

    ;
  });
}

function ticketMedioVip(data) {
  var vendedorList = data.dados.vips;
  let element = document.getElementById('openModal');

  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }

  var master = $('#openModal');

  for (var x in vendedorList) {
    html_lista = '<li class="item" id="' + vendedorList[x].vendedor + '">' + '<div class="item-content">' + '<div class="title">' + vendedorList[x].vendedor_nome + '</div>' + '<div class="value" data-title="TICKET MÉDIO">' + vendedorList[x].ticket_medio.toLocaleString('pt-br', {
      style: 'currency',
      currency: 'BRL'
    }) + '</div>' + '</div>' + '</li>';
    master.append(html_lista);
  };
}

function getDetailTicketMedioVip(vendedor) {
  btSelecionado = document.getElementsByClassName('bt check')[0];

  if (btSelecionado.id == 'btMensal') {
    tipo = 0;
  } else if (btSelecionado.id == 'btSemanal') {
    tipo = 1;
  } else {
    tipo = 2;
  }

  var paramsDict = {
    "empresa": empresaGrid,
    "data_base": dataDefault,
    "vendedor": vendedor,
    "tipo": tipo
  };
  $.getJSON(urlDefault + "DetailVendaVip?", paramsDict, function (data, status) {
    $("#divLoader").hide();

    if (status != 'success') {
      alert("Não foi possível localizar informações da empresa.");
    } else {
      detailTicketMedioVip(data);
    }

    ;
  });
}

function detailTicketMedioVip(data) {
  let resultList = data.dados.vips;
  let valorVolume = data.dados.volume;
  let valorTicketMedio = data.dados.total_ticket_medio;
  $('#modalHeadName').html(resultList[0].vendedor_nome);
  $("#modalHeadName").attr("data-subtitle", valorVolume.toLocaleString() + ' Litros vendidos');
  $('#modalHeadValeu').html(valorTicketMedio.toLocaleString('pt-br', {
    style: 'currency',
    currency: 'BRL'
  }));
  let element = document.getElementById('modalBodyUl');

  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }

  var master = $('#modalBodyUl');
  html_body = '';

  for (var x in resultList) {
    html_body += '<li class="item">' + '<div class="item-content">' + '<div class="title">' + resultList[x].produto_nome + '</div>' + '<div class="value" data-title="Ticket Médio">' + resultList[x].ticket_medio.toLocaleString('pt-br', {
      style: 'currency',
      currency: 'BRL'
    }) + '</div>' + '<div class="kpi-valor" data-title="VOLUME">' + resultList[x].volume.toLocaleString() + ' Litros</div>' + '</div>' + '</li>';
  }

  ;
  master.append(html_body);
  $('.modal').show();
}

function getTicketMedioHora(tipo) {
  var paramsDict = {
    "empresa": empresaGrid,
    "data_base": dataDefault,
    "data_key": "ticket_medio",
    "tipo": tipo
  };
  $.getJSON(urlDefault + "VendasHora?", paramsDict, function (data, status) {
    $("#divLoader").hide();

    if (status != 'success') {
      alert("Não foi possível localizar informações da empresa.");
    } else if (jQuery.isEmptyObject(data.dados.venda_hora_list)) {
      document.getElementById("msgTicketMedioHora").style.display = "block";
      document.getElementById("chartTicketMedioHoraContent").style.display = "none";
    } else {
      document.getElementById("msgTicketMedioHora").style.display = "none";
      document.getElementById("chartTicketMedioHoraContent").style.display = "flex";
      ticketMedioHora(data);
    }

    ;
  });
}

function ticketMedioHora(data) {
  var vendaHoraList = data.dados.venda_hora_list;
  var horaList = [];
  var valoresList = [];

  for (var i in vendaHoraList) {
    horaList.push(vendaHoraList[i].hora);
    valoresList.push(vendaHoraList[i].ticket_medio);
  }

  ;
  var dataDict = {
    labels: horaList,
    datasets: [{
      label: 'Ticket Médio',
      data: valoresList,
      backgroundColor: isIntegracaoIpp ? "#1686D0" : "#593672"
    }]
  };
  var chartTicketMedioHoraContent = document.getElementById('chartTicketMedioHoraContent');
  chartTicketMedioHoraContent.innerHTML = '&nbsp;';
  $('#chartTicketMedioHoraContent').append('<canvas id="chartTicketMedioHora"><canvas>');
  new Chart(document.getElementById('chartTicketMedioHora').getContext('2d'), {
    type: 'bar',
    data: dataDict,
    responsive: true,
    options: {
      scales: {
        xAxes: [{
          stacked: true
        }],
        yAxes: [{
          stacked: true
        }]
      },
      responsive: true,
      maintainAspectRatio: false
    }
  });
}