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

function generateFormFromSimpleTypeNodeRestrictionMaxLength(tagRaiz, xmlNode, namePattern, name, label, minOccurs){
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

function createFieldString(name) {
    return createTextArea(name);
}

function createFieldFloat(name) {
    var field;
    field = createInput('text', name);
    field.setAttribute('class','xsdForm__float');
    return field;
}

function createFieldInteger(name) {
    var field;
    field = createInput('text', name);
    field.setAttribute('class','xsdForm__integer');
    return field;
}

function createFieldDate(name) {
    var field;
    field = createInput('text', name);
    field.setAttribute('maxlength', '10');
    field.setAttribute('class', 'xsdForm__date');
    return field;
}

function createFieldDateTime(name) {
    var field;
    field = createInput('text', name);
    field.setAttribute('maxlength', '19');
    field.setAttribute('class','xsdForm__dateTime');
    return field;
}

function createFieldDecimal(namePattern, name, label) {
    var field;
    
    var inputName = namePattern + "__" + name;
    var frag = document.createDocumentFragment();
    var dt = document.createElement('dt');
    var dd = document.createElement('dd');

    var newLabel = document.createElement("label");
    
    field = createInput('text', inputName);
    field.setAttribute('class','xsdForm__decimal');
    
    newLabel.innerHTML = label;
    newLabel.htmlFor = inputName;

    dt.appendChild(newLabel);

    dd.appendChild(field);
    dt.appendChild(newLabel);
    frag.appendChild(dt);
    frag.appendChild(dd);

    return frag;
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
    } else if ( type == "xs:decimal" ) {
        field = createFieldDecimal(inputName);
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

