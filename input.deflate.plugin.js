/* 
 Copyright 2010 - Prefeitura Municipal de Fortaleza

 Este arquivo � parte do programa jquery-input-deflate-plugin

 O A��o � um software livre; voc� pode redistribui-lo e/ou modifica-lo
 dentro dos termos da Licen�a P�blica Geral GNU como publicada pela
 Funda��o do Software Livre (FSF); na vers�o 2 da Licen�a.

 Este programa � distribuido na esperan�a que possa ser util, mas SEM
 NENHUMA GARANTIA; sem uma garantia implicita de ADEQUA��O a qualquer
 MERCADO ou APLICA��O EM PARTICULAR. Veja a Licen�a P�blica Geral GNU
 para maiores detalhes.

 Voc� deve ter recebido uma c�pia da Licen�a P�blica Geral GNU, sob o
 t�tulo "LICENCA.txt", junto com este programa, se n�o, escreva para a
 Funda��o do Software Livre(FSF) Inc., 51 Franklin St, Fifth Floor,
 */
(function($){
	$.fn.inputDeflate = function (options) {
		var suffix = options['suffix'] || '_input_deflate'; 
		var removeClass = options['removeClass'];
		var addClass = options['addClass'];
		var inflate = options['inflate'];
		var deflate = options['deflate'];
		if (!inflate || !deflate)
			throw("Inflate and deflate functions are mandatory");
		return this.each(function() {
			// elemento selecionado...
			var este = $(this);
			// primeiro precisamos criar um clone do elemento
			var clone2 = este.clone();
			
			// entao sobrescrevemos o id e o name com o sufixo
			if (clone2.attr('id'))
				clone2.attr('id', este.attr('id') + suffix);
			if (clone2.attr('name'))
				clone2.attr('name', este.attr('id') + suffix);

			// geramos o valor do input novo com o resultado do inflate
			var value = este.val();
			clone2.val(inflate(value));
			
			// associamos o onChange do segundo para atualizar o primeiro
			clone2.change(function(){
                            var element = este;
                            element.val(deflate(clone2.val()));
			});

			if (addClass)
				clone2.addClass(addClass);
			if (removeClass)
				clone2.removeClass(removeClass);
				
			// agora adicionamos o segundo elemento
			este.after(clone2);

			// e entao substituimos o original pelo seu clone de outro tipo
			// precisamos fazer assim porque o IE n�o aceita sobrescrever o type,
			// mesmo quando n�o est� associado � DOM
			este.replaceWith('<input type="hidden" name="'+este.attr('name')+'" id="'+este.attr('id')+'">');
			este = $('#' + este.attr('id'));
			este.val(value);
			
		});
	};
})(jQuery);