# -*- coding: iso-8859-1 -*-
__title__   = 'Layout do Relatório Fluxo de caixa mensal'
__exename__ = ('main')

from lzt.lzttypes import TypeFloat, TDate

from relatorio.relatoriopdf import *
from relatorio.data.base import BaseEngine
		
class ModeloFluxoCaixaMensal(BaseEngine):

	def float1(self, valor):
		return TypeFloat('fixed', digits = 1).format(valor)

	def float2(self, valor):
		return TypeFloat('default', digits = 2).format(valor)

	def float3(self, valor):
		return TypeFloat('default', digits = 3).format(valor)

	def monta_relatorio(self, md, dados):
		# MD traz as informacoes da tela
		# dados traz todas as consultas sql podendo serem acessadas atraves da chave de consulta
		
		elementos = []
		temp = dados['banco']
		
		lista_banco = ['detail_alt']

		if temp:
			elementos.append(
						(
						'table_header', 
						[('SALDO DAS CONTAS', 50, 0.0, True),\
								('%s' % 'VALOR', 16, 0.5, True)],
						)
					)

			for d in temp:
				if d['valor1'] != 0:
					lista_banco.append([('%s' % d['conta_codigo'], 10, 0.0, True), ('%s' % d['conta_nome'], 39, 0.0, False),\
							('%s' % self.float2(d['valor1']), 16, 1.0, True)],)

		temp = dados['caixa_receber_pagar']
		
		if temp:
			lista_banco.append(
						[('CAIXA', 50, 0.0, True),\
								('%s' % self.float2(temp[0]['caixa1']), 16, 1.0, True)],)
			lista_banco.append(
						[('VALORES A RECEBER', 50, 0.0, True),\
								('%s' % self.float2(temp[0]['receber1']), 16, 1.0, True)],)
			lista_banco.append(
						[('CONTAS A PAGAR', 50, 0.0, True),\
								('%s' % self.float2(temp[0]['pagar1']), 16, 1.0, True)],) 
			lista_banco.append(
						[('VENDA ANTECIPADA', 50, 0.0, True),\
								('%s' % self.float2(temp[0]['venda_antecipada1']), 16, 1.0, True)],) 
			lista_banco.append(
						[('CHEQUE TROCO', 50, 0.0, True),\
								('%s' % self.float2(temp[0]['cheque_troco1']), 16, 1.0, True)],) 

		elementos.append(lista_banco)
		#############################################################
		
		temp = dados['total_bcrp']
		
		if temp:
			elementos.append(
						(
						'table_footer',
						[('TOTAL', 50, 0.0, True),\
								('%s' % self.float2(temp[0]['valor1']), 16, 1.0, True)],
						),

					)

		############################################################# ok
		
		temp = dados['receitas']
		
		if temp:
			grupo_list = []

			for g in temp:
				if not g['grupo_nome'] in grupo_list:
					grupo_list.append(g['grupo_nome'])

			grupo_list.sort()

			elementos.append(('break',),)

			elementos.append(
						(
						'table_header', 
						[('TURNO', 47, 0.0, True),\
								('%s' % 'VALOR', 12, 0.5, True), ('%', 6, 0.5, True)],
						)
					)
		
			for grupo in grupo_list:
				elementos.append(
						(
						'table_header', 
						[('%s' % grupo, 67, 0.0, True)],
						)
					)

				soma_valor1 = 0			
				soma_perc1 = 0

				lista_receita = ['detail_alt']
				for rs in temp:
					if rs.get('grupo_nome') and rs['grupo_nome'] == grupo:
						perc = rs['valor1']*100/dados['total_receitas'][0]['valor1']
						soma_valor1 += rs['valor1']
						soma_perc1 += perc
						lista_receita.append([('TURNO: %s' % rs['turno'], 47, 0.0, True),\
								('%s' % self.float2(rs['valor1']), 12, 1.0, True), ('%s' % self.float1(perc), 6, 1.0, True)])
	
				elementos.append(lista_receita)

				elementos.append(
							(
							'table_footer',
							[('SUBTOTAL', 47, 0.0, True),\
									('%s' % self.float2(soma_valor1), 12, 1.0, True), ('%s' % self.float1(soma_perc1), 6, 1.0, True)],
							),
						)

		#############################################################
		temp = dados['brinde']
		
		if temp:
			grupo_list = []

			for g in temp:
				if not g['grupo_nome'] in grupo_list:
					grupo_list.append(g['grupo_nome'])

			grupo_list.sort()

			elementos.append(('break',),)

			for grupo in grupo_list:
				elementos.append(
						(
						'table_header', 
						[('%s' % grupo, 67, 0.0, True)],
						)
					)

				soma_valor1 = 0			
				soma_perc1 = 0

				lista_receita = ['detail_alt']
				for rs in temp:
					if rs.get('grupo_nome') and rs['grupo_nome'] == grupo:
						perc = rs['valor1']*100/dados['total_receitas'][0]['valor1']
						soma_valor1 += rs['valor1']
						soma_perc1 += perc
						lista_receita.append([('TURNO: %s' % rs['turno'], 47, 0.0, True),\
								('%s' % self.float2(rs['valor1']), 12, 1.0, True), ('%s' % self.float1(perc), 6, 1.0, True)])
	
				elementos.append(lista_receita)

				elementos.append(
							(
							'table_footer',
							[('SUBTOTAL', 47, 0.0, True),\
									('%s' % self.float2(soma_valor1), 12, 1.0, True), ('%s' % self.float1(soma_perc1), 6, 1.0, True)],
							),
						)

		#############################################################
		temp = dados['extras']
		
		if temp:
			elementos.append(
					(
						'text',
					('<font size="13"><b>EXTRAS</b></font>', 118, 0.0, True)
					),
					)
			elementos.append(('break',),)

			total_mes1 = 0
			total_perc1 = 0

			lista_extra = ['detail_alt']

			for d in temp:
				perc = rs['valor1']*100/dados['total_receitas'][0]['valor1']
				lista_extra.append([('%s' % d['conta_nome'], 47, 0.0, True),\
						('%s' % self.float2(d['valor1']), 12, 1.0, True), ('%s' % self.float1(perc) , 6, 1.0, True)])
				
				total_perc1 += perc
				if d.get('valor1'): 
					total_mes1 += d['valor1']
				
			elementos.append(lista_extra)	

			elementos.append(
						(
						'table_footer',
						[('SUBTOTAL', 47, 0.0, True),\
								('%s' % self.float2(total_mes1), 12, 1.0, True), ('%s' % self.float1(total_perc1), 6, 1.0, True)],
						),
					)
		
		#############################################################
		temp = dados['total_receitas']

		if temp:
			elementos.append(
					(
					'table_footer',
					[('TOTAL ENTRADAS', 47, 0.0, True),\
							('%s' % self.float2(temp[0]['valor1']), 12, 1.0, True), ('100,0', 6, 1.0, True)],
					),
				)

		#############################################################
		temp = dados['despesas']
		
		if temp:
			elementos.append(
					(
						'text',
					('<font size="13"><b>SAIDAS</b></font>', 118, 0.0, True)
					),
					)

			elementos.append(('break',),)

			lista_despesa = ['detail_alt']

			for d in temp:
				if d['eh_pai'] == 't':
					lista_despesa.append([('<b>%s</b>' % d['conta_codigo'], 6, 0.0, True), ('<b>%s</b>' % d['conta_nome'] , 40, 0.0, True),\
							('<b>%s</b>' % self.float2(d['valor1']), 12, 1.0, True), ('<b>%s</b>' % self.float1(d['perc1']), 6, 1.0, True)])
				else:
					lista_despesa.append([('%s' % d['conta_codigo'], 6, 0.0, True), ('%s' % d['conta_nome'] , 40, 0.0, True),\
							('%s' % self.float2(d['valor1']), 12, 1.0, True), ('%s' % self.float1(d['perc1']), 6, 1.0, True)])

			elementos.append(lista_despesa)

			elementos.append(
					(
					'detail',
					[('TOTAL SAIDAS', 47, 0.0, True),\
							('%s' % self.float2(temp[0]['total1']), 12, 1.0, True), ('100,0', 6, 1.0, True)],
					),
				)


		#############################################################
		
		temp = dados['subtotal_1']
		
		if temp:
			lista_banco = ['detail_alt']
	
			elementos.append(
					(
					'table_footer',
					[('ENTRADAS - SAIDAS', 47, 0.0, True),\
							('%s' % self.float2(temp[0]['valor1']), 12, 1.0, True),	('', 6, 0.0, True)],
					),
				)
		
		#############################################################
		temp = dados['debitos']

		if temp:
			elementos.append(
					(
						'text',
					('<font size="13"><b>DEBITOS</b>', 118, 0.0, True)
					),
					)

			elementos.append(('break',),)

			lista_debito = ['detail_alt']

			total_mes1 = 0
			total_perc1 = 0
			
			for d in temp:
				lista_debito.append([('%s' % d['conta_codigo'], 10, 0.0, True), ('%s' % d['conta_nome'], 36, 0.0, True),\
						('%s' % self.float2(d['valor1']), 12, 1.0, True), ('%s' % self.float1(d['perc1']), 6, 1.0, True)])
				
				if d.get('valor1'): 
					total_mes1 += d['valor1']
				
				if d.get('perc1'): 
					total_perc1 += d['perc1']

			elementos.append(lista_debito)

			elementos.append(
					(
					'detail',
					[('TOTAL DEBITOS', 47, 0.0, True),\
							('%s' % self.float2(total_mes1), 12, 1.0, True), ('%s' % self.float1(total_perc1), 6, 1.0, True)]
						),
					)

			elementos.append(
					(
					'table_footer',
					[('SUBTOTAL', 47, 0.0, True),\
							('%s' % self.float2(temp[0]['subtotal1']), 12, 1.0, True), ('', 6, 0.0, True)]
					),
				)

		#############################################################
		temp = dados['obras']

		if temp:
			elementos.append(
					(
						'text',
					('<font size="13"><b>OBRAS</b></font>', 118, 0.0, True)
					),
					)

			elementos.append(('break',),)
	
			lista_obra = ['detail_alt']

			total_mes1 = 0
			total_perc1 = 0

			for d in temp:
				lista_obra.append([('%s' % d['conta_codigo'], 10, 0.0, True), ('%s' % d['conta_nome'], 36, 0.0, True),\
						('%s' % self.float2(d['valor1']), 12, 1.0, True), ('%s' % self.float1(d['perc1']), 6, 1.0, True)])
				
				if d.get('valor1'): 
					total_mes1 += d['valor1']
			
				if d.get('perc1'): 
					total_perc1 += d['perc1']

			elementos.append(lista_obra)

			elementos.append(
				(
					'detail',
					[('TOTAL OBRAS', 47, 0.0, True),\
							('%s' % self.float2(total_mes1), 12, 1.0, True), ('%s' % self.float1(total_perc1), 6, 1.0, True)]
						),
				)

			elementos.append(
				(
					'table_footer',					
					[('SUBTOTAL', 47, 0.0, True),\
							('%s' % self.float2(temp[0]['subtotal1']), 12, 1.0, True), ('', 6, 0.0, True)]
					),
				)

		#############################################################
		temp = dados['dc']

		if temp:
			elementos.append(
					(
						'text',
					('<font size="13"><b>D/C</b></font>', 118, 0.0, True)
					),
					)

			elementos.append(('break',),)

			lista_dc = ['detail_alt']

			total_mes1 = 0
			total_perc1 = 0

			for d in temp:
				lista_dc.append([('%s' % d['conta_codigo'], 10, 0.0, True), ('%s' % d['conta_nome'], 36, 0.0, True),\
						('%s' % self.float2(d['valor1']), 12, 1.0, True), ('%s' % self.float1(d['perc1']), 6, 1.0, True)])
			
				if d['pai'] != 't':
					if d.get('valor1'): 
						total_mes1 += d['valor1']
			
				if d.get('perc1'): 
					total_perc1 += d['perc1']

			elementos.append(lista_dc)

			elementos.append(
					(
					'detail',
					[('TOTAL D/C', 47, 0.0, True),\
							('%s' % self.float2(total_mes1), 12, 1.0, True), ('%s' % self.float1(total_perc1), 6, 1.0, True)]
					),
				)
			elementos.append(
					(
					'table_footer',
					[('SUBTOTAL', 47, 0.0, True),\
							('%s' % self.float2(temp[0]['subtotal1']), 12, 1.0, True), ('', 6, 0.0, True)]
					),
				)

		#############################################################
		temp = dados['saldos']

		if temp:

			elementos.append(
					(
						'text',
					('<font size="13"><b>SALDOS</b></font>', 118, 0.0, True)
					),
					)

			elementos.append(('break',),)

			elementos.append(
					(
					'detail',
					[('ANTERIOR', 47, 0.0, True),\
							('%s' % self.float2(temp[0]['anterior1']), 12, 1.0, True), ('', 6, 1.0, True)],
					[('ATUAL', 47, 0.0, True),\
							('%s' % self.float2(temp[0]['atual1']), 12, 1.0, True), ('', 6, 1.0, True)]
					),
				)
					
			elementos.append(
					(
					'detail',
					[('OPERACIONAL', 47, 0.0, True),\
							('%s' % self.float2(temp[0]['operacional1']), 12, 1.0, True), ('', 6, 0.0, True)],
					[('GALONAGEM', 47, 0.0, True),\
							('%s' % self.float2(temp[0]['galona1']), 12, 1.0, True), ('', 6, 1.0, True)],
					[('OPERACIONAL', 47, 0.0, True),\
							('%s' % self.float2(((temp[0]['operacional1'] or 0) + temp[0]['galona1'])), 12, 1.0, True), ('', 6, 1.0, True)]				
					),
				)

		#############################################################
		
		R = RelatorioPDF(titulo='%s' % ('EMPRESA: ' + md['empresa_nome']), autor='FLUXO MENSAL DE CAIXAS',\
				mode="raw", subtitulos=['%s' % ('DATA REFERÊNCIA: ' + TDate.format(md['data_ref']))])
		R.render(elementos)
