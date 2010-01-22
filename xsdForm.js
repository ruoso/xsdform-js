
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

	function generateFormFromNode(xmlNode, namePattern) {
		var label, type;
		type = getValueAttributeByName(xmlNode, "type");
		if (type != null) {
			// pre-defined types
			if (type == "xs:integer"  ||
				type == "xs:string"   ||
				type == "xs:dateTime" ||
				type == "xs:date"     ||
				type == "xs:float") {
				return generateFormFieldFromSimpleTextNode(xmlNode, namePattern);
			} else if ( type == "xs:boolean" ) {
				return generateFormFieldCheckboxFromSimpleTextNode(xmlNode, namePattern);
			} else {
				//throw type + " not supported.";
			}
		} else {
			// inline type definition
			for (var i = 0; i < xmlNode.childNodes.length; i++) {
				if (xmlNode.childNodes[i].nodeType == 1 && xmlNode.childNodes[i].nodeName == 'xs:annotation' ) {

					/*
					label = getNodeByTagName(xmlNode.childNodes[i], "xs:appinfo");
					label = getTextByTagName(label, 'label');
					*/

					label = getTextTagInAnnotationAppinfo(xmlNode.childNodes[i], 'label', true);

				} else if (xmlNode.childNodes[i].nodeType == 1 && xmlNode.childNodes[i].nodeName == 'xs:complexType') {

					return generateFormFromComplexTypeNode(xmlNode.childNodes[i], namePattern, getValueAttributeByName(xmlNode, "name"), label );

				} else if (xmlNode.childNodes[i].nodeType == 1 && xmlNode.childNodes[i].nodeName == 'xs:simpleType') {

					return generateFormFromSimpleTypeNode(xmlNode.childNodes[i], namePattern, getValueAttributeByName(xmlNode, "name"), label);

				}
			}
		}
	}

	function generateXmlFromNode(odoc, xmlNode, namePattern) {
		var type;
		type = getValueAttributeByName(xmlNode, "type");
		if (type != null) {
			// pre-defined types
			if (type == "xs:integer"  ||
				type == "xs:string"   ||
				type == "xs:dateTime" ||
				type == "xs:date"     ||
				type == "xs:float") {
				return generateXmlFromSimpleTextNode(odoc, xmlNode, namePattern);
			} else if ( type == "xs:boolean" ) {
				return generateXmlFromCheckboxTextNode(odoc, xmlNode, namePattern);
			} else {
				//throw type + " not supported.";
			}
		} else {
			// inline type definition
			for (var i = 0; i < xmlNode.childNodes.length; i++) {
				if (xmlNode.childNodes[i].nodeType == 1 && xmlNode.childNodes[i].nodeName == 'xs:complexType') {
					return generateXmlFromComplexTypeNode(odoc, xmlNode.childNodes[i], namePattern, getValueAttributeByName(xmlNode, "name"));
				} else if (xmlNode.childNodes[i].nodeType == 1 && xmlNode.childNodes[i].nodeName == 'xs:simpleType') {
					return generateXmlFromSimpleTypeNode(odoc, xmlNode.childNodes[i], namePattern, getValueAttributeByName(xmlNode, "name"));
				}
			}
		}
	}

        function generateFormFromComplexTypeNode(xmlNode, namePattern, name, label) {
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
						var elHtml = generateFormFromNode(el.childNodes[j], namePattern + "__" + name);
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

	function generateXmlFromComplexTypeNode(odoc, xmlNode, namePattern, name) {
        // gerar o fieldset com o legend e os conteudos...

		var tag = odoc.createElement(name);


		for (var i = 0; i < xmlNode.childNodes.length; i++) {
			var el = xmlNode.childNodes[i];
			if (el.nodeType == 1 && el.nodeName == 'xs:sequence') {
				for (var j = 0; j < el.childNodes.length; j++) {
					if (el.childNodes[j].nodeType == 1 && el.childNodes[j].nodeName == "xs:element") {
						var elHtml = generateXmlFromNode(odoc, el.childNodes[j], namePattern + "__" + name);
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

	function generateFormFromSimpleTypeNode(xmlNode, namePattern, name, label) {

		var frag = document.createDocumentFragment();
		var dt = document.createElement('dt');
		var dd = document.createElement('dd');

		var restrictionNode = getNodeByTagName(xmlNode, 'xs:restriction');
		var inputName = namePattern + "__" + name;

		var newSelect = document.createElement('select');
		newSelect.name  = inputName;
		newSelect.id    = inputName;
		dd.appendChild(newSelect);

		var newOption;
		for (var i = 0; i < restrictionNode.childNodes.length; i++) {
			if (restrictionNode.childNodes[i].nodeType == 1 && restrictionNode.childNodes[i].nodeName == 'xs:enumeration' ) {

				newOption = document.createElement("option");
				newOption.innerHTML = getValueAttributeByName(restrictionNode.childNodes[i], 'value');

				newSelect.appendChild(newOption);
			}
		}

		var newLabel = document.createElement("label");
		newLabel.innerHTML = label + ':';
		newLabel.htmlFor = inputName;

		dt.appendChild(newLabel);
		frag.appendChild(dt);
		frag.appendChild(dd);

		return frag;
	}

	function generateXmlFromSimpleTypeNode(odoc, xmlNode, namePattern, name) {

		var inputName = namePattern + "__" + name;
		var tag = odoc.createElement(name);
		var content = odoc.createTextNode(getById(inputName).value);

		tag.appendChild(content);

		return tag;
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

	function generateFormFieldFromSimpleTextNode(xmlNode, namePattern) {

		var frag = document.createDocumentFragment();
		var dt = document.createElement('dt');
		var dd = document.createElement('dd');

		var name = getValueAttributeByName(xmlNode, "name");
		var inputName = namePattern + "__" + name;

		var newInput = document.createElement('input');
		newInput.type  = 'text';
		newInput.name  = inputName;
		newInput.id    = inputName;
		dd.appendChild(newInput);

		var newLabel = document.createElement("label");
		newLabel.innerHTML = getTextTagInAnnotationAppinfo(xmlNode, 'label') + ':';
		newLabel.htmlFor = inputName;

		dt.appendChild(newLabel);
		frag.appendChild(dt);
		frag.appendChild(dd);

		return frag;
	}

	function generateXmlFromSimpleTextNode(odoc, xmlNode, namePattern) {

		var name = getValueAttributeByName(xmlNode, "name");
		var inputName = namePattern + "__" + name;

		var tag = odoc.createElement(name);
		var content = odoc.createTextNode(getById(inputName).value);

		tag.appendChild(content);

		return tag;
	}

	function generateFormFieldCheckboxFromSimpleTextNode(xmlNode, namePattern) {
		var frag = document.createDocumentFragment();
		var name = getValueAttributeByName(xmlNode, "name");
		var inputName = namePattern + "__" + name;
		var dt = document.createElement('dt');
	        dt.setAttribute('class', 'dtsemdd');

		var newInput = document.createElement('input');
		newInput.type  = 'checkbox';
		newInput.name  = inputName;
		newInput.id    = inputName;

		var newLabel = document.createElement("label");
		newLabel.innerHTML = getTextTagInAnnotationAppinfo(xmlNode, 'label');
		newLabel.htmlFor = inputName;

		dt.appendChild(newInput);
		dt.appendChild(newLabel);
		frag.appendChild(dt);

		return frag;
	}

	function generateXmlFromCheckboxTextNode(odoc, xmlNode, namePattern) {

		var name = getValueAttributeByName(xmlNode, "name");
		var inputName = namePattern + "__" + name;

		var tag = odoc.createElement(name);
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
			var elem;
			var frag = document.createDocumentFragment();

			for ( var i = 0; i < elemRoot.childNodes.length; i++ ) {
				elem = elemRoot.childNodes[i];
				if ( elem.nodeType == 1 && elem.nodeName == 'xs:element' ) {
					var elHtml = generateFormFromNode(elem, "xsdform___" + getValueAttributeByName(elemRoot, 'name') );
					//alert(elHtml.nodeName);
					frag.appendChild(elHtml);
				}
			}
			getById(containerId).appendChild( frag );


		} catch (myError) {
			alert( myError.name + ': ' + myError.message + "\n" + myError);
		}

	}

	function generateXml(xsdFile, input_to_set) {
		try {
			var xml = xmlLoader(xsdFile);
			var tagRaiz  = xml.getElementsByTagName('xs:schema')[0];
			var elemRoot = getNodeByTagName(tagRaiz, 'xs:element'); // elemento raiz
			var elem;

			var odoc = document.implementation.createDocument("", "", null); 
			var generated = odoc.createElement(getValueAttributeByName(elemRoot,"name"));
			odoc.appendChild(generated);

			for ( var i = 0; i < elemRoot.childNodes.length; i++ ) {
				elem = elemRoot.childNodes[i];
				if ( elem.nodeType == 1 && elem.nodeName == 'xs:element' ) {
					var subel = generateXmlFromNode(odoc,elem, "xsdform___" + getValueAttributeByName(elemRoot, 'name') );
					generated.appendChild(subel);
				}
			}

			input_to_set.value = ((new XMLSerializer()).serializeToString(odoc));

		} catch (myError) {
			alert( myError.name + ': ' + myError.message + "\n" + myError);
		}	
	}

