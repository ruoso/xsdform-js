
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

	function getText(xmlNode) {
		if ( getNavigator() == 'IE' ) {
			return xmlNode.firstChild.nodeValue;
		} else {
			return xmlNode.textContent;
		}
	}

	function getNodeByIndex(xmlNode,index) {
		if ( getNavigator() == 'IE' ) {
			return xmlNode.childNodes[index];
		} else {
			return xmlNode.children[index];
		}
	}

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

					label = getNodeByTagName(xmlNode.childNodes[i], "xs:appinfo");
					label = getTextByTagName(label, 'label');

				} else if (xmlNode.childNodes[i].nodeType == 1 && xmlNode.childNodes[i].nodeName == 'xs:complexType') {

					return generateFormFromComplexTypeNode(xmlNode.childNodes[i], namePattern, getValueAttributeByName(xmlNode, "name"), label );

				} else if (xmlNode.childNodes[i].nodeType == 1 && xmlNode.childNodes[i].nodeName == 'xs:simpleType') {

					return generateFormFromSimpleTypeNode(xmlNode.childNodes[i], namePattern, getValueAttributeByName(xmlNode, "name"), label);

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

	function generateFormFromSimpleTypeNode(xmlNode, namePattern, name, label) {

		var frag = document.createDocumentFragment();
		var dt = document.createElement('dt');
		var dd = document.createElement('dd');

		var restrictionNode = getNodeByTagName(xmlNode, 'xs:restriction');

		var newSelect = document.createElement('select');
		newSelect.name  = namePattern + "__" + name;
		newSelect.id    = namePattern + "__" + name;
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
		newLabel.innerHTML = label;
		dt.appendChild(newLabel);

		frag.appendChild(dt);
		frag.appendChild(dd);

		return frag;
	}

	function generateFormFieldFromSimpleTextNode(xmlNode, namePattern) {
		var name = getValueAttributeByName(xmlNode, "name");
		var label;
		for (var i = 0; i < xmlNode.childNodes.length; i++) {
			if (xmlNode.childNodes[i].nodeType == 1 && xmlNode.childNodes[i].nodeName == 'xs:annotation' ) {
				label = getNodeByTagName(xmlNode.childNodes[i], "xs:appinfo");
				label = getTextByTagName(label, "label");
			}
		}

		var frag = document.createDocumentFragment();
		var dt = document.createElement('dt');
		var dd = document.createElement('dd');

		var newInput = document.createElement('input');
		newInput.type  = 'text';
		newInput.name  = namePattern + "__" + name;
		newInput.id    = namePattern + "__" + name;
		dd.appendChild(newInput);

		var newLabel = document.createElement("label");
		newLabel.innerHTML = label;
		dt.appendChild(newLabel);

		frag.appendChild(dt);
		frag.appendChild(dd);

		return frag;
	}

	function generateFormFieldCheckboxFromSimpleTextNode(xmlNode, namePattern) {
		var name = getValueAttributeByName(xmlNode, "name");
		var label;
		for (var i = 0; i < xmlNode.childNodes.length; i++) {
			if (xmlNode.childNodes[i].nodeType == 1 && xmlNode.childNodes[i].nodeName == 'xs:annotation' ) {
				label = getNodeByTagName(xmlNode.childNodes[i], "xs:appinfo");
				label = getTextByTagName(label, "label");
			}
		}
		var frag = document.createDocumentFragment();
		var dt = document.createElement('dt');
                dt.class = "dtsemdd";

		var newInput = document.createElement('input');
		newInput.type  = 'checkbox';
		newInput.name  = namePattern + "__" + name;
		newInput.id    = namePattern + "__" + name;

		var newLabel = document.createElement("label");
		newLabel.innerHTML = label;
		dt.appendChild(newInput);
		dt.appendChild(newLabel);

		frag.appendChild(dt);

		return frag;
	}

	function generateForm(xsdFile,containerId) {
		try {

			//carrega o xml
			var xml = xmlLoader(xsdFile);

			if ( false ) {
				docWriteBr( xmlMicoxArvore(xml, ''));
			} else {


				var tagRaiz  = xml.getElementsByTagName('xs:schema')[0];
				var elemRoot = getNodeByTagName(tagRaiz, 'xs:element'); // elemento raiz
				var elem;
				var frag = document.createDocumentFragment();

				for ( var i = 0; i < elemRoot.childNodes.length; i++ ) {
					elem = elemRoot.childNodes[i];
					if ( elem.nodeType == 1 && elem.nodeName == 'xs:element' ) {
						var elHtml = generateFormFromNode(elem, "xsdform___" + getValueAttributeByName(elemRoot, 'name') );
						frag.appendChild(elHtml);
					}
				}
				getById(containerId).appendChild( frag );

			}


		} catch (myError) {
			alert( myError.name + ': ' + myError.message + "\n" + myError);
		}

	}
