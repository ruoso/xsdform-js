/*
  # Copyright 2010 - Prefeitura Municipal de Fortaleza
  #
  # Este arquivo é parte do programa xsdform-js
  #
  # O xsdform-js é um software livre; você pode redistribui-lo e/ou
  # modifica-lo dentro dos termos da Licença Pública Geral GNU como
  # publicada pela Fundação do Software Livre (FSF); na versão 2 da
  # Licença.
  #
  # Este programa é distribuido na esperança que possa ser util, mas SEM
  # NENHUMA GARANTIA; sem uma garantia implicita de ADEQUAÇÂO a qualquer
  # MERCADO ou APLICAÇÃO EM PARTICULAR. Veja a Licença Pública Geral GNU
  # para maiores detalhes.
  #
  # Você deve ter recebido uma cópia da Licença Pública Geral GNU, sob o
  # título "LICENCA.txt", junto com este programa, se não, escreva para a
  # Fundação do Software Livre(FSF) Inc., 51 Franklin St, Fifth Floor,
*/
function convert_decimal_ptbr2xsd(valor){
    if(valor === "") return '';
    while (valor.indexOf('.', 0) != -1)
       valor = valor.replace(".","");
    valor = valor.replace(",",".");
    valor = parseFloat(valor);
    return valor;
}

function convert_decimal_xsd2ptbr(valor){
    if(valor === "") return '';
    var inteiro = null, decimal = null, c = null, j = null;
    var aux = new Array();
    valor = ""+valor;
    c = valor.indexOf(".",0);
    //encontrou o ponto na string
    if(c > 0){
        //separa as partes em inteiro e decimal
        inteiro = valor.substring(0,c);
        decimal = valor.substring(c+1,valor.length);
    }else{
        inteiro = valor;
    }

    //pega a parte inteiro de 3 em 3 partes
    for (j = inteiro.length, c = 0; j > 0; j-=3, c++){
        aux[c]=inteiro.substring(j-3,j);
    }

    //percorre a string acrescentando os pontos
    inteiro = "";
    for(c = aux.length-1; c >= 0; c--){
        inteiro += aux[c]+'.';
    }
    //retirando o ultimo ponto e finalizando a parte inteiro

    inteiro = inteiro.substring(0,inteiro.length-1) || "0";

    decimal = parseInt(decimal);
    if(isNaN(decimal)){
        decimal = "00";
    }else{
        decimal = ""+decimal;
        if(decimal.length === 1){
            decimal = decimal+"0";
        }
    }


    valor = inteiro+","+decimal;

    if (valor = '0,00') {
        valor = '';
    }
    return valor;

}
/**
 * Converte a data do formato iso para o formato brasileiro
 */
function convert_date_xsd2ptbr(date) {
    if(date === "") return '';
    var ano;
    var mes;
    var dia;
    var dateReturn;

    ano = date.substring(0,4);
    mes = date.substring(5,7);
    dia = date.substring(8,10);

    dateReturn = dia+'/'+mes+'/'+ano;
    return dateReturn;
}
/**
 * Converte a data do formato brasileiro para o formato iso
 */
function convert_date_ptbr2xsd(date) {
    if(date === "") return '';
    var ano;
    var mes;
    var dia;
    var dateReturn;

    dia = date.substring(0,2);
    mes = date.substring(3,5);
    ano = date.substring(6,10);
    
    dateReturn = ano+'-'+mes+'-'+dia;
    return dateReturn;
}
/**
 * Converte data e hora do formato iso para o formato brasileiro
 */
function convert_dateTime_xsd2ptbr(dateTime) {
    if(dateTime === '') return '';
    var ano;
    var mes;
    var dia;
    var hora;
    var minuto;
    var segundo;
    var dateTimeReturn;

    ano     = dateTime.substring(0,4);
    mes     = dateTime.substring(5,7);
    dia     = dateTime.substring(8,10);
    hora    = dateTime.substring(11,13);
    minuto  = dateTime.substring(14,16);
    segundo = dateTime.substring(17,19);

    dateTimeReturn = dia+'/'+mes+'/'+ano+' '+hora+':'+minuto+':'+segundo;
    
    return dateTimeReturn;
}

/**
 * Converte data e hora do formato brasileiro para o formato iso
 */
function convert_dateTime_ptbr2xsd(dateTime) {
    if(dateTime === '') return '';
    var ano;
    var mes;
    var dia;
    var hora;
    var minuto;
    var segundo;
    var dateTimeReturn;

    dia = date.substring(0,2);
    mes = date.substring(3,5);
    ano = date.substring(6,10);
    hora    = dateTime.substring(11,13);
    minuto  = dateTime.substring(14,16);
    segundo = dateTime.substring(17,19);

    dateTimeReturn = ano+'-'+mes+'-'+dia+'T'+hora+':'+minuto+':'+segundo;

    return dateTimeReturn;
}
/**
 * Converte float do formato do xsd para o formato brasileiro
 */
function convert_float_xsd2ptbr(floatValue) {
    var integerPart;
    var decimalPart;
    var count = 0;
    var arrayValues = new Array();
    var arrayIntPart = new Array();
    var floatReturn = '';

    arrayValues = floatValue.split('.');
    integerPart = arrayValues[0];
    arrayIntPart = arrayValues[0].split('');
    decimalPart = arrayValues[1];
    for (x = arrayIntPart.length-1;x>=0;x--) {
        count++;
        if(count == 4) {
            floatReturn = arrayIntPart[x]+'.'+floatReturn;
            count = 1;
        } else {
            floatReturn = arrayIntPart[x]+floatReturn;
        }
    }

    floatReturn = decimalPart != null ? floatReturn+','+decimalPart : floatReturn;
    return floatReturn;

}
/**
 *  Converte float do formato brasileiro para o formato xsd
 */
function convert_float_ptbr2xsd(floatValue) {
    while (floatValue.indexOf('.', 0) != -1)
       floatValue = floatValue.replace(".","");
    floatValue = floatValue.replace(",",".");
    floatValue = parseFloat(floatValue);
    return floatValue;
}

function generateXsdFormUI() {

    $('input.xsdForm__date').inputDeflate({
        inflate: convert_date_xsd2ptbr,
        deflate: convert_date_ptbr2xsd,
        addClass: 'inflated'
    });
    $('input.xsdForm__date.inflated').setMask('date');
    
    $('input.xsdForm__decimal').inputDeflate({
        inflate: convert_decimal_xsd2ptbr,
        deflate: convert_decimal_ptbr2xsd,
        addClass: 'inflated'
    });
    $('input.xsdForm__decimal.inflated').setMask({
        mask : '99,999.999.999.999.999.999.999.999.999.99',
        type : 'reverse'
    });
    
    $('input.xsdForm__dateTime').inputDeflate({
        inflate: convert_dateTime_xsd2ptbr,
        deflate: convert_dateTime_ptbr2xsd,
        addClass: 'inflated'
    });
    $('input.xsdForm__dateTime.inflated').setMask({
        mask : '39/19/9999 29:59:59'
    });

    $('input.xsdForm__float').inputDeflate({
        inflate: convert_float_xsd2ptbr,
        deflate: convert_float_ptbr2xsd,
        addClass: 'inflated'
    });
    $('input.xsdForm__float.inflated').regexMask('float-ptbr');

}