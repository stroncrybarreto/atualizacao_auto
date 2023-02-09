# -*- coding: iso-8859-1 -*-
__title__   = 'Layout Apuração de Resultado Operacional PDF'
__author__  = 'Fabiano Voss'
__cvsinfo__ = "$Id: resultado_operacional_layout.py,v 1.7 2012/03/08 01:39:33 ricardo Exp $"
__exename__ = ('main')

from lzt.lztgtk import LztDialogSimples
from lzt.lzttypes import TDate, TInteger, TString, TypeFloat
from lzt.lztutil import lzt_iterator, sum_key
from relatorio.data.base import BaseEngine
from relatorio.relpdf import format_float

class ModeloResultadoOpPDF(BaseEngine):

	def monta_relatorio(self, rs_sessao, relpdf):
		elementos = []
		dlg = LztDialogSimples('Lendo layout...')

		dlg.show()

		# Itera sobre todas as sessoes configuradas no perfil do relatorio
		for sessao in rs_sessao:
			data = []
			elementos.append(relpdf.create_text('<b>%s</b>' % sessao['titulo']))

			# Esta variavel eh utilizada pelos detalhes de conta para exibir o cabecalho uma vez soh
			rs_det = sessao['detalhe_list']

			for i in lzt_iterator(rs_det):
			# Itera sobre os detalhes de cada sessao do perfil
				style = []
				col = []
				det = i.value

				if det['origem'] == 'C':
					# Monta o layout para origem conta
					saldo = det['saldo_conta']
					exibir = det['exibir_saldo']
					ini = fim = dif = ''

					if not data:

						if exibir == 'F':
							fim = '<b>Final</b>'
						elif exibir == 'IF':
							ini = '<b>Inicial</b>'
							fim = '<b>Final</b>'
						elif exibir == 'D':
							dif = '<b>Diferença</b>'
						else:
							ini = '<b>Inicial</b>'
							fim = '<b>Final</b>'
							dif = '<b>Diferença</b>'
						data.append(['<b>Saldo das Contas</b>', None, ini, fim, dif])

					data, style, col = self.monta_conta(elementos, saldo, exibir, data, style, col, ini, fim, dif, relpdf)

				elif det['origem'] == 'V':
					# Monta o layout para origem venda de acordo com o agrupamento escolhido
					data = []
					venda = det['valor_venda']
					data, style, col = self.monta_venda(elementos, venda, det['detalhar_comb'], det['titulo'], data, style, col)

				elif det['origem'] == 'P':
					# Monta o layout para origem custo de produtos
					custo = det['custo_produto']
					data, style, col = self.monta_custo(elementos, custo, det['titulo'], data, style, col)

				else:
					# Monta o layout para a origem expressao
					val = det['valor_expr']
					v1 = v2 = v3 = ''

					if val[0]:
						v1 = format_float(val[0])
					if val[1]:
						v2 = format_float(val[1])
					if val[2]:
						v3 = format_float(val[2])

					data.append([
								'<b>%s</b>' % det['titulo'],
								'<b>%s</b>' % v1,
								'<b>%s</b>' % v2,
								'<b>%s</b>' % v3
							])

					style = [
							("ALIGN", (0, 0), (0, 0), "LEFT"),
							("ALIGN", (1, 0), (-1, 0), "RIGHT")
							]

					col = [25, 25, 25, 25]

				if not i.last and rs_det[i.ix + 1]['origem'] == det['origem']:
					continue
				else:
					elementos.append(relpdf.create_table(data, template_style=(2, 2, 2), style=style, column_widths=col,
															linhas_header=0, linhas_footer=0))
					data = []

		dlg.quit()
		return elementos

	def monta_conta(self, elementos, saldo, exibir, data, style, col, ini, fim, dif, relpdf):

		for s in saldo:
			ini = fim = dif = ''

			if exibir == 'F':
				fim = format_float(s['saldo_fim'])
			elif exibir == 'IF':
				ini = format_float(s['saldo_ini'])
				fim = format_float(s['saldo_fim'])
			elif exibir == 'D':
				dif = format_float(s['saldo_fim'] - s['saldo_ini'])
			else:
				ini = format_float(s['saldo_ini'])
				fim = format_float(s['saldo_fim'])
				dif = format_float(s['saldo_fim'] - s['saldo_ini'])

			data.append(['%s' % s['conta_codigo'],
						'%s' % s['conta_nome'],
						'%s' % ini,
						'%s' % fim,
						'%s' % dif
						])

		style = [
					("ALIGN", (0, 0), (0, 0), "LEFT"),
					("ALIGN", (0, 1), (0, -1), "LEFT"),
					("ALIGN", (1, 1), (-1, -1), "LEFT"),
					("ALIGN", (2, 1), (-1, -1), "RIGHT"),
					("SPAN", (0, 0), (1, 0))
					]

		col = [17, 38, 15, 15, 15]


		return data, style, col

	def monta_venda(self, elementos, venda, detalhar_comb, titulo, data, style, col):
		total1 = total2 = 0.0
		prod = []
		comb = []
		alinha = []
		linha = 0

		for v in venda:
			if v['grupo'] == 'COMBUSTIVEL':
				comb.append(v)
			else:
				prod.append(v)

		comb_dict = {}
		comb_dict['grupo'] = 'COMBUSTIVEL'
		comb_dict['quantidade'] = sum_key('quantidade', comb)
		comb_dict['valor'] = sum_key('valor', comb)
		comb_dict['lucro_bruto'] = sum_key('lucro_bruto', comb)

		venda_list = ['<b>Venda de Produtos</b>',
						None,
						'<b>Custo Médio</b>',
						'<b>Preço Médio</b>',
						'<b>Lucro Unit.</b>',
						'<b>Quantidade</b>',
						'<b>Valor</b>',
						'<b>Lucro Bruto</b>',
						'<b>Perc.</b>']

		alinha.append(("SPAN", (0, 0), (1, 0)))

		if detalhar_comb:
			data.append(venda_list)
			linha = len(data)

			if comb:
				data.append([
						'Combustível</b>',
						None,
						None,
						None,
						None,
						'%s' % format_float(comb_dict['quantidade'], 3),
						'%s' % format_float(comb_dict['valor']),
						'%s' % format_float(comb_dict['lucro_bruto']),
						None
						])

				alinha.append(("ALIGN", (0, linha), (0, linha), "LEFT"))
				alinha.append(("ALIGN", (5, linha), (8, linha), "RIGHT"))
				alinha.append(("SPAN", (0, linha), (1, linha)))

				for c in comb:
					preco_unit = c['valor'] / c['quantidade']
					c['perc'] = (preco_unit * 100 / c['custo']) - 100
					lucro_unit = preco_unit - c['custo']
					data.append([
							'<i>%s</i>' % c['produto'],
							None,
							'%s' % format_float(c['custo'], 3),
							'%s' % format_float(preco_unit, 3),
							'%s' % format_float(lucro_unit),
							'%s' % format_float(c['quantidade'], 3),
							'%s' % format_float(c['valor']),
							'%s' % format_float(c['lucro_bruto']),
							'%s' % format_float(c['perc'])
						])

					linha = len(data) - 1
					total1 += c['valor']
					total2 += c['lucro_bruto']

					alinha.append(("SPAN", (0, linha), (1, linha)))
					alinha.append(("ALIGN", (2, linha), (-1, linha), "RIGHT"))
					alinha.append(("ALIGN", (0, linha), (1, linha), "LEFT"))
					alinha.append(("LEFTPADDING", (0, linha), (1, linha), 18))

		else:
			comb = []
			prod.append(comb_dict)
			comb.append('<b>Venda de Produto</b>'
						)
			#MELHORAR
			comb.append(None)

			venda_list = venda_list[5:]
			for i in venda_list:
				comb.append(i)

			data.append(comb)
			linha = len(data) - 1
			alinha.append(("SPAN", (0, linha), (1, linha)))

			comb = []

		prod.sort()

		for p in prod:
			venda_list = ['%s' % p['grupo'],
						None,
						None,
						None,
						None,
						'%s' % format_float(p['quantidade']),
						'%s' % format_float(p['valor']),
						'%s' % format_float(p['lucro_bruto']),
						'%s' % format_float(p.get('perc'))]

			if not detalhar_comb:
				venda_list = venda_list[5:]
				comb.append('%s' % p['grupo'])
				comb.append(None)
				for i in venda_list:
					comb.append(i)

				data.append(comb)

				linha = len(data) - 1

				alinha.append(("SPAN", (0, linha), (1, linha)))
				alinha.append(("ALIGN", (0, linha), (1, linha), "LEFT"))
				alinha.append(("ALIGN", (2, linha), (-1, linha), "RIGHT"))

				comb = []
			else:
				data.append(venda_list)

				linha = len(data) - 1

				alinha.append(("SPAN", (0, linha), (1, linha)))
				alinha.append(("ALIGN", (2, linha), (-1, linha), "RIGHT"))
				alinha.append(("ALIGN", (0, linha), (1, linha), "LEFT"))

			total1 += p['valor']
			total2 += p['lucro_bruto']

		venda_list = ['<b>Subtotal</b>',
				None,
				None,
				None,
				None,
				None,
				'<b>%s</b>' % format_float(total1),
				'<b>%s</b>' % format_float(total2),
				None]

		if not detalhar_comb:
			venda_list = venda_list[5:]
			comb.append('<b>Subtotal</b>')
			comb.append(None)
			for i in venda_list:
				comb.append(i)

			alinha.append(("ALIGN", (0, -1), (1, -1), "LEFT"))
			alinha.append(("ALIGN", (2, -1), (-1, -1), "RIGHT"))
			alinha.append(("SPAN", (0, -1), (1, -1)))
			data.append(comb)

			for i in alinha:
				style.append(i)

			col = [25.333333332, 16.666666667, 16.666666667, 16.666666667, 16.666666667, 8]
		else:
			data.append(venda_list)
			linha = len(data) - 1
			alinha.append(("ALIGN", (0, -1), (1, -1), "LEFT"))
			alinha.append(("ALIGN", (6, -1), (8, -1), "RIGHT"))
			alinha.append(("SPAN", (0, linha), (5, linha)))

			for i in alinha:
				style.append(i)

			style = style
			col = [13.222222222, 15.222222223, 11.111111111, 11.111111111, 8, 11.111111111, 11.111111111, 11.111111111, 8]

		return data, style, col

		### FIM MONTA VENDA

	def monta_custo(self, elementos, venda, titulo, data, style, col):
		total1 = total2 = total3 = 0.0

		data.append([
					'<b>Código</b>',
					'<b>Nome</b>',
					'<b>Valor Inicial</b>',
					'<b>Valor Final</b>',
					'<b>Diferença</b>'
				])

		for v in venda:
			if not (v['valor_ini'] or v['valor_fim']):
				continue

			data.append([
					'%s' % v['codigo'],
					'%s' % v['nome'],
					'%s' % format_float(v['valor_ini']),
					'%s' % format_float(v['valor_fim']),
					'%s' % format_float(v['dif'])
				])

			total1 += v['valor_ini']
			total2 += v['valor_fim']
			total3 += v['dif']

		data.append([
				'<b>Subtotal</b>',
				None,
				'<b>%s</b>' % format_float(total1),
				'<b>%s</b>' % format_float(total2),
				'<b>%s</b>' % format_float(total3),
				])

		style = [
				("ALIGN", (0, 1), (0, -1), "LEFT"),
				("ALIGN", (2, 1), (-1, -1), "RIGHT"),
				("ALIGN", (1, 1), (1, -2), "LEFT")

				]

		col = [11, 44, 15, 15, 15]

		return data, style, col

		### FIM MONTA CUSTO

if __name__ == "__main__":
	from util.workspace import ws
	ws.connect_db(debug=1)
	ws.user.load_info(-1)
	F = ModeloResultadoOpPDF(ws)
	F.monta_relatorio()
