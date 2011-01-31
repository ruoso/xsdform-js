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

function createInput(type, name, id, maxlength) {
    var newInput = document.createElement('input');
    newInput.type  = type;
    newInput.name  = name;
    if (maxlength != null) {
        newInput.setAttribute('maxlength', maxlength);
    }
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
    var maxOccurs = getValueAttributeByName(xmlNode, "maxOccurs");
    if (minOccurs == null) {minOccurs = 1}
    if (type != null && static_type(type)) {
        return generateFormField(tagRaiz, xmlNode, type, namePattern, minOccurs, maxOccurs);
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
                return generateFormFromComplexTypeNode(tagRaiz, inner, namePattern, getValueAttributeByName(xmlNode, "name"), label, minOccurs, maxOccurs );
            }
        }
    } else {
        // inline type definition
        for (var i = 0; i < xmlNode.childNodes.length; i++) {
            if (xmlNode.childNodes[i].nodeType == 1 && xmlNode.childNodes[i].nodeName == 'xs:annotation' ) {
                label = getTextTagInAnnotationAppinfo(xmlNode.childNodes[i], 'xhtml:label', true);

            } else if (xmlNode.childNodes[i].nodeType == 1 && xmlNode.childNodes[i].nodeName == 'xs:complexType') {
                return generateFormFromComplexTypeNode(tagRaiz, xmlNode.childNodes[i], namePattern, getValueAttributeByName(xmlNode, "name"), label, minOccurs, maxOccurs );

            } else if (xmlNode.childNodes[i].nodeType == 1 && xmlNode.childNodes[i].nodeName == 'xs:simpleType') {
                return generateFormFromSimpleTypeNode(tagRaiz, xmlNode.childNodes[i], namePattern, getValueAttributeByName(xmlNode, "name"), label, minOccurs);

            }
        }
    }
}

function generateXmlFromNode(odoc, namespace, tagRaiz, xmlNode, namePattern) {
    var type = getValueAttributeByName(xmlNode, "type");
    var minOccurs = getValueAttributeByName(xmlNode, "minOccurs");
    var maxOccurs = getValueAttributeByName(xmlNode, "maxOccurs");
    if (minOccurs == null) {minOccurs = 1}
    if (type != null && static_type(type)) {
        if ( type == "xs:boolean" ) {
            return generateXmlFromCheckboxTextNode(odoc, namespace, tagRaiz, xmlNode, namePattern);
        } else {
            return generateXmlFromSimpleTextNode(odoc, namespace, tagRaiz, xmlNode, namePattern);
        }
    } else if (type != null) {
        for (var i = 0; i < tagRaiz.childNodes.length; i++) {
            var inner = tagRaiz.childNodes[i];
            if (inner.nodeType == 1 && inner.nodeName == 'xs:complexType' &&
                getValueAttributeByName(inner, "name") == type) {
                return generateXmlFromComplexTypeNode(odoc, namespace, tagRaiz, inner, namePattern, getValueAttributeByName(xmlNode, "name"), minOccurs, maxOccurs);
            }
        }
    } else {
        // inline type definition
        for (var i = 0; i < xmlNode.childNodes.length; i++) {
            if (xmlNode.childNodes[i].nodeType == 1 && xmlNode.childNodes[i].nodeName == 'xs:complexType') {
                return generateXmlFromComplexTypeNode(odoc, namespace, tagRaiz, xmlNode.childNodes[i], namePattern, getValueAttributeByName(xmlNode, "name"), minOccurs, maxOccurs);
            } else if (xmlNode.childNodes[i].nodeType == 1 && xmlNode.childNodes[i].nodeName == 'xs:simpleType') {
                return generateXmlFromSimpleTypeNode(odoc, namespace, tagRaiz, xmlNode.childNodes[i], namePattern, getValueAttributeByName(xmlNode, "name"), minOccurs, maxOccurs);
            }
        }
    }
}

function generateFormFromComplexTypeNode(tagRaiz, xmlNode, namePattern, name, label, minOccurs, maxOccurs) {
    // gerar o fieldset com o legend e os conteudos...

    if (maxOccurs != null && maxOccurs != "1") {
        // produzir a barra de repeticoes
        var divRepeat = document.createElement('fieldset');
        var divBarra  = document.createElement('span');
        var spanLabel = document.createElement('legend');
        spanLabel.innerHTML = label;
        var subnamePattern = namePattern +'__'+name;
        var buttonAdd = document.createElement('input');
        var buttonDel = document.createElement('input');
        buttonAdd.setAttribute('type', 'button');
        buttonAdd.setAttribute('value', '+');
        buttonDel.setAttribute('type', 'button');
        buttonDel.setAttribute('value', '-');
        divRepeat.setAttribute('id', subnamePattern);
        divBarra.setAttribute('id', subnamePattern+'__barra');
        divBarra.setAttribute('class', 'xsdForm__repeatBarra');
        divRepeat.setAttribute('class', 'xsdForm__repeat');
        divRepeat.appendChild(spanLabel);
        divBarra.appendChild(buttonDel);
        divBarra.appendChild(buttonAdd);
        spanLabel.appendChild(divBarra);

        var currentCount = 0;

        var refreshEnableDisable = function() {
            if (maxOccurs == "unbounded" || currentCount < maxOccurs) {
                buttonAdd.removeAttribute('disabled');
            } else {
                buttonAdd.setAttribute('disabled',true);
            }
            if (currentCount > minOccurs) {
                buttonDel.removeAttribute('disabled');
            } else {
                buttonDel.setAttribute('disabled',true);
            }
        }

        var getCurrentCount = function() {
            return currentCount;
        }
        divRepeat.xsdFormCurrentCount = getCurrentCount;

        var onclickAdd = function() {
            if (maxOccurs == "unbounded" || currentCount < maxOccurs) {
                var html = generateFormFromComplexTypeNodeNoRepeat(tagRaiz, xmlNode, namePattern+"__"+currentCount, name, "Item "+(currentCount+1));
                divRepeat.appendChild(html);
                currentCount++;
            }
            refreshEnableDisable();
        }
        buttonAdd.onclick = onclickAdd;
        divRepeat.addRepeat = onclickAdd;

        var onclickDel = function() {
            if (currentCount > minOccurs) {
                divRepeat.removeChild(divRepeat.childNodes[currentCount]);
                currentCount--;
            }
            refreshEnableDisable();
        }
        buttonDel.onclick = onclickDel;
        divRepeat.delRepeat = onclickDel;

        for (var i = 0; i < minOccurs; i++) {
            onclickAdd();
        }
        refreshEnableDisable();

        return divRepeat;
    } else {
        return generateFormFromComplexTypeNodeNoRepeat(tagRaiz, xmlNode, namePattern, name, label);
    }
}

function generateFormFromComplexTypeNodeNoRepeat(tagRaiz, xmlNode, namePattern, name, label) {
    // gerar o fieldset com o legend e os conteudos...
    var legend = document.createElement('legend');
    legend.innerHTML = label;

    var fieldset = document.createElement('fieldset');
    fieldset.setAttribute('id', namePattern+"__"+name);
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

function generateXmlFromComplexTypeNode(odoc, namespace, tagRaiz, xmlNode, namePattern, name, minOccurs, maxOccurs) {
    if (maxOccurs != null && maxOccurs != "1") {
        var id = namePattern+"__"+name;
        var divRepeat = getById(id);
        var count = divRepeat.xsdFormCurrentCount();
        var frag = odoc.createDocumentFragment();
        for (var i = 0; i < count; i++) {
            frag.appendChild(generateXmlFromComplexTypeNodeNoRepeat(odoc, namespace, tagRaiz, xmlNode, namePattern+"__"+i, name));
        }
        return frag;
    } else {
        return generateXmlFromComplexTypeNodeNoRepeat(odoc, namespace, tagRaiz, xmlNode, namePattern, name);
    }
}

function generateXmlFromComplexTypeNodeNoRepeat(odoc, namespace, tagRaiz, xmlNode, namePattern, name) {
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
        if (restrictionNode.childNodes[i].nodeType == 1 && restrictionNode.childNodes[i].nodeName == 'xs:pattern' ) {
            return generateFormFromSimpleTypeNodeRestrictionPattern(tagRaiz, xmlNode, namePattern, name, label, minOccurs,restrictionNode.childNodes[i].getAttribute('value') );
        } else if (restrictionNode.childNodes[i].nodeType == 1 && restrictionNode.childNodes[i].nodeName == 'xs:enumeration'  ) {
            return generateFormFromSimpleTypeNodeRestrictionEnumeration(tagRaiz, xmlNode, namePattern, name, label, minOccurs);
        } else if (restrictionNode.childNodes[i].nodeType == 1 && restrictionNode.childNodes[i].nodeName == 'xs:maxLength'  ) {
            return generateFormFromSimpleTypeNodeRestrictionMaxLength(tagRaiz, xmlNode, namePattern, name, label, minOccurs,restrictionNode.childNodes[i].getAttribute('value') );
        } else if (restrictionNode.childNodes[i].nodeType == 1 && restrictionNode.childNodes[i].nodeName == 'xs:fractionDigits'  ) {
            return createFieldDecimal(namePattern, name, label);
        }
    }
}

function generateFormFromSimpleTypeNodeRestrictionEnumeration(tagRaiz, xmlNode, namePattern, name, label, minOccurs){
    var inputName = namePattern + "__" + name;

    var frag = document.createDocumentFragment();
    var dt = document.createElement('dt');
    var dd = document.createElement('dd');

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
    newLabel.innerHTML = label;
    newLabel.htmlFor = inputName;

    dt.appendChild(newLabel);

    dd.appendChild(newSelect);
    dt.appendChild(newLabel);
    frag.appendChild(dt);
    frag.appendChild(dd);

    return frag;
}

function generateFormFromSimpleTypeNodeRestrictionPattern(tagRaiz, xmlNode, namePattern, name, label, minOccurs, pattern){
    var inputName = namePattern + "__" + name;

    var newLabel = document.createElement("label");
    newLabel.innerHTML = label;
    newLabel.htmlFor = inputName;

    var dt = document.createElement('dt');
    var dd = document.createElement('dd');
    dt.appendChild(newLabel);
    dd.appendChild(createInput('text' ,inputName, inputName));

    var frag = document.createDocumentFragment();
    frag.appendChild(dt);
    frag.appendChild(dd);
    return frag;
}

function generateFormFromSimpleTypeNodeRestrictionMaxLength(tagRaiz, xmlNode, namePattern, name, label, minOccurs, maxLength){
    var inputName = namePattern + "__" + name;

    var newLabel = document.createElement("label");
    newLabel.innerHTML = label;
    newLabel.htmlFor = inputName;

    var dt = document.createElement('dt');
    var dd = document.createElement('dd');
    dt.appendChild(newLabel);
    dd.appendChild(createInput('text' ,inputName, inputName, maxLength));

    var frag = document.createDocumentFragment();
    frag.appendChild(dt);
    frag.appendChild(dd);
    return frag;
}


function generateXmlFromSimpleTypeNode(odoc, namespace, tagRaiz, xmlNode, namePattern, name, minOccurs, maxOccurs) {

    var inputName = namePattern + "__" + name;
    var fieldValue = getById(inputName).value;

    if ( minOccurs != '0' || fieldValue != '' ) {

	    // validar o fieldValue
	    var restriction = null;
	    for (var i = 0; i < xmlNode.childNodes.length; i++) {
	        var node = xmlNode.childNodes[i];
            if (node.nodeType == 1) {
                if (node.nodeName == "xs:restriction" &&
                    node.getAttribute('base') == "xs:string") {
                    restriction = node;
                } else {
                    throw "Unkown simple type";
                }
            }
	    }
        var rdecl = [];
        for (var i = 0; i < restriction.childNodes.length; i++) {
            var decl = restriction.childNodes[i];
            if (decl.nodeType == 1) {
                rdecl.push(decl);
            }
        }
        if (rdecl.length == 0) {
            throw "Invalid restriction declaration, need restriction type.";
        }

        var valid = 0;

        if (rdecl[0].nodeName == "xs:enumeration") {
            for (var i = 0; i < rdecl.length; i++) {
                if (rdecl[i].getAttribute('value') == fieldValue) {
                    valid = 1;
                    break;
                }
            }
        } else if (rdecl[0].nodeName == "xs:pattern") {
            var regex = '^'+rdecl[0].getAttribute('value')+'$';
            var rx = new RegExp(regex);
            if (rx.test(fieldValue)) {
                valid = 1;
            }
        } else if (rdecl[0].nodeName == "xs:maxLength") {
            var maxl = rdecl[0].getAttribute('value');
            if (fieldValue.length <= maxl) {
                valid = 1;
            }
        } else {
            throw "Unkown restriction type: "+rdecl[0].nodeName;
        }

        if (!valid) {
            $('#'+inputName+"_input_deflate").addClass('xsd__validationfailed');
            $('#'+inputName).addClass('xsd__validationfailed');
            throw "Erro de Validação";
        } else {
            $('#'+inputName+"_input_deflate").removeClass('xsd__validationfailed');
            $('#'+inputName).removeClass('xsd__validationfailed');
        }

        var tag = odoc.createElementNS(namespace, name);
        var content = odoc.createTextNode( fieldValue );
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
    var type = getValueAttributeByName(xmlNode, "type");
    var name = getValueAttributeByName(xmlNode, "name");
    var minOccurs = getValueAttributeByName(xmlNode, "minOccurs");
    if (minOccurs == null) {minOccurs = 1}
    var inputName = namePattern + "__" + name;
    var valueField = getById(inputName).value;

    if ( minOccurs > 0 && valueField == '' ) {
        throw "Campo obrigatório";
    } else if ( valueField != '' ) {
        // valida mandatorio
        if (!validateValue(type, valueField)) {
            $('#'+inputName+"_input_deflate").addClass('xsd__validationfailed');
            $('#'+inputName).addClass('xsd__validationfailed');
            throw "Erro de validação";
        } else {
            $('#'+inputName+"_input_deflate").removeClass('xsd__validationfailed');
            $('#'+inputName).removeClass('xsd__validationfailed');
            var tag = odoc.createElementNS(namespace, name);
            var content = odoc.createTextNode( valueField );
            tag.appendChild(content);
            return tag;
        }
    } else {
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
        var tagRaiz  = xml.getElementsByTagNameNS('http://www.w3.org/2001/XMLSchema','schema')[0];
        var elemRoot = getNodeByTagName(tagRaiz, 'xs:element'); // elemento raiz
        var elHtml = generateFormFromNode(tagRaiz, elemRoot, "xsdform___");
        getById(containerId).appendChild( elHtml );

    } catch (myError) {
        alert( myError.name + ': ' + myError.message + "\n" + myError);
    }
}

function generateFormIteration(xsdFile,containerId,Iteration) {
    try {

        //carrega o xml
        var xml = xmlLoader(xsdFile);
        var tagRaiz  = xml.getElementsByTagName('xs:schema')[0];
        var elemRoot = getNodeByTagName(tagRaiz, 'xs:element'); // elemento raiz
        var elHtml = generateFormFromNode(tagRaiz, elemRoot, "xsdform___"+Iteration);
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

    try {
        var xml = xmlLoader(xsdFile);
        var tagRaiz  = xml.getElementsByTagNameNS('http://www.w3.org/2001/XMLSchema','schema')[0];
        var elemRoot = getNodeByTagName(tagRaiz, 'xs:element'); // elemento raiz

        validateMandatory();
        // adicionar xmlns="..." de acordo com o atributo 'targetNamespace' do
	// xml schema.
        var namespace = getValueAttributeByName(tagRaiz,'targetNamespace');
	//window.alert('namespace is ' + namespace)	
        var odoc = document.implementation.createDocument("", "", null);
        var generated = generateXmlFromNode(odoc, namespace, tagRaiz, elemRoot, "xsdform___");

        odoc.appendChild(generated);
        input_to_set.value = ((new XMLSerializer()).serializeToString(odoc));


    } catch (myError) {
        if (myError.name != null) {
            alert( myError.name + ': ' + myError.message + "\n" + myError);
        } else {
            alert(myError);
        }
	return false;
    }
}

function createFieldString(name, minOccurs, maxOccurs) {
    var field = createTextArea(name);
    if (minOccurs > 0) {
        field.setAttribute('class', 'xsdForm__mandatory')
    }
    return field;
}

function createFieldFloat(name, minOccurs) {
    var field;
    field = createInput('text', name);
    field.setAttribute('class','xsdForm__float');
    if (minOccurs > 0) {
        field.setAttribute('class', 'xsdForm__float xsdForm__mandatory')
    }
    return field;
}

function createFieldInteger(name, minOccurs) {
    var field;
    field = createInput('text', name);
    field.setAttribute('class','xsdForm__integer');
    if (minOccurs > 0) {
        field.setAttribute('class', 'xsdForm__integer xsdForm__mandatory')
    }
    return field;
}

function createFieldDate(name, minOccurs) {
    var field;
    field = createInput('text', name);
    field.setAttribute('maxlength', '10');
    field.setAttribute('class', 'xsdForm__date');
    //field.setAttribute('onblur', 'validateValues()');
    if (minOccurs > 0) {
        field.setAttribute('class', 'xsdForm__date xsdForm__mandatory')
    }
    return field;
}

function createFieldDateTime(name, minOccurs) {
    var field;
    field = createInput('text', name);
    field.setAttribute('maxlength', '19');
    field.setAttribute('class','xsdForm__dateTime');
    //field.setAttribute('onblur', 'validateValues()');
    if (minOccurs > 0) {
        field.setAttribute('class', 'xsdForm__dateTime xsdForm__mandatory')
    }
    return field;
}

function createFieldDecimal(namePattern, name, label, minOccurs) {
    var field;
    
    var inputName = namePattern + "__" + name;
    var frag = document.createDocumentFragment();
    var dt = document.createElement('dt');
    var dd = document.createElement('dd');

    var newLabel = document.createElement("label");
    
    field = createInput('text', inputName);
    field.setAttribute('class','xsdForm__decimal');

    if (minOccurs > 0) {
        field.setAttribute('class', 'xsdForm__decimal xsdForm__mandatory')
    }
    
    newLabel.innerHTML = label;
    newLabel.htmlFor = inputName;

    dt.appendChild(newLabel);

    dd.appendChild(field);
    dt.appendChild(newLabel);
    frag.appendChild(dt);
    frag.appendChild(dd);

    return frag;
}

function createFieldBoolean(name, minOccurs) {
    return createInput('checkbox', name);
}

function generateFormField(tagRaiz, xmlNode, type, namePattern, minOccurs, maxOccurs) {

    var name = getValueAttributeByName(xmlNode, "name");
    var inputName = namePattern + "__" + name;

    var field;
    if ( type == "xs:string" ) {
        field = createFieldString(inputName, minOccurs, maxOccurs);
    } else if ( type == "xs:float" ) {
        field = createFieldFloat(inputName, minOccurs, maxOccurs);
    } else if ( type == "xs:decimal" ) {
        field = createFieldDecimal(inputName, minOccurs, maxOccurs);
    } else if ( type == "xs:integer" ) {
        field = createFieldInteger(inputName, minOccurs, maxOccurs);
    } else if ( type == "xs:date" ) {
        field = createFieldDate(inputName, minOccurs, maxOccurs);
    } else if ( type == "xs:dateTime" ) {
        field = createFieldDateTime(inputName, minOccurs, maxOccurs);
    } else if ( type == "xs:boolean" ) {
        field = createFieldBoolean(inputName);
    } else {
        alert(type + ' - Unknown type!');
        return false;
    }

    var frag = document.createDocumentFragment();
    var dt = document.createElement('dt');
    var newLabel = createLabel(getTextTagInAnnotationAppinfo(xmlNode, 'xhtml:label'), inputName);

    if ( type == "xs:boolean") {
        dt.setAttribute('class', 'dtsemdd');
        dt.appendChild(field);
        dt.appendChild(newLabel);
        frag.appendChild(dt);
    } else  {
        var dd = document.createElement('dd');

        var divType = document.createElement('div');
        divType.setAttribute('name', 'type');
        divType.setAttribute('style', 'display:none;');
        divType.appendChild( document.createTextNode( type ) );

        dd.appendChild(field);
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

function fillValuesIteration(xmlFile,Iteration) {
    try {
        var xml = xmlLoader(xmlFile);
        getFormFromNode("xsdform___"+Iteration, xml);
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
            xmlNode = xml.childNodes[i];
            name = namePattern + "__" + xmlNode.nodeName;

            if (xmlNode.childNodes.length > 1 ||
                (xmlNode.childNodes.length == 1 &&
                 xmlNode.childNodes[0].nodeType == 1)) {
                var fieldset = getById(name);
                var mycounter = 0;
                if(fieldset.getAttribute('class')=="xsdForm__repeat") {
                    var j = i;
                    for (j = i; j < xml.childNodes.length; j++) {
                        if (xml.childNodes[j].nodeType == 1) {
                            if (xml.childNodes[j].nodeName == xmlNode.nodeName) {
                                if (mycounter >= fieldset.xsdFormCurrentCount()) {
                                    fieldset.addRepeat();
                                }
                                getFormFromNode(namePattern+"__"+mycounter+"__"+xmlNode.nodeName, xml.childNodes[j]);
                                mycounter++;
                            } else {
                                i = j - 1;
                                break;
                            }
                        }
                    }
                    if (j == xml.childNodes.length) {
                        i = j;
                    }
                } else {
                    getFormFromNode(name, xmlNode);
                }
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
        if (valor == 1 || valor == "true") {
            getById(nameField).checked = true;
        } else {
            getById(nameField).checked = false;
        }

    }
}

function validateMandatory() {
    var error = 0;
    $('.xsdForm__mandatory').each(function() {
        if ($(this).val() == null ||
            $(this).val() == "") {
            $(this).addClass('xsd__validationfailed');
            error = 1;
        } else {
            $(this).removeClass('xsd__validationfailed');
        }
    });
    if (error) {
        throw "Campos obrigatórios não preenchidos";
    }
}

function validateDate(value) {
    var dia = parseInt( value.substring(8,10), 10 );
    var mes = parseInt( value.substring(5,7), 10 );
    var ano = parseInt( value.substring(0,4), 10 );

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
}

function validateDateTime(value) {
    var dia = parseInt( value.substring(8,10), 10 );
    var mes = parseInt( value.substring(5,7), 10 );
    var ano = parseInt( value.substring(0,4), 10 );

    var hora = parseInt( value.substring(11,13), 10 );
    var minuto = parseInt( value.substring(14,16), 10 );
    var segundo = parseInt( value.substring(17,19), 10 );

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

}

function validateFloat(value) {
    var expRegNumInt = /^\d+(\.\d+)?$/; // float
    if (value != "") {
        if (!expRegNumInt.test(value)) {
            return false;
        } else {
            return true;
        }
    } else {
        return true;
    }
}

function validateInteger(value) {
    var expRegNumInt = /^\d+$/; // float
    if (value != "") {
        if (!expRegNumInt.test(value)) {
            return false;
        } else {
            return true;
        }
    } else {
        return true;
    }
}


function validateValue(type, value) {
    if (type == "xs:float") {
        return validateFloat(value);
    } else if (type == "xs:integer") {
        return validateInteger(value);
    } else if (type == "xs:decimal") {
        return validateFloat(value);
    } else if (type == "xs:date") {
        return validateDate(value);
    } else if (type == "xs:dateTime") {
        return validateDateTime(value);
    } else {
        return true;
    }
}
