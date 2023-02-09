# -*- coding: iso-8859-1 -*-
__title__ = 'Layout do Relatório Fluxo de caixa quadrimestral'
__exename__ = ('main')

from lzt.lzttypes import TypeFloat, TDate
from relatorio.data.base import BaseEngine
from relatorio.relpdf import format_float as f
from reportlab.lib.colors import HexColor

class ModeloFluxoCaixaQuadrimestral(BaseEngine):

	def float1(self, valor):
		return TypeFloat('fixed', digits=1).format(valor)

	def float2(self, valor):
		return TypeFloat('default', digits=2).format(valor)

	def float3(self, valor):
		return TypeFloat('default', digits=3).format(valor)

	def monta_relatorio(self, md, dados, relpdf):
		# md traz as informacoes da tela
		# dados traz todas as consultas sql podendo serem acessadas atraves da chave de consulta

		elements = []

		# Retorna a lista de valores com a chave, em ordem 4,3,2,1
		# Parametros: dicionario de dados, chave, decimal
		values = lambda x, p, d = 2, format = f: [ format(x["%s%s" % (p, v)] or 0.0, d) for v in  range(4, 0, -1)]
		bold = lambda x, y = None: "<b>%s</b>" % x

		# -------------------------------------------------------------------------------------------

		mes = dados['mes']
		temp = dados['banco']
		data = []
		styles = []

		if temp:
			data = [[bold("SALDO DE CONTAS"), ''] + values(mes, 'mes', format=bold)]
			styles.append(("SPAN", (0, 0), (1, 0)))

			for d in temp:
				if (d['valor4'] + d['valor3'] + d['valor2'] + d['valor1']) != 0:
					data.append(["%s" % d['conta_codigo'] , "%s" % d['conta_nome']] + values(d, 'valor'))

		temp = dados['caixa_receber_pagar']
		if temp:
			data.append(['CAIXA', ''] + values(temp[0], 'caixa'))
			data.append(['VALORES A RECEBER', ''] + values(temp[0], 'receber'))
			data.append(['CONTAS A PAGAR', ''] + values(temp[0], 'pagar'))
			data.append(['VENDA ANTECIPADA', ''] + values(temp[0], 'venda_antecipada'))
			data.append(['CHEQUE TROCO', ''] + values(temp[0], 'cheque_troco'))
			styles.append(("SPAN", (0, len(data) - 5), (1, len(data) - 5)))
			styles.append(("SPAN", (0, len(data) - 4), (1, len(data) - 4)))
			styles.append(("SPAN", (0, len(data) - 3), (1, len(data) - 3)))
			styles.append(("SPAN", (0, len(data) - 2), (1, len(data) - 2)))
			styles.append(("SPAN", (0, len(data) - 1), (1, len(data) - 1)))

		temp = dados['total_bcrp']
		if temp:
			data.append([bold('TOTAL'), ''] + values(temp[0], 'valor'))
			styles.append(("SPAN", (0, len(data) - 1), (1, len(data) - 1)))

		elements.append(relpdf.create_table(data,
										column_widths=[10, 39, 13, 13, 13, 13],
										template_style=(2, 7, 2),
										style=[
												("ALIGN", (0, 0), (1, -1), "LEFT"),
												("ALIGN", (2, 1), (-1, -1), "RIGHT")
												] + styles
										))

		############################################################# ok

		temp = dados['receitas']
		if temp:
			grupo_list = dict([(g['grupo_nome'], None) for g in temp]).keys()
			grupo_list.sort()

			# Cabecalho
			turno_l = [bold('TURNO')]
			for l in values(mes, 'mes', format=bold):
				turno_l.append(l)
				turno_l.append(bold('%'))

			data = [turno_l]
			first = 1

			for grupo in grupo_list:
				styles = []

				# Nome do grupo
				data.append([grupo] + [''] * (len(turno_l) - 1))
				styles.append(("SPAN", (0, len(data) - 1), (-1, len(data) - 1)))

				soma_valor = {
					'valor1': 0.0, 'valor2': 0.0, 'valor3': 0.0, 'valor4': 0.0,
					'perc1': 0.0, 'perc2': 0.0, 'perc3': 0.0, 'perc4': 0.0
				}
				# Valores
				for rs in temp:
					if rs.get('grupo_nome') and rs['grupo_nome'] == grupo:
						#Totaliza
						for k in soma_valor.keys():
							soma_valor[k] += rs[k]

						#Gera linha
						turno = ['TURNO: %s' % rs['turno']]
						for v, p in zip(values(rs, 'valor'), values(rs, 'perc', d=1)):
							turno.append(v)
							turno.append(p)
						data.append(turno)

				# Subtotais
				subtotal = ['SUBTOTAL']
				for v, p in zip(values(soma_valor, 'valor'), values(soma_valor, 'perc', d=1)):
					subtotal.append(v)
					subtotal.append(p)
				data.append(subtotal)

				elements.append(relpdf.create_table(data,
												column_widths=[32, 10, 7, 10, 7, 10, 7, 10, 7],
												template_style=(2, 7, 2),
												linhas_header=(first and 2 or 1),
												linhas_footer=1,
												style=[
														("ALIGN", (0, 0), (0, -1), "LEFT"),
														("ALIGN", (1, 1), (-1, -1), "RIGHT")
														] + styles,
												space_after=False))
				data = []
				first = 0
			elements.append(relpdf.create_space())
		############################################################# ok
		temp = dados['brinde']

		if temp:
			data = []
			styles = []
			grupo_list = dict([(g['grupo_nome'], None) for g in temp]).keys()
			grupo_list.sort()

			for grupo in grupo_list:

				# Nome do grupo
				data.append([grupo] + [''] * (len(turno_l) - 1))
				styles.append(("SPAN", (0, len(data) - 1), (-1, len(data) - 1)))

				soma_valor = {
					'valor1': 0.0, 'valor2': 0.0, 'valor3': 0.0, 'valor4': 0.0,
					'perc1': 0.0, 'perc2': 0.0, 'perc3': 0.0, 'perc4': 0.0
				}

				for rs in temp:
					if rs.get('grupo_nome') and rs['grupo_nome'] == grupo:
						#Totaliza
						for k in soma_valor.keys():
							soma_valor[k] += rs[k]

						#Gera linha
						turno = ['TURNO: %s' % rs['turno']]
						for v, p in zip(values(rs, 'valor'), values(rs, 'perc', d=1)):
							turno.append(v)
							turno.append(p)
						data.append(turno)


				# Subtotais
				subtotal = ['SUBTOTAL']
				for v, p in zip(values(soma_valor, 'valor'), values(soma_valor, 'perc', d=1)):
					subtotal.append(v)
					subtotal.append(p)
				data.append(subtotal)

				elements.append(relpdf.create_table(data,
												column_widths=[32, 10, 7, 10, 7, 10, 7, 10, 7],
												template_style=(2, 7, 2),
												linhas_header=1,
												linhas_footer=1,
												style=[
														("ALIGN", (0, 0), (0, -1), "LEFT"),
														("ALIGN", (1, 1), (-1, -1), "RIGHT")
														] + styles,
												space_after=False))

		#############################################################
		space = False
		temp = dados['extras']

		if temp:
			space = True
			data = []
			elements.append(relpdf.create_text(bold('EXTRA')))
			total = {
				'valor1': 0.0, 'valor2': 0.0, 'valor3': 0.0, 'valor4': 0.0,
				'perc1': 0.0, 'perc2': 0.0, 'perc3': 0.0, 'perc4': 0.0
			}

			for d in temp:
				val = [d['conta_nome']]
				for v, p in zip(values(d, 'valor'), values(d, 'perc', d=1)):
					val.append(v)
					val.append(p)
				data.append(val)

				for p in total.keys():
					total[p] += d.get(p) or 0.0

			subtotal = ['SUBTOTAL']
			for v, p in zip(values(total, 'valor'), values(total, 'perc', d=1)):
				subtotal.append(v)
				subtotal.append(p)
			data.append(subtotal)

			elements.append(relpdf.create_table(data,
										column_widths=[32, 10, 7, 10, 7, 10, 7, 10, 7],
										template_style=(2, 7, 2),
										linhas_header=0,
										linhas_footer=1,
										style=[
												("ALIGN", (0, 0), (0, -1), "LEFT"),
												("ALIGN", (1, 0), (-1, -1), "RIGHT")
												],
										space_after=False))

		#############################################################
		temp = dados['total_receitas']

		if temp:
			space = True
			data = []
			subtotal = [bold('TOTAL ENTRADAS')]
			for v in values(temp[0], 'valor'):
				subtotal.append(v)
				subtotal.append('100,0')
			data.append(subtotal)

			elements.append(relpdf.create_table(data,
										column_widths=[32, 10, 7, 10, 7, 10, 7, 10, 7],
										template_style=(2, 7, 2),
										linhas_header=1,
										linhas_footer=0,
										style=[
												("ALIGN", (0, 0), (0, -1), "LEFT"),
												("ALIGN", (1, 0), (-1, -1), "RIGHT")
												],
										space_after=False))

		if space:
			elements.append(relpdf.create_space())

		#############################################################
		temp = dados['despesas']
		space = False
		if temp:
			space = True
			data = []
			elements.append(relpdf.create_text(bold('SAÍDA')))

			for d in temp:
				extra_format = d['eh_pai'] == 't' and bold or (lambda x: x) # Pai é negrito
				val = [extra_format(d['conta_codigo']), extra_format(d['conta_nome'])]
				for v, p in zip(values(d, 'valor'), values(d, 'perc', d=1)):
					val.append(extra_format(v))
					val.append(extra_format(p))
				data.append(val)

			val = [bold('TOTAL SAÍDAS'), '']
			for v in values(temp[0], 'total'):
				val.append(v)
				val.append('')
			data.append(val)

			elements.append(relpdf.create_table(data,
										column_widths=[8, 24, 10, 7, 10, 7, 10, 7, 10, 7],
										template_style=(2, 7, 2),
										linhas_header=0,
										linhas_footer=1,
										style=[
												("ALIGN", (0, 0), (1, -1), "LEFT"),
												("ALIGN", (2, 0), (-1, -1), "RIGHT"),
												('SPAN', (0, len(data) - 1), (1, len(data) - 1))
												],
										space_after=False))

		#############################################################

		temp = dados['subtotal_1']

		if temp:
			space = True
			data = []

			val = [bold('ENTRADAS - SAIDAS')]
			for v in values(temp[0], 'valor'):
				val.append(v)
				val.append('')
			data.append(val)

			elements.append(relpdf.create_table(data,
										column_widths=[32, 10, 7, 10, 7, 10, 7, 10, 7],
										template_style=(2, 7, 2),
										linhas_header=0,
										linhas_footer=1,
										style=[
												("ALIGN", (0, 0), (0, 0), "LEFT"),
												("ALIGN", (1, 0), (-1, 0), "RIGHT")
												],
										space_after=False))

		if space:
			elements.append(relpdf.create_space())

		#############################################################
		for temp, legenda in [(dados['debitos'], 'DÉBITOS'), (dados['obras'], 'OBRAS')]:
			if not temp:
				continue

			data = []
			elements.append(relpdf.create_text(bold(legenda)))

			total = {
				'valor1': 0.0, 'valor2': 0.0, 'valor3': 0.0, 'valor4': 0.0,
				'perc1': 0.0, 'perc2': 0.0, 'perc3': 0.0, 'perc4': 0.0
			}

			for d in temp:
				val = [d['conta_codigo'], d['conta_nome']]
				for v, p in zip(values(d, 'valor'), values(d, 'perc', d=1)):
					val.append(v)
					val.append(p)
				data.append(val)

			for p in total.keys():
				total[p] += d.get(p) or 0.0

			val = [bold('TOTAL %s' % legenda), '']
			for v, p in zip(values(total, 'valor'), values(total, 'perc', d=1)):
				val.append(v)
				val.append(p)
			data.append(val)

			val = [bold('SUBTOTAL'), '']
			for v in values(temp[0], 'subtotal'):
				val.append(v)
				val.append('')
			data.append(val)

			elements.append(relpdf.create_table(data,
										column_widths=[8, 24, 10, 7, 10, 7, 10, 7, 10, 7],
										template_style=(2, 7, 2),
										linhas_header=0,
										linhas_footer=1,
										style=[
												("ALIGN", (0, 0), (1, -1), "LEFT"),
												("ALIGN", (2, 0), (-1, -1), "RIGHT"),
												('SPAN', (0, len(data) - 2), (1, len(data) - 2)),
												('SPAN', (0, len(data) - 1), (1, len(data) - 1))
												]))


		#############################################################
		temp = dados['dc']

		if temp:
			data = []
			elements.append(relpdf.create_text(bold('D/C')))

			total_valor = {'valor1': 0.0, 'valor2': 0.0, 'valor3': 0.0, 'valor4': 0.0}
			total_perc = {'perc1': 0.0, 'perc2': 0.0, 'perc3': 0.0, 'perc4': 0.0}

			for d in temp:
				val = [d['conta_codigo'], d['conta_nome']]
				for v, p in zip(values(d, 'valor'), values(d, 'perc', d=1)):
					val.append(v)
					val.append(p)
				data.append(val)

				if d['pai'] != 't':
					for p in total_valor.keys():
						total_valor[p] += d.get(p) or 0.0

				for p in total_perc.keys():
					total_perc[p] += d.get(p) or 0.0

			val = [bold('TOTAL D/C'), '']
			for v, p in zip(values(total_valor, 'valor'), values(total_perc, 'perc', d=1)):
				val.append(v)
				val.append(p)
			data.append(val)

			val = [bold('SUBTOTAL'), '']
			for v in values(temp[0], 'subtotal'):
				val.append(v)
				val.append('')
			data.append(val)

			elements.append(relpdf.create_table(data,
										column_widths=[8, 24, 10, 7, 10, 7, 10, 7, 10, 7],
										template_style=(2, 7, 2),
										linhas_header=0,
										linhas_footer=1,
										style=[
												("ALIGN", (0, 0), (1, -1), "LEFT"),
												("ALIGN", (2, 0), (-1, -1), "RIGHT"),
												('SPAN', (0, len(data) - 2), (1, len(data) - 2)),
												('SPAN', (0, len(data) - 1), (1, len(data) - 1))
												]))

		#############################################################
		temp = dados['saldos']

		if temp:
			elements.append(relpdf.create_text(bold('SALDOS')))
			data = []

			for legenda, campo in [('ANTERIOR', 'anterior_'),
								('ATUAL', 'atual_'),
								('OPERACIONAL', 'operacional_'),
								('GALONAGEM', 'galona'),
								]:
				val = [bold(legenda)]
				for v in values(temp[0], campo):
					val.append(v)
					val.append('')
				data.append(val)

			val = [bold('OPERACIONAL')]
			operacional = values(temp[0], 'operacional_', format=lambda x, y: x)
			galona = values(temp[0], 'galona', format=lambda x, y: x)
			for v in range(len(operacional)):
				val.append(self.float2(operacional[v] + galona[v]))
				val.append('')
			data.append(val)
			elements.append(relpdf.create_table(data,
										column_widths=[32, 10, 7, 10, 7, 10, 7, 10, 7],
										template_style=(0, 0, 0),
										linhas_header=0,
										linhas_footer=0,
										style=[
												("ALIGN", (0, 0), (0, -1), "LEFT"),
												("ALIGN", (1, 0), (-1, -1), "RIGHT"),
												("BOX", (0, 0), (-1, -1), 0.5, HexColor(0x000000)),
												("LINEABOVE", (0, 2), (-1, 2), 0.5, HexColor(0x000000)),
												("BOX", (1, 0), (0, -1), 0.25, HexColor(0x000000)),
												("BOX", (2, 0), (1, -1), 0.25, HexColor(0x000000)),
												("BOX", (3, 0), (2, -1), 0.25, HexColor(0x000000)),
												("BOX", (4, 0), (3, -1), 0.25, HexColor(0x000000)),
												("BOX", (5, 0), (4, -1), 0.25, HexColor(0x000000)),
												("BOX", (6, 0), (5, -1), 0.25, HexColor(0x000000)),
												("BOX", (7, 0), (6, -1), 0.25, HexColor(0x000000)),
												("BOX", (8, 0), (7, -1), 0.25, HexColor(0x000000)),
												]))
		return elements
