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

function createInput(type, name, id) {
    var newInput = document.createElement('input');
    newInput.type  = type;
    newInput.name  = name;
    newInput.setAttribute('maxlength', 255);
    newInput.id    = ( id != undefined )? id: name;
    return newInput;
}

function createTextArea(name, id) {
    var newTextArea = document.createElement('textarea');
    newTextArea.name  = name;
    newTextArea.id    = ( id != undefined )? id: name;
    return newTextArea;
}

function createLabel(innerHTML, idField) {
    var newLabel = document.createElement("label");
    newLabel.innerHTML = innerHTML;
    newLabel.htmlFor = idField;
    return newLabel;
}

function createDivError(innerHTML, name) {
    var div;
    div = document.createElement('div');
    div.setAttribute('name', name);
    div.setAttribute('style', 'color:red');
    div.innerHTML = innerHTML;
    return div;
}

function removeById(strId) {
    var elem = getById(strId);
    elem.parentNode.removeChild(elem);
}

function getById(strId) {
    return document.getElementById(strId);
}

function getByName(strId) {
    return document.getElementsByName(strId);
}

function docWrite(text) {
    document.write( text );
}

function docWriteBr(text) {
    document.write( text );
    document.write( '<br>' );
}

function xmlLoader(pathXML) {
    var loader;
    if (window.XMLHttpRequest) {
        var loader = new XMLHttpRequest();
        loader.open("GET", pathXML ,false);
        loader.send(null);
        loader = loader.responseXML;
    } else if(window.ActiveXObject) {
        // OBS: se o arquivo XML tiver acento da erro no I.E
        var loader = new ActiveXObject("Msxml2.DOMDocument.3.0");
        loader.async = false;
        loader.load(pathXML);
    }
    return loader;
}

function getNavigator() {
    var nav = navigator.appName.toLowerCase();
    if (nav.indexOf('internet explorer') != -1) {
        return 'IE';
    } else if (nav.indexOf('netscape') != -1) {
        return 'FF';
    } else if (nav.indexOf('opera') != -1) {
        return 'OP';
    } else {
        return 'notDefined';
    }
}
// Retorna o texto que esta no html da tag ou o valor do atributo value
function getText(xmlNode) {
    if ( getNavigator() == 'IE' ) {
        return xmlNode.firstChild.nodeValue;
    } else {
        return xmlNode.textContent;
    }
}
// Retorna a tag aninhada na posicao indicada pelo index
function getNodeByIndex(xmlNode,index) {
    if ( getNavigator() == 'IE' ) {
        return xmlNode.childNodes[index];
    } else {
        return xmlNode.children[index];
    }
}
// Retorna a tag filha de xmlNode que possui o nome igual a tagName
function getNodeByTagName(xmlNode,tagName) {
    var node = null;
    for (var i = 0; i < xmlNode.childNodes.length; i++) {
        if ( xmlNode.childNodes[i].nodeType == 1 ) {
            if ( xmlNode.childNodes[i].nodeName == tagName ) {
                node = xmlNode.childNodes[i];
                break;
            }
        }
    }
    return node;
}

function getTextByIndex(xmlNode,index) {
    return getText( getNodeByIndex(xmlNode,index) );
}

function getTextByTagName(xmlNode,tagName) {
    var node;
    for (var i = 0; i < xmlNode.childNodes.length; i++) {
        if ( xmlNode.childNodes[i].nodeType == 1 ) {
            if ( xmlNode.childNodes[i].nodeName == tagName ) {
                node = xmlNode.childNodes[i];
                break;
            }
        }
    }
    return getText(node);
}
// Retorna o atributo 'attributeName' do no xmlNode
function getValueAttributeByName(xmlNode,attributeName) {
    var text = null;
    for (var i = 0; i < xmlNode.attributes.length; i++) {
        if ( xmlNode.attributes[i].nodeName == attributeName ) {
            text = xmlNode.attributes[i].nodeValue;
            break;
        }
    }
    return text;
}
// Quantidade de nos na tag xmlNode numType deve ser sempre do tipo 1
function getQtdNode(xmlNode,numType) {
    var qtd = 0;
    for (var i = 0; i < xmlNode.childNodes.length; i++) {
        if ( xmlNode.childNodes[i].nodeType == numType ) {
            qtd++;
        }
    }
    return qtd;
}

function getQtdNodeByName(xmlNode,numType,tagName) {
    var qtd = 0;
    for (var i = 0; i < xmlNode.childNodes.length; i++) {
        if ( xmlNode.childNodes[i].nodeType == numType && xmlNode.childNodes[i].nodeName == tagName ) {
            qtd++;
        }
    }
    return qtd;
}

function static_type(type) {
    if ( type == "xs:string" ||
         type == "xs:float" ||
         type == "xs:integer" ||
         type == "xs:date" ||
         type == "xs:dateTime" ||
         type == "xs:boolean" ) {
        return true;
    } else {
        return false;
    }
}

function generateFormFromNode(tagRaiz, xmlNode, namePattern) {
    var label;
    var type = getValueAttributeByName(xmlNode, "type");
    var minOccurs = getValueAttributeByName(xmlNode, "minOccurs");
    if (type != null && static_type(type)) {
        return generateFormField(tagRaiz, xmlNode, type, namePattern, minOccurs);
    } else if (type != null) {
        // the definition is probably in the same schema.
        for (var i = 0; i < xmlNode.childNodes.length; i++) {
            if (xmlNode.childNodes[i].nodeType == 1 && xmlNode.childNodes[i].nodeName == 'xs:annotation' ) {
                label = getTextTagInAnnotationAppinfo(xmlNode.childNodes[i], 'xhtml:label', true);
                break;
            }
        }
        for (var i = 0; i < tagRaiz.childNodes.length; i++) {
            var inner = tagRaiz.childNodes[i];
            if (inner.nodeType == 1 && inner.nodeName == 'xs:complexType' &&
                getValueAttributeByName(inner, "name") == type) {
                return generateFormFromComplexTypeNode(tagRaiz, inner, namePattern, getValueAttributeByName(xmlNode, "name"), label );
            }
        }
    } else {
        // inline type definition
        for (var i = 0; i < xmlNode.childNodes.length; i++) {
            if (xmlNode.childNodes[i].nodeType == 1 && xmlNode.childNodes[i].nodeName == 'xs:annotation' ) {
                label = getTextTagInAnnotationAppinfo(xmlNode.childNodes[i], 'xhtml:label', true);

            } else if (xmlNode.childNodes[i].nodeType == 1 && xmlNode.childNodes[i].nodeName == 'xs:complexType') {
                return generateFormFromComplexTypeNode(tagRaiz, xmlNode.childNodes[i], namePattern, getValueAttributeByName(xmlNode, "name"), label );

            } else if (xmlNode.childNodes[i].nodeType == 1 && xmlNode.childNodes[i].nodeName == 'xs:simpleType') {
                return generateFormFromSimpleTypeNode(tagRaiz, xmlNode.childNodes[i], namePattern, getValueAttributeByName(xmlNode, "name"), label, minOccurs);

            }
        }
    }
}

function generateXmlFromNode(odoc, namespace, tagRaiz, xmlNode, namePattern) {
    var type = getValueAttributeByName(xmlNode, "type");
    var minOccurs = getValueAttributeByName(xmlNode, "minOccurs");
    if (type != null && static_type(type)) {
        // pre-defined types
        if (type == "xs:integer"  ||
            type == "xs:string"   ||
            type == "xs:dateTime" ||
            type == "xs:date"     ||
            type == "xs:float") {
            return generateXmlFromSimpleTextNode(odoc, namespace, tagRaiz, xmlNode, namePattern);
        } else if ( type == "xs:boolean" ) {
            return generateXmlFromCheckboxTextNode(odoc, namespace, tagRaiz, xmlNode, namePattern);
        } else {
            //throw type + " not supported.";
        }
    } else if (type != null) {
        for (var i = 0; i < tagRaiz.childNodes.length; i++) {
            var inner = tagRaiz.childNodes[i];
            if (inner.nodeType == 1 && inner.nodeName == 'xs:complexType' &&
                getValueAttributeByName(inner, "name") == type) {
                return generateXmlFromComplexTypeNode(odoc, namespace, tagRaiz, inner, namePattern, getValueAttributeByName(xmlNode, "name"));
            }
        }
    } else {
        // inline type definition
        for (var i = 0; i < xmlNode.childNodes.length; i++) {
            if (xmlNode.childNodes[i].nodeType == 1 && xmlNode.childNodes[i].nodeName == 'xs:complexType') {
                return generateXmlFromComplexTypeNode(odoc, namespace, tagRaiz, xmlNode.childNodes[i], namePattern, getValueAttributeByName(xmlNode, "name"));
            } else if (xmlNode.childNodes[i].nodeType == 1 && xmlNode.childNodes[i].nodeName == 'xs:simpleType') {
                return generateXmlFromSimpleTypeNode(odoc, namespace, tagRaiz, namePattern, getValueAttributeByName(xmlNode, "name"), minOccurs);
            }
        }
    }
}

function generateFormFromComplexTypeNode(tagRaiz, xmlNode, namePattern, name, label) {
    // gerar o fieldset com o legend e os conteudos...

    var legend = document.createElement('legend');
    legend.innerHTML = label;

    var fieldset = document.createElement('fieldset');
    fieldset.appendChild(legend);

    var dl = document.createElement('dl');

    for (var i = 0; i < xmlNode.childNodes.length; i++) {
        var el = xmlNode.childNodes[i];
        if (el.nodeType == 1 && el.nodeName == 'xs:sequence') {
            for (var j = 0; j < el.childNodes.length; j++) {
                if (el.childNodes[j].nodeType == 1 && el.childNodes[j].nodeName == "xs:element") {
                    var elHtml = generateFormFromNode(tagRaiz, el.childNodes[j], namePattern + "__" + name);
                    if (elHtml) {
                        dl.appendChild(elHtml);
                        fieldset.appendChild(dl);
                    }
                }
            }
        } else if (el.nodeType == 1 && el.nodeName == 'xs:choice') {
            //throw "xs:choice not supported";
        }
    }

    return fieldset;

}

function generateXmlFromComplexTypeNode(odoc, namespace, tagRaiz, xmlNode, namePattern, name) {
    // gerar o fieldset com o legend e os conteudos...

    var tag = odoc.createElementNS(namespace, name);


    for (var i = 0; i < xmlNode.childNodes.length; i++) {
        var el = xmlNode.childNodes[i];
        if (el.nodeType == 1 && el.nodeName == 'xs:sequence') {
            for (var j = 0; j < el.childNodes.length; j++) {
                if (el.childNodes[j].nodeType == 1 && el.childNodes[j].nodeName == "xs:element") {
                    var elHtml = generateXmlFromNode(odoc, namespace, tagRaiz, el.childNodes[j], namePattern + "__" + name);
                    if (elHtml) {
                        tag.appendChild(elHtml);
                    }
                }
            }
        } else if (el.nodeType == 1 && el.nodeName == 'xs:choice') {
            //throw "xs:choice not supported";
        }
    }

    return tag;

}

function generateFormFromSimpleTypeNode(tagRaiz, xmlNode, namePattern, name, label, minOccurs) {

    var restrictionNode = getNodeByTagName(xmlNode, 'xs:restriction');

    for (var i = 0; i < restrictionNode.childNodes.length; i++) {
        if (restrictionNode.childNodes[i].nodeType == 1 && restrictionNode.childNodes[i].nodeName == 'xs:enumeration'  ) {
            return generateFormFromSimpleTypeNodeRestrictionEnumeration(tagRaiz, xmlNode, namePattern, name, label, minOccurs);
        } else if (restrictionNode.childNodes[i].nodeType == 1 && restrictionNode.childNodes[i].nodeName == 'xs:maxLength'  ) {
            return generateFormFromSimpleTypeNodeRestrictionMaxLength(tagRaiz, xmlNode, namePattern, name, label, minOccurs);
        }
    }
}

function generateFormFromSimpleTypeNodeRestrictionEnumeration(tagRaiz, xmlNode, namePattern, name, label, minOccurs){
    var inputName = namePattern + "__" + name;
    var divValidation = document.createElement('div');
    divValidation.setAttribute('name', 'xsdFormValidation')

    var frag = document.createDocumentFragment();
    var dt = document.createElement('dt');
    var dd = document.createElement('dd');

    var divRequiredField = document.createElement('div');
    divRequiredField.setAttribute('name', 'requiredField')
    divRequiredField.setAttribute('style', 'display:none;')

    var required = ( minOccurs == '0' )? 'false': 'true';
    divRequiredField.appendChild( document.createTextNode( required ) );

    var newSelect = document.createElement('select');
    newSelect.name  = inputName;
    newSelect.id    = inputName;
    dd.appendChild(newSelect);

    var restrictionNode = getNodeByTagName(xmlNode, 'xs:restriction');

    var newOption;
    newOption = document.createElement("option");
    newOption.innerHTML = '';
    newSelect.appendChild(newOption);
    for (var i = 0; i < restrictionNode.childNodes.length; i++) {
        if (restrictionNode.childNodes[i].nodeType == 1 && restrictionNode.childNodes[i].nodeName == 'xs:enumeration'  ) {
            newOption = document.createElement("option");
            newOption.innerHTML = getValueAttributeByName(restrictionNode.childNodes[i], 'value');
            newSelect.appendChild(newOption);
        }
    }

    var newLabel = document.createElement("label");
    newLabel.innerHTML = label + ':';
    newLabel.htmlFor = inputName;

    dt.appendChild(newLabel);

    divValidation.appendChild(newSelect);
    divValidation.appendChild(divRequiredField);

    dd.appendChild(divValidation);
    dt.appendChild(newLabel);
    frag.appendChild(dt);
    frag.appendChild(dd);

    return frag;
}

function generateFormFromSimpleTypeNodeRestrictionMaxLength(tagRaiz, xmlNode, namePattern, name, label, minOccurs){
    var inputName = namePattern + "__" + name;

    var divValidation = document.createElement('div');
    divValidation.setAttribute('name', 'xsdFormValidation')
     
    var divRequiredField = document.createElement('div');
    divRequiredField.setAttribute('name', 'requiredField')
    divRequiredField.setAttribute('style', 'display:none;')

    var required = ( minOccurs == '0' )? 'false': 'true';
    divRequiredField.appendChild( document.createTextNode( required ) );
    divValidation.appendChild(createInput('text' ,inputName, inputName));
    divValidation.appendChild(divRequiredField);

    var newLabel = document.createElement("label");
    newLabel.innerHTML = label + ':';
    newLabel.htmlFor = inputName;

    var dt = document.createElement('dt');
    var dd = document.createElement('dd');
    dt.appendChild(newLabel);
    dd.appendChild(divValidation);

    var frag = document.createDocumentFragment();
    frag.appendChild(dt);
    frag.appendChild(dd);
    return frag;
}


function generateXmlFromSimpleTypeNode(odoc, namespace, tagRaiz, namePattern, name, minOccurs) {

    var inputName = namePattern + "__" + name;
    var valueField = getById(inputName).value;

    if ( minOccurs != '0' || valueField != '' ) {
        var tag = odoc.createElementNS(namespace, name);
        var content = odoc.createTextNode( valueField );
        tag.appendChild(content);
        return tag;
    } else if ( minOccurs == '0' ) {
        return false;
    }

}

function getTextTagInAnnotationAppinfo(xmlNode, strTag, annotation) {

    var xmlNodeAux;
    if ( annotation == undefined ) {
        for (var i = 0; i < xmlNode.childNodes.length; i++) {
            if (xmlNode.childNodes[i].nodeType == 1 && xmlNode.childNodes[i].nodeName == 'xs:annotation' ) {
                xmlNodeAux = getNodeByTagName(xmlNode.childNodes[i], "xs:appinfo");
                break;
            }
        }
    } else if ( annotation == true ) {
        xmlNodeAux = getNodeByTagName(xmlNode, "xs:appinfo");
    }
    return getTextByTagName(xmlNodeAux, strTag);
}

function generateXmlFromSimpleTextNode(odoc, namespace, tagRaiz, xmlNode, namePattern) {

    var name = getValueAttributeByName(xmlNode, "name");
    var minOccurs = getValueAttributeByName(xmlNode, "minOccurs");
    var inputName = namePattern + "__" + name;
    var valueField = getById(inputName).value;

    if ( minOccurs != '0' || valueField != '' ) {
        var tag = odoc.createElementNS(namespace, name);
        var content = odoc.createTextNode( valueField );
        tag.appendChild(content);
        return tag;
    } else if ( minOccurs == '0' ) {
        return false;
    }

}

function generateXmlFromCheckboxTextNode(odoc, namespace, tagRaiz, xmlNode, namePattern) {

    var name = getValueAttributeByName(xmlNode, "name");
    var inputName = namePattern + "__" + name;

    var tag = odoc.createElementNS(namespace, name);
    var content;
    if (getById(inputName).checked) {
        content = odoc.createTextNode("true");
    } else {
        content = odoc.createTextNode("false");
    }
    tag.appendChild(content);

    return tag;
}

function generateForm(xsdFile,containerId) {
    try {

        //carrega o xml
        var xml = xmlLoader(xsdFile);
        var tagRaiz  = xml.getElementsByTagName('xs:schema')[0];
        var elemRoot = getNodeByTagName(tagRaiz, 'xs:element'); // elemento raiz
        var elHtml = generateFormFromNode(tagRaiz, elemRoot, "xsdform___");
        getById(containerId).appendChild( elHtml );

    } catch (myError) {
        alert( myError.name + ': ' + myError.message + "\n" + myError);
    }
}

function generateXml(xsdFile, input_to_set) {

    var divParent;
    var field;
    var requiredField;
    var div;
    var divMessageError;
    var messageError;
    var submitForm = true;
    var type;
    var firstFieldError = null;

    var arrDivsValidation = getByName('xsdFormValidation');

    this.setFirstFieldError = function(field) {
        if ( firstFieldError == null ) {
            firstFieldError = field;
        }
    }

    for (var i = 0; i < arrDivsValidation.length; i++) {
        divParent = arrDivsValidation[i];
        messageError = false;

        // percorre a div que contem o campo
        for (var j = 0; j < divParent.childNodes.length; j++) {

            if ( divParent.childNodes[j].nodeName == 'INPUT' || divParent.childNodes[j].nodeName == 'TEXTAREA') {
                field = divParent.childNodes[j];

            } else if ( divParent.childNodes[j].nodeName == 'DIV' && getValueAttributeByName(divParent.childNodes[j], 'name' ) == 'requiredField' ) {
                requiredField = divParent.childNodes[j].innerHTML;

            } else if ( divParent.childNodes[j].nodeName == 'DIV' && getValueAttributeByName(divParent.childNodes[j], 'name' ) == 'messageError' ) {
                messageError = true;
                divMessageError = divParent.childNodes[j];

            } else if ( divParent.childNodes[j].nodeName == 'DIV' && getValueAttributeByName(divParent.childNodes[j], 'name' ) == 'type' ) {
                type = divParent.childNodes[j].innerHTML;

            } else if ( divParent.childNodes[j].nodeName == 'SELECT' ) {
                field = divParent.childNodes[j];

            }

        }


        if ( requiredField == 'true' ) {
            if ( field.nodeName == 'INPUT' || field.nodeName == 'TEXTAREA') {
                if ( messageError ) {
                    if ( field.value == '' ) {
                        submitForm = false;
                        this.setFirstFieldError(field);
                    } else {
                        divMessageError.parentNode.removeChild( divMessageError );
                    }
                } else if ( field.value == '' ) {
                    div = createDivError('campo obrigatório.', 'messageError');
                    divParent.appendChild(div);
                    submitForm = false;
                    this.setFirstFieldError(field);
                }
            } else if ( field.nodeName == 'SELECT' ) {
                if ( messageError ) {
                    if ( field.options[field.selectedIndex].text == '' ) {
                        submitForm = false;
                        this.setFirstFieldError(field);
                    } else {
                        divMessageError.parentNode.removeChild( divMessageError );
                    }
                } else if ( field.options[field.selectedIndex].text == '' ) {
                    div = createDivError('campo obrigatório.', 'messageError');
                    divParent.appendChild(div);
                    submitForm = false;
                    this.setFirstFieldError(field);
                }
            }
        }

        if ( type == 'xs:date' && !validateDateField(field) ) {
            this.setFirstFieldError(field);
            submitForm = false;
        } else if ( type == 'xs:dateTime' && !validateDateTimeField(field) ) {
            this.setFirstFieldError(field);
            submitForm = false;
        } else if ( type == 'xs:float' && !validateFloatField(field) ) {
            this.setFirstFieldError(field);
            submitForm = false;
        }

    }

    if ( submitForm == false ) {
        alert('Dados inconsistentes.');
        firstFieldError.focus();
        return false;
    }

    try {
        var xml = xmlLoader(xsdFile);
        var tagRaiz  = xml.getElementsByTagName('xs:schema')[0];
        var elemRoot = getNodeByTagName(tagRaiz, 'xs:element'); // elemento raiz
        // adicionar xmlns="..." de acordo com o atributo 'targetNamespace' do
	// xml schema.
        var namespace = getValueAttributeByName(tagRaiz,'targetNamespace');
	//window.alert('namespace is ' + namespace)	
        var odoc = document.implementation.createDocument("", "", null);
        var generated = generateXmlFromNode(odoc, namespace, tagRaiz, elemRoot, "xsdform___");

        odoc.appendChild(generated);
        input_to_set.value = ((new XMLSerializer()).serializeToString(odoc));


    } catch (myError) {
        alert( myError.name + ': ' + myError.message + "\n" + myError);
    }
}

function integerField(obj) {
    var expRegNumInt = /^\d+$/; // só números

    if ( !expRegNumInt.test(obj.value) ) {
        obj.value = obj.value.substr(0, (obj.value.length - 1));
    }
    obj.focus();
}

function validateDate(objInputText) {
    if (objInputText.value != "") {
        var dia = parseInt( objInputText.value.substring(8,10), 10 );
        var mes = parseInt( objInputText.value.substring(5,7), 10 );
        var ano = parseInt( objInputText.value.substring(0,4), 10 );

        var DateVal = mes + "/" + dia + "/" + ano;
        var date = new Date(DateVal);
        var mesValid = (mes - 1); // o metodo getMonth retorna o mes porem janeiro é zero

        if ( date.getDate() != dia ) {
            return false;
        } else if ( date.getMonth() != mesValid ) {
            return false;
        } else if ( date.getFullYear() != ano ) {
            return false;
        }
        return true;
    } else {
        return true;
    }
}

function validateDateTime(pObj) {
    if (pObj.value != "") {
        var dia = parseInt( pObj.value.substring(8,10), 10 );
        var mes = parseInt( pObj.value.substring(5,7), 10 );
        var ano = parseInt( pObj.value.substring(0,4), 10 );

        var hora = parseInt( pObj.value.substring(11,13), 10 );
        var minuto = parseInt( pObj.value.substring(14,16), 10 );
        var segundo = parseInt( pObj.value.substring(17,19), 10 );

        var DateVal = mes + "/" + dia + "/" + ano + ' ' + hora + ':' + minuto + ':' + segundo;
        var date = new Date(DateVal);
        var mesValid = (mes - 1); // o metodo getMonth retorna o mes porem janeiro é zero

        if ( date.getDate() != dia ) {
            return false;
        } else if ( date.getMonth() != mesValid ) {
            return false;
        } else if ( date.getFullYear() != ano ) {
            return false;
        } else if ( date.getHours() != hora ) {
            return false;
        } else if ( date.getHours() != hora ) {
            return false;
        } else if ( date.getMinutes() != minuto ) {
            return false;
        } else if ( date.getSeconds() != segundo ) {
            return false;
        }
        return true;
    } else {
        return true;
    }
}

function validateFloat(pObj) {
    var expRegNumInt = /^\d+(\.\d+)?$/; // float
    if (pObj.value != "") {
        if (!expRegNumInt.test(pObj.value)) {
            return false;
        } else {
            return true;
        }
    } else {
        return true;
    }
}

function mascaraData(objFieldDate, evt) {
    var expRegNumInt = /^\d+$/; // só números

    if ( !expRegNumInt.test( onlyNumbersDateTime( objFieldDate.value ) ) ) {
        objFieldDate.value = objFieldDate.value.substr(0, (objFieldDate.value.length - 1));
        return false;
    }

    evt = (evt) ? evt : ((window.event) ? event : null);
    if (evt.keyCode != 8 && evt.keyCode != 46) {
        objFieldDate.value = formatDate(objFieldDate.value);
        return true;
    }
}

function onlyNumbersDateTime(str) {
    var expRegTrim = /:|-|T/g;
    return str.replace(expRegTrim, '');
}

function formatDateTime(strDate) {
    if (strDate.length == 4 || strDate.length == 7 ) {
        strDate += '-';
    } else if ( strDate.length == 10 ) {
        strDate += 'T';
    } else if ( strDate.length == 13 || strDate.length == 16 ) {
        strDate += ':';
    }
    return strDate;
}

function formatDate(strDate) {
    if (strDate.length == 4 || strDate.length == 7 ) {
        strDate += '-';
    }
    return strDate;
}

function mascaraDateTime(objFieldDate, evt) {
    var date = objFieldDate.value;
    var expRegNumInt = /^\d+$/; // só números

    if ( !expRegNumInt.test( onlyNumbersDateTime( objFieldDate.value ) ) ) {
        objFieldDate.value = objFieldDate.value.substr(0, (objFieldDate.value.length - 1));
        return false;
    }

    evt = (evt) ? evt : ((window.event) ? event : null);
    if (evt.keyCode != 8 && evt.keyCode != 46) {
        objFieldDate.value = formatDateTime(date);
        return true;
    }
}

function validateDateField(obj) {
    if ( !validateDate(obj) ) {

        if ( getById('fieldDate__' + obj.id) == null ) {
            var div = createDivError('Data Inválida.');
            div.id = 'fieldDate__' + obj.id;

            var containerField = obj.parentNode;
            containerField.appendChild( div );
        } else {
            div = getById('fieldDate__' + obj.id);
        }
        return false;

    } else {
        try {
            removeById('fieldDate__' + obj.id);
        } catch (obgError) {
        }
        return true;

    }
}

function validateDateTimeField(obj) {
    if ( !validateDateTime(obj) ) {

        if ( getById('fieldDate__' + obj.id) == null ) {
            var div = createDivError('Data e/ou Hora Inválida(s).');
            div.id = 'fieldDate__' + obj.id;

            var containerField = obj.parentNode;
            containerField.appendChild( div );
        } else {
            div = getById('fieldDate__' + obj.id);
        }
        return false;

    } else {
        try {
            removeById('fieldDate__' + obj.id);
        } catch (obgError) {
        }
        return true;
    }
}

function validateFloatField(obj) {
    if ( !validateFloat(obj) ) {

        if ( getById('fieldFloat__' + obj.id) == null ) {
            var div = createDivError('Valor inválido.');
            div.id = 'fieldFloat__' + obj.id;
            

            var containerField = obj.parentNode;
            containerField.appendChild( div );
        } else {
            div = getById('fieldFloat__' + obj.id);
        }
        return false;

    } else {
        try {
            removeById('fieldFloat__' + obj.id);
        } catch (obgError) {
        }
        return true;
    }
}

function onlyNumbersFloat(str) {
    var expRegTrim = /\./g;
    return str.replace(expRegTrim, '');
}

function floatField(obj) {
    //var expText = /[a-zA-Z]|,|ç/; // texto
    var expText = /\d|\./;
    var caractere;
    for (var i = 0 ; i < obj.value.length ; i++) {
        caractere = obj.value.charAt(i);
        if (!expText.test(caractere)) {
            obj.value = obj.value.replace(caractere,'');
        }
    }
    obj.focus();
}

function formatCurrency(o, n, dig, dec) {
    new function(c, dig, dec, m){
        addEvent(o, "keypress", function(e, _){
                if((_ = e.key == 45) || e.key > 47 && e.key < 58){
                    var o = this, d = 0, n, s, h = o.value.charAt(0) == "-" ? "-" : "",
                        l = (s = (o.value.replace(/^(-?)0+/g, "$1") + String.fromCharCode(e.key)).replace(/\D/g, "")).length;
                    m + 1 && (o.maxLength = m + (d = o.value.length - l + 1));
                    if(m + 1 && l >= m && !_) return false;
                    l <= (n = c) && (s = new Array(n - l + 2).join("0") + s);
                    for(var i = (l = (s = s.split("")).length) - n; (i -= 3) > 0; s[i - 1] += dig);
                    n && n < l && (s[l - ++n] += dec);
                    _ ? h ? m + 1 && (o.maxLength = m + d) : s[0] = "-" + s[0] : s[0] = h + s[0];
                    o.value = s.join("");
                }
                e.key > 30 && e.preventDefault();
            });
    }(!isNaN(n) ? Math.abs(n) : 2, typeof dig != "string" ? "." : dig, typeof dec != "string" ? "," : dec, o.maxLength);
}

function createFieldString(name) {
    return createTextArea(name);
}

function createFieldFloat(name) {
    var field;
    field = createInput('text', name);
    //field.setAttribute('onkeypress','floatField(this);bloquearTexto(event)');
    field.setAttribute('onkeypress','return validaCampoNumerico(event,"float");');
    //field.setAttribute('onkeyup','floatField(this);');
    field.setAttribute('onblur', 'validateFloatField(this,event);');
    return field;
}

function createFieldInteger(name) {
    var field;
    field = createInput('text', name);
    //field.setAttribute('onchange', 'integerField(this);');
    //field.setAttribute('onkeypress', 'integerField(this);');
    field.setAttribute('onkeypress','return validaCampoNumerico(event,"integer");');
    //field.setAttribute('onkeyup', 'integerField(this);');
    return field;
}

function createFieldDate(name) {
    var field;
    field = createInput('text', name);
    field.setAttribute('maxlength', '10');
    field.setAttribute('onkeypress', 'mascaraData(this, event);');
    field.setAttribute('onkeyup', 'mascaraData(this, event);');
    field.setAttribute('onblur', 'validateDateField(this,event);');
    return field;
}

function createFieldDateTime(name) {
    var field;
    field = createInput('text', name);
    field.setAttribute('maxlength', '19');
    field.setAttribute('onkeypress', 'mascaraDateTime(this,event);');
    field.setAttribute('onkeyup', 'mascaraDateTime(this,event);');
    field.setAttribute('onblur', 'validateDateTimeField(this);');
    return field;
}

function createFieldBoolean(name) {
    return createInput('checkbox', name);
}

function generateFormField(tagRaiz, xmlNode, type, namePattern, minOccurs) {

    var name = getValueAttributeByName(xmlNode, "name");
    var inputName = namePattern + "__" + name;

    var field;
    if ( type == "xs:string" ) {
        field = createFieldString(inputName);
    } else if ( type == "xs:float" ) {
        field = createFieldFloat(inputName);
    } else if ( type == "xs:integer" ) {
        field = createFieldInteger(inputName);
    } else if ( type == "xs:date" ) {
        field = createFieldDate(inputName);
    } else if ( type == "xs:dateTime" ) {
        field = createFieldDateTime(inputName);
    } else if ( type == "xs:boolean" ) {
        field = createFieldBoolean(inputName);
    } else {
        alert(type + ' - Unknown type!');
        return false;
    }

    var frag = document.createDocumentFragment();
    var dt = document.createElement('dt');
    var newLabel = createLabel(getTextTagInAnnotationAppinfo(xmlNode, 'xhtml:label') + ':', inputName);

    if ( type == "xs:boolean") {
        dt.setAttribute('class', 'dtsemdd');
        dt.appendChild(field);
        dt.appendChild(newLabel);
        frag.appendChild(dt);
    } else  {
        var dd = document.createElement('dd');

        var divValidation = document.createElement('div');
        divValidation.setAttribute('name', 'xsdFormValidation');

        var divRequiredField = document.createElement('div');
        divRequiredField.setAttribute('name', 'requiredField');
        divRequiredField.setAttribute('style', 'display:none;');

        var required = ( minOccurs == '0' )? 'false': 'true';
        divRequiredField.appendChild( document.createTextNode( required ) );

        var divType = document.createElement('div');
        divType.setAttribute('name', 'type');
        divType.setAttribute('style', 'display:none;');
        divType.appendChild( document.createTextNode( type ) );

        divValidation.appendChild(field);
        divValidation.appendChild(divRequiredField);
        divValidation.appendChild(divType);

        dd.appendChild(divValidation);
        dt.appendChild(newLabel);
        frag.appendChild(dt);
        frag.appendChild(dd);
    }
    return frag;
}
	
function fillValues(xmlFile) {
    try {
        var xml = xmlLoader(xmlFile);
        getFormFromNode("xsdform___", xml);
    } catch (myError) {
        alert( myError.name + ': ' + myError.message + "\n" + myError);
    }
}

function getFormFromNode(namePattern, xml) {

    var xmlNode;
    var name = "";

    for (var i = 0; i < xml.childNodes.length; i++) {
        xmlNode = xml;
        if (xml.childNodes[i].nodeType == 1) {
            xmlNode = getNodeByTagName(xmlNode,xml.childNodes[i].nodeName);
            name = namePattern + "__" + xmlNode.nodeName;
            if (xmlNode.childNodes.length > 1) {
                getFormFromNode(name, xmlNode);
            } else if (xmlNode.childNodes.length == 1) {
                insereValor(name,getText(xmlNode));
            }
        }
    }
}

function insereValor(nameField,valor) {
    if ((getById(nameField).nodeName == "INPUT" && getById(nameField).type == "text") || getById(nameField).nodeName == "SELECT" || getById(nameField).nodeName == "TEXTAREA") {
        getById(nameField).value = valor;
    } else if (getById(nameField).type == "checkbox") {
        if (valor == 1) {
            getById(nameField).checked = true;
        } else {
            getById(nameField).checked = false;
        }

    }
}

function validaCampoNumerico(objEvento, type) {
    var iKeyCode;

    if(objEvento.keyCode)
        {
            iKeyCode = objEvento.keyCode;
        }
    else if(objEvento.which)
        {
            iKeyCode = objEvento.which;
        }
    else if(objEvento.charCode)
        {
            iKeyCode = objEvento.charCode;
        }
    else
        {
            iKeyCode = void(0);
        }

    if (type == "float") {
        return validaFloat(iKeyCode);
    } else {
        return validaInteger(iKeyCode);
    }
}

function validaFloat(iKeyCode) {
    switch (iKeyCode) {
    case 48:
        return true;
    case 49:
        return true;
    case 50:
        return true;
    case 51:
        return true;
    case 52:
        return true;
    case 53:
        return true;
    case 54:
        return true;
    case 55:
        return true;
    case 56:
        return true;
    case 57:
        return true;
    case 46:
        return true;
    case 116:
        return true;
    case 8:
        return true;
    case 9:
        return true;
    default:
        return false;
    }
}

function validaInteger(iKeyCode) {
    switch (iKeyCode) {
    case 48:
        return true;
    case 49:
        return true;
    case 50:
        return true;
    case 51:
        return true;
    case 52:
        return true;
    case 53:
        return true;
    case 54:
        return true;
    case 55:
        return true;
    case 56:
        return true;
    case 57:
        return true;
    case 116:
        return true;
    case 8:
        return true;
    case 9:
        return true;
    default:
        return false;
    }
    return false;
}
