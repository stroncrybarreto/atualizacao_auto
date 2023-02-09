var produtoCount = 0;

function addProduto() {
	var produto_id = $("#produto_id").val();
	var codigo = $("#codigo").val();
	var nome = $("#nome").html();
	var quantidade = $("#quantidade").val();

	if (!produto_id) {
		alert("Informe um produto.");
		return;
	}

	$.getJSON("produto/add/", { produto_id: produto_id, codigo: codigo, quantidade: quantidade }, function (ret) {

		var html = '<tr data-id="' + ret.id + '" data-produto="' + ret.produto_id +  '">';
		html += '<td>' + ret.codigo + '<br><b>' + ret.nome + '</b></td>';
		html += '<td align="center">' + ret.quantidade + '</td>';
		html += '<td><a href="javascript: delProduto(' + ret.id + ')">[X]</a></td>';

		$('#lista tr:last').after(html);
		resetForm();

		}).error(function (jqXHR, msg, exc) {alert("Quantidade inválida.")} );

	$("#produto_id").val("");
	return;
}

function delProduto(id) {
	$.getJSON("produto/" + id + "/del/", function (ret) {
		$('tr[data-id="' + id + '"]').remove();
	});
}

function onProdutoChange() {
	var codigo = $("#codigo").val();
	$("#nome").html("");
	$("#produto_id").val("");

	$.getJSON("/produto/" + codigo + "/json/", function(ret) {
		$("#produto_id").val(ret.id);
		$("#nome").html(ret.nome);
	}).error(function (jqXHR, msg, exc) {
		// FIXME: Mostrar o retorno do 404
		$("#nome").html("Produto não encontrado.");
	});
}

function onProdutoKeyUp() {
	if ($("#codigo").val().length == 0) {
		$("#produto_id").val("");
		$("#nome").html("");
	}

	if ($("#codigo").val().length == $("#codigo")[0].maxLength){
		$('#quantidade').focus();
	}
}

function resetForm() {
	$("#mainForm")[0].reset();
	$("#nome").html("");
	$('#codigo').focus();
}
