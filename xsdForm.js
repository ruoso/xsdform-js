
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

	function getValueAttributesByName(xmlNode,attributeName) {
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
		type = getValueAttributesByName(xmlNode, "type");
		if (type != null) {
			// pre-defined types
			if (type == "xs:integer" ||
				type == "xs:string" ||
				type == "xs:datetime" ||
				type == "xs:date" ||
				type == "xs:float") {
				return generateFormFromSimpleTextNode(xmlNode, namePattern);
			} else {
				//throw type + " not supported.";
			}
		} else {
			// inline type definition
			for (var i = 0; i < xmlNode.childNodes.length; i++) {
				if (xmlNode.childNodes[i].nodeType == 1 && xmlNode.childNodes[i].nodeName == 'xs:annotation' ) {
					label = getNodeByTagName(xmlNode, "xs:appinfo");
					label = getNodeByTagName(xmlNode, "legend");
				} else if (xmlNode.childNodes[i].nodeType == 1 && xmlNode.childNodes[i].nodeName == 'xs:complexType') {
					return generateFormFromComplexTypeNode(xmlNode.childNodes[i], namePattern, getValueAttributesByName(xmlNode, "name"), label );
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

		for (var i = 0; i < xmlNode.childNodes.length; i++) {
			var el = xmlNode.childNodes[i];
			if (el.nodeType == 1 && el.nodeName == 'xs:sequence') {
				for (var j = 0; j < el.childNodes.length; j++) {
					if (el.childNodes[j].nodeType == 1 && el.childNodes[j].nodeName == "xs:element") {
						var elHtml = generateFormFromNode(el.childNodes[j], namePattern + "__" + name);
						if (elHtml) {
							fieldset.appendChild(elHtml);
						}
					}
				}
			} else if (el.nodeType == 1 && el.nodeName == 'xs:choice') {
				//throw "xs:choice not supported";
			}
		}

		return fieldset;

	}

	function generateFormFromSimpleTextNode(xmlNode, namePattern) {
		var name = getValueAttributesByName(xmlNode, "name");
		var label = name;
		for (var i = 0; i < xmlNode.childNodes.length; i++) {
			if (xmlNode.childNodes[i].nodeType == 1 && xmlNode.childNodes[i].nodeName == 'xs:annotation' ) {
				label = getNodeByTagName(xmlNode.childNodes[i], "xs:appinfo");
			}
		}

		var newInput = document.createElement('input');
		newInput.type  = 'text';
		newInput.name  = namePattern + "__" + name;
		newInput.id    = namePattern + "__" + name;

		var newLabel = document.createElement("label");
		newLabel.appendChild(label);
		newLabel.appendChild(newInput);
		return newLabel;
	}


	function generateForm() {
		try {

			//carrega o xml
			var xml = xmlLoader("test.xsd.xml");

			if ( false ) {
				docWriteBr( xmlMicoxArvore(xml, ''));
			} else {

				var tagRaiz;
				var elemRoot;
				var node;

				tagRaiz = xml.getElementsByTagName('xs:schema')[0];
				elemRoot = getNodeByTagName(tagRaiz, 'xs:element'); // elemento raiz

				node = getNodeByTagName(elemRoot, 'xs:annotation');
				node = getNodeByTagName(node, 'xs:appinfo');
				node = getNodeByTagName(node, 'formAttibutes');

		        var form = document.createElement("form");
		        form.action = getTextByTagName(node,'action');
		        form.method = getTextByTagName(node,'method');
		        form.name	= getTextByTagName(node,'name');
		        form.id 	= getTextByTagName(node,'id');

				for ( var i = 0; i < elemRoot.childNodes.length; i++ ) {
					if ( elemRoot.childNodes[i].nodeType == 1 && elemRoot.childNodes[i].nodeName == 'xs:element' ) {
						var elHtml = generateFormFromNode(elemRoot.childNodes[i],"xsdform___"+form.name );
						form.appendChild(elHtml);
					}
				}

				getById('xsdform_container').appendChild( form );

			}


		} catch (myError) {
			alert( myError.name + ': ' + myError.message + "\n" + myError);
		}

	}
