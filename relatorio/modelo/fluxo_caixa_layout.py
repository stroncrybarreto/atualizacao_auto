# -*- coding: iso-8859-1 -*-
__title__   = 'Layout de Fluxo de Caixa PDF'
__author__  = 'Fabiano Voss'
__cvsinfo__ = "$Id: fluxo_caixa_layout.py,v 1.3 2012/04/10 13:40:14 ricardo Exp $"
__exename__ = ('main')

from lzt.lztutil import lzt_iterator
from lzt.lzttypes import TDate, TInteger, TString, TypeFloat
from lzt.lztgtk import LztDialogSimples
from relatorio.relpdf import format_float as ffloat
from relatorio.data.base import BaseEngine

class ModeloFluxoCaixaPDF(BaseEngine):

	def monta_relatorio(self, md, rs_sessao, relpdf):
		mes_list = ['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO']

		elements = []
		mes = [mes_list[md['data_ref'].month-1], mes_list[md['data_ref'].month-2], mes_list[md['data_ref'].month-3]]
		dlg = LztDialogSimples('Lendo layout...')
		dlg.show()

		b = lambda x: '<b>%s</b>' % x # bold
		last = ''

		# Itera sobre todas as sessoes configuradas no perfil do relatorio
		for sessao in rs_sessao:
			elements.append(relpdf.create_text(b(sessao['titulo'])))

			rs_det = sessao['detalhe_list']
			data = []
			styles_contas = []

			for i in range(len(rs_det)):
				det = rs_det[i]
				if det['origem'] == 'C':
					if last not in ('C', ''):
						elements.append(relpdf.create_space())

					# Monta o layout para origem conta

					if not data:
						data.append([b('SALDO DAS CONTAS'), ''] + [b(m) for m in mes])
						styles_contas.append(('SPAN', (0, 0), (1, 0)))

					saldo = det['saldo_conta']

					for s in saldo:
						if md['nao_exibe_saldo_zerado']:
							if (s['valor_1'] and s['valor_2'] and s['valor_3']) == 0:
									continue

						data.append([s['conta_codigo'], s['conta_nome'], ffloat(s['valor_1']), ffloat(s['valor_2']), ffloat(s['valor_3'])])

					if ((not det is rs_det[-1] and not rs_det[i+1]['origem'] == 'C') or det is rs_det[-1]):
						elements.append(relpdf.create_table(data,
													column_widths=[15, 43, 13, 13, 13],
													template_style=(2, 2, 2),
													linhas_header=1,
													linhas_footer=0,
													space_after=False,
													style=[
															("ALIGN", (0, 0), (1, -1), "LEFT"),
															("ALIGN", (2, 1), (-1, -1), "RIGHT")
															] + styles_contas
													))
						last = 'C'
						data = []
						styles_contas = []

				elif det['origem'] == 'V':
					# Monta o layout para origem venda de acordo com o agrupamento escolhido
					data = [[b(det['titulo']), b(mes[0]), b(mes[1]), b(mes[2])]]
					elements.append(relpdf.create_table(data,
										column_widths=[58, 13, 13, 13],
										template_style=(2, 2, 2),
										linhas_header=0,
										linhas_footer=1,
										style=[ ("ALIGN", (0, -1), (0, -1), "LEFT") ],
										space_after = False
										))

					venda = det['valor_venda']
					agrupa = det['agrupa_venda']

					if agrupa == 'PT':
						total = self.monta_venda(relpdf, elements, venda, 'PRODUTO', 'TURNO')
					elif agrupa == 'TP':
						total = self.monta_venda(relpdf, elements, venda, 'TURNO', '')
					elif agrupa == 'GT':
						total = self.monta_venda(relpdf, elements, venda, 'GRUPO', 'TURNO')
					elif agrupa == 'TG':
						total = self.monta_venda(relpdf, elements, venda, 'TURNO', '')
					elif agrupa == 'GPT':
						total = self.monta_venda_aux(relpdf, elements, venda, 'GRUPO', 'PRODUTO', 'TURNO')
					elif agrupa == 'TGP':
						total = self.monta_venda_aux(relpdf, elements, venda, 'TURNO', 'GRUPO', 'PRODUTO')

					elements.append(relpdf.create_table([[b('TOTAL'), b(ffloat(total[0])), b(ffloat(total[1])), b(ffloat(total[2]))]],
										column_widths=[58, 13, 13, 13],
										template_style=(2, 2, 2),
										linhas_header=0,
										linhas_footer=1,
										style=[
												("ALIGN", (0, 0), (0, 0), "LEFT"),
												("ALIGN", (1, 0), (-1, 0), "RIGHT")
												],
										space_after = False
										))
					last = 'V'
				else:
					val = det['valor_expr']
					elements.append(relpdf.create_table([[b(det['titulo']), b(ffloat(val[0])), b(ffloat(val[1])), b(ffloat(val[2]))]],
										column_widths=[58, 13, 13, 13],
										template_style=(2, 2, 2),
										linhas_header=0,
										linhas_footer=1,
										style=[
												("ALIGN", (0, 0), (0, 0), "LEFT"),
												("ALIGN", (1, 0), (-1, 0), "RIGHT")
												],
										space_after = False
										))

		dlg.quit()
		return elements

	def monta_venda_aux(self, relpdf, elements, venda, titcab, titdet, titcol):
		# Monta o layout de venda com 3 agrupamentos ex.: Turno/Grupo/Produto
		total1 = total2 = total3 = 0.0

		for chave, valor in venda:
			elements.append(relpdf.create_table([['<b>%s: %s</b>' % (titcab, chave), '', '', '']],
										column_widths=[58, 13, 13, 13],
										template_style=(2, 2, 2),
										linhas_header=1,
										linhas_footer=0,
										style=[ ('SPAN', (0, 0), (-1, 0)),
												('ALIGN', (0, 0), (-1, 0), 'LEFT')],
										space_after = False))

			rs_total = self.monta_venda(relpdf, elements, valor, titdet, titcol)

			elements.append(relpdf.create_table([['SUBTOTAL %s: %s' % (titcab, chave), ffloat(rs_total[0]), ffloat(rs_total[1]), ffloat(rs_total[2])]],
										column_widths=[58, 13, 13, 13],
										template_style=(2, 2, 2),
										linhas_header=0,
										linhas_footer=1,
										style=[ ('ALIGN', (0, 0), (0, 0), 'LEFT'),
												('ALIGN', (1, 0), (-1, 0), 'RIGHT')],
										space_after = False))
			total1 += rs_total[0]
			total2 += rs_total[1]
			total3 += rs_total[2]

		return total1, total2, total3

	def monta_venda(self, relpdf, elements, venda, titcab, titcol):
		# Monta o layout de venda com 2 agrupamentos ex.: Grupo/Turno
		total1 = total2 = total3 = 0.0

		for chave, valor in venda:
			d = [['<b>%s: %s</b>' % (titcab, chave), '', '', '']]
			subtot1 = subtot2 = subtot3 = 0.0

			for v in valor:
				d.append(['%s %s' % (titcol, v['coluna']), ffloat(v['valor_1']), ffloat(v['valor_2']), ffloat(v['valor_3'])])

				total1 += v['valor_1']
				total2 += v['valor_2']
				total3 += v['valor_3']
				subtot1 += v['valor_1']
				subtot2 += v['valor_2']
				subtot3 += v['valor_3']

			if d:
				d.append(['SUBTOTAL %s' % titcab, ffloat(subtot1), ffloat(subtot2), ffloat(subtot3)])
				elements.append(relpdf.create_table(d,
												column_widths=[58, 13, 13, 13],
												template_style=(2, 2, 2),
												linhas_header=1,
												linhas_footer=1,
												style=[
														("ALIGN", (0, 0), (0, -1), "LEFT"),
														("ALIGN", (1, 1), (-1, -1), "RIGHT")
														],
												space_after = False
												))
		return total1, total2, total3
