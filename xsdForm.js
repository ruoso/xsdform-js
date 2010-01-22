
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

	function removeById(strId) {
		var elem = getById(strId);
		elem.parentNode.removeChild(elem);
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
			if (type == "xs:string"   ||
				type == "xs:float") {
				return generateFormFieldFromSimpleTextNode(xmlNode, namePattern);
			} else if ( type == "xs:integer" ) {
				return generateFormFieldIntegerFromSimpleTextNode(xmlNode, namePattern);
			} else if ( type == "xs:date" ) {
				return generateFormFieldDateFromSimpleTextNode(xmlNode, namePattern);
			} else if ( type == "xs:dateTime" ) {
				return generateFormFieldDateTimeFromSimpleTextNode(xmlNode, namePattern);
			} else if ( type == "xs:boolean" ) {
				return generateFormFieldCheckboxFromSimpleTextNode(xmlNode, namePattern);
			} else {
				//throw type + " not supported.";
			}
		} else {
			// inline type definition
			for (var i = 0; i < xmlNode.childNodes.length; i++) {
				if (xmlNode.childNodes[i].nodeType == 1 && xmlNode.childNodes[i].nodeName == 'xs:annotation' ) {
					label = getTextTagInAnnotationAppinfo(xmlNode.childNodes[i], 'label', true);

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

	function integerField(obj) {
		var expRegNumInt = /^\d+$/; // só números

		if ( !expRegNumInt.test(obj.value) ) {
			obj.value = obj.value.substr(0, (obj.value.length - 1));
		}
		obj.focus();
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

	function generateFormFieldIntegerFromSimpleTextNode(xmlNode, namePattern) {

		var frag = document.createDocumentFragment();
		var dt = document.createElement('dt');
		var dd = document.createElement('dd');

		var name = getValueAttributeByName(xmlNode, "name");
		var inputName = namePattern + "__" + name;

		var newInput = document.createElement('input');
		newInput.type  = 'text';
		newInput.name  = inputName;
		newInput.id    = inputName;
		newInput.setAttribute('onkeypress', 'integerField(this);');
		newInput.setAttribute('onkeyup', 'integerField(this);');
		dd.appendChild(newInput);

		var newLabel = document.createElement("label");
		newLabel.innerHTML = getTextTagInAnnotationAppinfo(xmlNode, 'label') + ':';
		newLabel.htmlFor = inputName;

		dt.appendChild(newLabel);
		frag.appendChild(dt);
		frag.appendChild(dd);

		return frag;
	}

	function mascaraData(objFieldDate) {
		var data = objFieldDate.value;
		if (data.length == 2 || data.length == 5 ) {
			data = data + '/';
			objFieldDate.value = data;
		}
	}

	function CheckDate(pObj) {
		var dia = parseInt( pObj.value.substring(0,2), 10 );
		var mes = parseInt( pObj.value.substring(3,5), 10 );
		var ano = parseInt( pObj.value.substring(6,10), 10 );

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

	function dateField(obj) {
		if ( !CheckDate(obj) ) {

			if ( getById('fieldDate__' + obj.di) == null ) {
				var div = document.createElement('div');
				div.setAttribute('style', 'color:red');
				div.id = 'fieldDate__' + obj.di;

				var containerField = obj.parentNode;
				containerField.appendChild( div );
			} else {
				div = getById('fieldDate__' + obj.di);
			}
			div.innerHTML = 'Data Inválida.';
			obj.focus();

		} else {
			try {
				removeById('fieldDate__' + obj.di);
			} catch (obgError) {
			}
		}
	}

	function generateFormFieldDateFromSimpleTextNode(xmlNode, namePattern) {

		var frag = document.createDocumentFragment();
		var dt = document.createElement('dt');
		var dd = document.createElement('dd');

		var name = getValueAttributeByName(xmlNode, "name");
		var inputName = namePattern + "__" + name;

		var newInput = document.createElement('input');
		newInput.type  = 'text';
		newInput.name  = inputName;
		newInput.id    = inputName;
		newInput.setAttribute('maxlength', '10');
		//newInput.maxlength = 10;
		//newInput.setAttribute('onkeyup', 'dateField(this);');
		newInput.setAttribute('onblur', 'dateField(this);');
		newInput.setAttribute('onkeydown', 'mascaraData(this);');
		dd.appendChild(newInput);

		var newLabel = document.createElement("label");
		newLabel.innerHTML = getTextTagInAnnotationAppinfo(xmlNode, 'label') + ':';
		newLabel.htmlFor = inputName;

		dt.appendChild(newLabel);
		frag.appendChild(dt);
		frag.appendChild(dd);

		return frag;
	}

	function generateFormFieldDateTimeFromSimpleTextNode(xmlNode, namePattern) {

		var frag = document.createDocumentFragment();
		var dt = document.createElement('dt');
		var dd = document.createElement('dd');

		var name = getValueAttributeByName(xmlNode, "name");
		var inputName = namePattern + "__" + name;

		var newInput = document.createElement('input');
		newInput.type  = 'text';
		newInput.name  = inputName;
		newInput.id    = inputName;
		newInput.setAttribute('maxlength', '19');
		//newInput.maxlength = 10;
		//newInput.setAttribute('onkeyup', 'dateField(this);');
		//newInput.setAttribute('onblur', 'dateField(this);');
		newInput.setAttribute('onkeypress', 'mascaraDateTime(this);');
		newInput.setAttribute('onkeyup', 'mascaraDateTime(this);');
		dd.appendChild(newInput);

		var newLabel = document.createElement("label");
		newLabel.innerHTML = getTextTagInAnnotationAppinfo(xmlNode, 'label') + ':';
		newLabel.htmlFor = inputName;

		dt.appendChild(newLabel);
		frag.appendChild(dt);
		frag.appendChild(dd);

		return frag;
	}

	function mascaraDateTime(objFieldDate) {
		var data = objFieldDate.value;
		var ultCarac = objFieldDate.value = objFieldDate.value.substr((objFieldDate.value.length - 2), (objFieldDate.value.length - 1));

		var expRegNumInt = /^\d+$/; // só números

		var test = 0;
		if ( ultCarac == '' ) {
			test += '1';
		}
		if ( !expRegNumInt.test( ultCarac ) ) {
			test += '2';
		}
		if ( ultCarac != '/' ) {
			test += '3';
		}
		if ( ultCarac != ':' ) {
			test += '4';
		}

		if ( objFieldDate.value != '' && ( !expRegNumInt.test( ultCarac.value ) && ultCarac != '/' && ultCarac != ':' ) ) {
			objFieldDate.value = objFieldDate.value.substr(0, (objFieldDate.value.length - 1));
			return false;
		}

		if (data.length == 2 || data.length == 5 ) {
			data = data + '/';
			objFieldDate.value = data;
		} else if ( data.length == 10 ) {
			data = data + ' ';
			objFieldDate.value = data;
		} else if ( data.length == 13 || data.length == 16 ) {
			data = data + ':';
			objFieldDate.value = data;
		}
		return true;
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
					frag.appendChild(elHtml);
				}
			}
			getById(containerId).appendChild( frag );


		} catch (myError) {
			alert( myError.name + ': ' + myError.message + "\n" + myError);
		}

	}
