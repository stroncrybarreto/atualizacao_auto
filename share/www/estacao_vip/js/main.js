if(!!(window.addEventListener)) {
	window.addEventListener('DOMContentLoaded', main);
} else {
	window.attachEvent('onload', main);
}

curDate = new Date();

var empresaGrid = null;
var urlDefault = "http://127.0.0.1:8000/";

var mes = (curDate.getMonth()+1).toString();
var ano = curDate.getFullYear();
var primeiroDia = (curDate.getFullYear(), curDate.getMonth(), 1).toString();
var diaAtual =curDate.getDate().toString();
var ultimoDia = ((new Date(ano, mes, 0)).getDate()).toString();

while (primeiroDia.length < 2) {
    primeiroDia = "0" + primeiroDia;
}
while (diaAtual.length < 2) {
    diaAtual = "0" + diaAtual;
}
while (mes.length < 2) {
  mes = "0" + mes;
}
var dataDefault = diaAtual+'/'+mes+'/'+curDate.getFullYear();
$('#periodoVigencia').html('Período de vigência: '+primeiroDia+'/'+mes+'/'+ano+' à '+ultimoDia+'/'+mes+'/'+ano);

function main() {
	getMain();
}

function updatePage(){
	$("#divLoader").show()
	window.location.reload();
}

function logout() {

	$.getJSON(urlDefault+"Logout?", {}, function(data, status) {
		alert("success");
	})
	.done(function() { alert('Não foi possível encerrar o serviço Dashboard!');
	})
	.fail(function() { alert('Serviço Dashboard finalizado! '); 
	})
	.always(function() {
		close();
	});
};

function getMain(){  
   $('#dataHora').html(dataDefault);

   $.getJSON(urlDefault+"Login?", {}, function(data, status) {
		
	   if (status != 'success') {
		   alert("Não foi possível localizar informações da empresa.")
		} else if (jQuery.isEmptyObject(data.dados)) {
			alert("Não foi possível pesquisar dados.\n"+data.message);
			window.close();
	    } else {
			$('#empresa').html(data.dados.empresa_nome);
			empresaGrid = data.dados.empresa_grid;

			getMetasVip();
	   }
	}).fail(function() { 
		alert("Não foi possível estabelecer conexão com o serviço de Dashboard.");
		window.close();
   });
};

function getMetasVip() {
	var paramsDict = {
		"empresa": empresaGrid, 
		"data_base": dataDefault
	};

	$.getJSON(urlDefault+"EstacaoVipMetas?", paramsDict, function(data, status) {
        $("#divLoader").hide()
		if(status != 'success') {
			alert("Não foi possível localizar informações da empresa.");
		} else {
            setTransacoesKMV(data);
            setAbasteceAi(data);
            setProdutosVip(data);
            setVipNaoAtivo(data);
        }
	});
};

function setTransacoesKMV(data){

    if (jQuery.isEmptyObject(data.dados.transacoes_kmv_list)){
        document.getElementById("msgTransacoesKmv").innerHTML = "Não foram recebidos dados do Clube VIP para a construção deste indicador";
        document.getElementById("msgTransacoesKmv").style.display = "block";
        document.getElementById("transacoesKmv").style.display = "none";
        document.getElementById("labelTransacoesKmv").style.display = "none";

    } else if (typeof(data.dados.transacoes_kmv_list) === "string") {
        document.getElementById("msgTransacoesKmv").innerHTML = data.dados.transacoes_kmv_list;
        document.getElementById("msgTransacoesKmv").style.display = "block";
        document.getElementById("transacoesKmv").style.display = "none";
        document.getElementById("labelTransacoesKmv").style.display = "none";

    } else {
        document.getElementById("msgTransacoesKmv").style.display = "none";
        document.getElementById("transacoesKmv").style.display = "block";
        document.getElementById("labelTransacoesKmv").style.display = "block";
        var transacoesKmvList = data.dados.transacoes_kmv_list;
        var posicao = 0;
    
        var transacoesKmv = document.getElementById('transacoesKmv');
        transacoesKmv.innerHTML = '';

        for (var x in transacoesKmvList) {
            posicao ++;
            let valorRealizado = parseInt(transacoesKmvList[x].qtdade_acumulo)
            let meta = parseInt(transacoesKmvList[x].valor_meta)
            let total = (valorRealizado / meta) * 100;
            $('#transacoesKmv').append('<div class="progress-item horizontal" id="kmv_'+posicao+'">'+
                                            '<div class="position">'+posicao+'º</div>'+
                                            '<div class="title">'+transacoesKmvList[x].vendedor_nome+'</div>'+
                                            '<div id="progressKmv_'+posicao+'" class="progress-bar">'+
                                                '<div class="bar"></div>'+
                                            '</div>'+
                                            '<div id="msgMetaKmv_'+posicao+'" class="body mensagem" style="display: none" '+
                                                'data-label="* Não há meta cadastrada no Clube VIP">'+
                                            '</div>'+
                                            '<div class="value">'+transacoesKmvList[x].qtdade_acumulo.toLocaleString('pt-br')+'</div>'+
                                        '</div>');
            $('#kmv_'+posicao+' .progress-bar .bar').css('width',0 + '%')
            /*
            if(meta > 0){
                document.getElementById("progressKmv_"+posicao).style.display = "block";
                if(total > 100){
                    let calculoBateuMeta = total - 100;
                    $('#kmv_'+posicao+' .progress-bar .bar').css('width',100 + '%');
                    $('#kmv_'+posicao+' .progress-bar .bar').append().html("<div class='bar pass' style='width:"+calculoBateuMeta+"%'></div>") 
                } else {
                    $('#kmv_'+posicao+' .progress-bar .bar').css('width',total + '%')
                }
            }else{
                document.getElementById("progressKmv_"+posicao).style.display = "none";
                document.getElementById("msgMetaKmv_"+posicao).style.display = "block";
            }
            */
        }
    }
}

function setAbasteceAi(data){
    if (jQuery.isEmptyObject(data.dados.abasteceai_list)){
        document.getElementById("msgAbasteceAi").innerHTML = "Não foram recebidos dados do Clube VIP para a construção deste indicador";
        document.getElementById("msgAbasteceAi").style.display = "block";
        document.getElementById("abasteceai").style.display = "none";
        document.getElementById("labelAbasteceai").style.display = "none";
    }else if (typeof(data.dados.abasteceai_list) === "string") {
        document.getElementById("msgAbasteceAi").innerHTML = data.dados.abasteceai_list;
        document.getElementById("msgAbasteceAi").style.display = "block";
        document.getElementById("abasteceai").style.display = "none";
        document.getElementById("labelAbasteceai").style.display = "none";
    }else{
        document.getElementById("msgAbasteceAi").style.display = "none";
        document.getElementById("abasteceai").style.display = "block";
        document.getElementById("labelAbasteceai").style.display = "block";
        var abasteceai_list = data.dados.abasteceai_list;
        var posicao = 0;

        var abasteceai = document.getElementById('abasteceai');
        abasteceai.innerHTML = '';

        for (var x in abasteceai_list) {
            posicao ++;
            let valorMedioRealizado = abasteceai_list[x].valor_medio_realizado
            let meta = 5
            let total = (valorMedioRealizado / meta) * 100;
            $('#abasteceai').append('<div class="progress-item horizontal" id="abasteceai_'+posicao+'">'+
                                            '<div class="position">'+posicao+'º</div>'+
                                            '<div class="title">'+abasteceai_list[x].vendedor_nome+'</div>'+
                                            '<div class="rating-votos">'+abasteceai_list[x].valor_realizado.toLocaleString('pt-br')+'</div>'+
                                            '<div class="bar-rating">'+
                                                '<div class="bar"></div>'+
                                                '<img src="img/rating.png" class="ic" alt=""></img>'+
                                            '</div>'+
                                            '<div class="rating-pontos">'+valorMedioRealizado.toLocaleString('pt-br')+'</div>'+
                                        '</div>');
            if(total > 100){
                let calculoBateuMeta = total - 100;
                $('#abasteceai_'+posicao+' .bar-rating .bar').css('width',100 + '%');
                $('#abasteceai_'+posicao+' .bar-rating .bar').append().html("<div class='bar pass' style='width:"+calculoBateuMeta+"%'></div>") 
            } else {
                $('#abasteceai_'+posicao+' .bar-rating .bar').css('width',total + '%')
            }
        }
    }
}

function setProdutosVip(data){

    if (jQuery.isEmptyObject(data.dados.produto_list)){
        document.getElementById("msgProduto1").style.display = "block";
        document.getElementById("vipList1").style.display = "none";
        document.getElementById("msgProduto2").style.display = "block";
        document.getElementById("vipList2").style.display = "none";
        document.getElementById("msgProduto3").style.display = "block";
        document.getElementById("vipList3").style.display = "none";
    }else{
        var produto_dict = data.dados.produto_list;
        var posicao = 0;

        for (var key in produto_dict) {
            posicao ++;
            value = produto_dict[key];
            $("#produtoNome"+posicao).html(key)

            if(jQuery.isEmptyObject(value)){
                document.getElementById("msgProduto"+posicao).innerHTML = "Não foram recebidos dados do Clube VIP para a construção deste indicador";
                document.getElementById("msgProduto"+posicao).style.display = "block";
                document.getElementById("vipList"+posicao).style.display = "none";
                document.getElementById("bodyProduto"+posicao).style.display = "none";
            }else if (typeof(value) === "string"){
                document.getElementById("msgProduto"+posicao).innerHTML = value;
                document.getElementById("msgProduto"+posicao).style.display = "block";
                document.getElementById("vipList"+posicao).style.display = "none";
                document.getElementById("bodyProduto"+posicao).style.display = "none";
            }else{
                document.getElementById("msgProduto"+posicao).style.display = "none";
                document.getElementById("vipList"+posicao).style.display = "block";
                document.getElementById("bodyProduto"+posicao).style.display = "block";
    
                var vipList = document.getElementById('vipList'+posicao);
                vipList.innerHTML = '';

                $("#produtoNome"+posicao).html(key)
                for (let y in value){
                    let valorRealizado = parseInt(value[y].valor_realizado)
                    let meta = parseInt(value[y].valor_meta)
                    let total = (valorRealizado / meta) * 100;
                    $('#vipList'+posicao).append('<div class="progress-item" id="vip_'+(value[y].vendedor+posicao)+'"data-value="'+valorRealizado+'" data-meta="'+meta+'">'+
                                                    '<div class="progress-label">'+
                                                        '<div class="title">'+value[y].vendedor_nome+'</div>'+
                                                        '<div class="value">'+valorRealizado+'<span>'+(meta ? "/" + meta : "")+'</span></div>'+
                                                    '</div>'+
                                                    '<div id="progress_'+(value[y].vendedor+posicao)+'"class="progress-bar">'+
                                                        '<div class="bar"></div>'+
                                                    '</div>'+
                                                    '</div>'+
                                                    '<div id="msgMeta_'+(value[y].vendedor+posicao)+'" class="body mensagem" style="display: none" '+
                                                '</div>');
                    if(meta > 0){

                        document.getElementById("progress_"+(value[y].vendedor+posicao)).style.display = "block";
                        if(total > 100){
                            let calculoBateuMeta = total - 100;
                            $('#vip_'+(value[y].vendedor+posicao)+' .progress-bar .bar').css('width',100 + '%');
                            $('#vip_'+(value[y].vendedor+posicao)+' .progress-bar .bar').append().html("<div class='bar pass' style='width:"+calculoBateuMeta+"%'></div>") 
                        } else {
                            $('#vip_'+(value[y].vendedor+posicao)+' .progress-bar .bar').css('width',total +'%')
                        }
                    }else{
                        document.getElementById("progress_"+(value[y].vendedor+posicao)).style.display = "none";
                        document.getElementById("msgMeta_"+(value[y].vendedor+posicao)).style.display = "block";
                    }

                }
            }
        }
    }
}

function setVipNaoAtivo(data){

    if (jQuery.isEmptyObject(data.dados.cpf_nao_ativos_list)){
        document.getElementById("relacaoVipNaoAtivos").style.display = "none";
        document.getElementById("msgvipNaoAtivos").style.display = "block";
        document.getElementById("vipNaoAtivos").style.display = "none";
    }else{
        document.getElementById("relacaoVipNaoAtivos").style.display = "flex";
        document.getElementById("msgvipNaoAtivos").style.display = "none";
        document.getElementById("vipNaoAtivos").style.display = "block";
    
        vendedor_list = data.dados.cpf_nao_ativos_list
        var posicao = 0;

        var vipNaoAtivos = document.getElementById('vipNaoAtivos');
        vipNaoAtivos.innerHTML = '';

        for (let x in vendedor_list){
            posicao ++;
            cpf=vendedor_list[x].cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")

            $('#vipNaoAtivos').append('<div class="progress-item" id="vipNaoAtivos_'+posicao+'">'+
                                            '<div class="progress-label">'+
                                                '<div class="title">'+vendedor_list[x].vendedor_nome+'</div>'+
                                                '<div class="value">'+cpf+'</div>'+
                                            '</div>'+
                                        '</div>');
        }
    }
}