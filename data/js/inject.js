self.port.on('inject', function(scriptParams) {
	
	//params are set using panel widgets and applied in PageMod.js
	var params = JSON.parse(scriptParams);

	//build script to inject into the page with users chosen values
	var script = document.createElement('script');
	script.type = 'text/javascript';

	function dateHandler() {

		var args =[
			["Date.prototype", "toString", params.dateStr],
			["Date.prototype", "toLocaleString", params.localeStr],
			["Date.prototype", "toLocaleDateString", params.localDateStr],
			["Date.prototype", "toTimeString", params.timeStr],
			["Date.prototype", "toLocaleTimeString", params.localeTimeStr]
		];
		
		var content = applyFuncArgs(defineReturnStringProperty,args);
		content += defineReturnIntProperty("Date.prototype", "getTimezoneOffset", params.tzoffset);

		return content;
	}

	function windowHandler() {

		var args = [
			["screen", "width", params.screenWidth],
			["screen", "height", params.screenHeight],
			["screen", "availWidth", params.screenAvailWidth],
			["screen", "availHeight", params.screenAvailHeight],
			["window", "innerWidth", params.windowInnerWidth],
			["window", "innerHeight", params.windowInnerHeight],
			["window", "outerWidth", params.windowOuterWidth],
			["window", "outerHeight", params.windowOuterHeight],
			["screen", "colorDepth", params.colorDepth],
			["screen", "pixelDepth", params.pixelDepth]
		];

		return applyFuncArgs(defineIntProperty,args);
	}

	function canvasHandler() {

		var args = [
			["CanvasRenderingContext2D.prototype", "textBassline", undefined],
			["CanvasRenderingContext2D.prototype", "font", undefined],
			["CanvasRenderingContext2D.prototype", "fillStyle", undefined],
			["CanvasRenderingContext2D.prototype", "strokeStyle", undefined],
			["CanvasRenderingContext2D.prototype", "fillText", undefined]
		];

		var content = applyFuncArgs(defineIntProperty,args);

		args = [
			["CanvasRenderingContext2D.prototype", "fillRect", undefined],
			["HTMLCanvasElement.prototype", "getContext", undefined]
		];

		content += applyFuncArgs(defineReturnIntProperty,args);

		return content;
	}

	function whiteListHandler() {

		var args =[
			["navigator", "userAgent", params.wlUserAgent],
			["navigator", "appCodeName",params.wlAppCodeName],
			["navigator", "appName", params.wlAppName],
			["navigator", "appVersion", params.wlAppVersion],
			["navigator", "vendor", params.wlVendor],
			["navigator", "vendorSub", params.wlVendorSub],
			["navigator", "platform", params.wlPlatform ],
			["navigator", "oscpu", params.wlOsCpu]
		];

		return applyFuncArgs(defineStringProperty,args);
	}


	function applyFuncArgs(func,argArr){
		var content = "";
		
		for(var i=0, l=argArr.length; i < l; i++){
			content += func.apply(null,argArr[i]);
		}

		return content;
	};	

	function defineStringProperty(obj,prop,value){
		
		//ensure empty strings are handled due to JSON.stringify in PageMod.js
		if(value) 
			return 'Object.defineProperty('+obj+', "'+prop+'", {value: "' + value + '"});';
		else
			return 'Object.defineProperty('+obj+', "'+prop+'", {value: ""});';
	}

	function defineIntProperty(obj,prop,value){
		return 'Object.defineProperty('+obj+', "'+prop+'", {value: ' + value + '});';
	}

	function defineReturnIntProperty(obj,prop,value){
		return 'Object.defineProperty('+obj+', "'+prop+'", {value: function() {return '+value+';}});';
	}

	function defineReturnStringProperty(obj,prop,value){
		return 'Object.defineProperty('+obj+', "'+prop+'", {value: function() {return "' + value + '";}});';
	}

	var content = '(function (){try{'

	// Use whitelisted profile (if selected and the default is not it use)
	if (params.applyWhiteList == true && params.realProfile == false) {

		content += whiteListHandler();
	
	} else { // do additional profile spoofing

		content += defineStringProperty("navigator","vendor",params.vendor);
	}

	//blank out the productSub property
	content += 'Object.defineProperty(navigator, "productSub", {value: ""});';

	//Disable canvas support (if selected)
	if (params.canvas == true) {

		content += canvasHandler();
	}

	//Reset window.name on each request (if selected)
	if (params.windowName == true) {

		content += 'Object.defineProperty(window, "name", {value: "", writable: true});';
	}

	// screen & window prefrences (if selected)
	if (params.screen == true) {

		if (params.screenWidth != null) {

			content += windowHandler();
		}
	}

	// date & timezone prefrences (if selected)
	if (params.date == true) {

		content += dateHandler();
	}

	// Limit tab history to 2
	if (params.limitTab == true) {

		content += defineStringProperty("history", "length","2");
	}

	//remove script after modifications to prevent sites from reading it
	content += 'var ras_script = document.getElementsByTagName("script")[0]; ras_script.parentNode.removeChild(ras_script);';
	content += '} catch (e) {} }) ();'

	script.textContent = content;

	//Append script as first child of the head element
	var head = window.document.head;
	head.insertBefore(script, head.firstChild);
});



	/*
	//TODO
	function pluginHandler(){

		var content = 'Object.defineProperty( navigator.plugins, "length", {value:0 });';
		return content;
	}
	
	//TODO
	function mimeTypeHandler(){

		var content = 'Object.defineProperty( navigator.mimeTypes, "length", {value:0 });';
		return content;
	}
	*/

	// TODO set navigator.language equal to the accept language header
		
	//disables contentWindow property of iFrame
	//content += defineIntProperty("HTMLIFrameElement.prototype", "contentWindow", undefined);

	//TODO set locale string using spoofed language.
