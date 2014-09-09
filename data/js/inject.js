self.port.on("inject", function( intParams, strParams, boolParams) {

  	//build script to inject into the page with users chosen values
	var script = document.createElement( "script" );
	script.type = "text/javascript";


	// copy parent windows attributes to child
	function copyWinAttribs(targetWin, sourceWin) {

	    var winAttribs = ["screen","performance","Components","navigator","innerHeight","innerWidth","outerHeight","outerWidth"];
	    var win = ""
	    for (var i=0;i<winAttribs.length;i++) {

	        win += "try { Object.defineProperty("+targetWin+",'"+winAttribs[i]+"',{ value: "+sourceWin+"."+winAttribs[i]+" }); } catch (e) {} ";
	    	
	    }
	    win += targetWin+".open = "+sourceWin+".open; ";
	    return win;
	}


	function dateHandler(){

		var content =  "Object.defineProperty( Date.prototype, 'toLocaleString', {value: function(){return \"\";}});";
		content +=  "Object.defineProperty( Date.prototype, 'toString', {value: function(){return \"\";}});";
		content +=  "Object.defineProperty( Date.prototype, 'toUTCString', {value: function(){return \"\";}});";
		content +=  "Object.defineProperty( Date.prototype, 'toGMTString', {value: function(){return \"\";}});";
		return content;
	}

	function windowHandler(){

 		var content =  "Object.defineProperty( screen, 'width', {value: "+intParams[1]+"});";
		content +=  "Object.defineProperty( screen, 'height', {value: "+intParams[2]+"});";
		content +=  "Object.defineProperty( screen, 'availWidth', {value: "+intParams[3]+"});";
		content +=  "Object.defineProperty( screen, 'availHeight', {value: "+intParams[4]+"});";
		content +=  "Object.defineProperty( window, 'innerWidth', {value: "+intParams[5]+"});";
		content +=  "Object.defineProperty( window, 'innerHeight', {value: "+intParams[6]+"});";
		content +=  "Object.defineProperty( window, 'outerWidth', {value: "+intParams[7]+"});";
		content +=  "Object.defineProperty( window, 'outerHeight', {value: "+intParams[8]+"});";
	    content +=  "Object.defineProperty( window, 'open', {value: function(url,name,paramaters){var winOpen = Window.prototype.open;var win = winOpen.call(this, url, name, paramaters);"+copyWinAttribs("win", "win.opener")+"return win;}});";
	    
	    return content;

	}

	function canvasHandler(){

		var content =  "Object.defineProperty( CanvasRenderingContext2D.prototype, 'fillRect', {value: function(){return undefined;}});";
		content +=  "Object.defineProperty( CanvasRenderingContext2D.prototype, 'textBassline', {value: undefined});";
		content +=  "Object.defineProperty( CanvasRenderingContext2D.prototype, 'font', {value: undefined});";
		content +=  "Object.defineProperty( CanvasRenderingContext2D.prototype, 'fillStyle', {value: undefined});";
		content +=  "Object.defineProperty( CanvasRenderingContext2D.prototype, 'strokeStyle', {value: undefined});";
		content +=  "Object.defineProperty( CanvasRenderingContext2D.prototype, 'fillText', {value: undefined});";
		content +=  "Object.defineProperty( HTMLCanvasElement.prototype, 'getContext', {value:function(){ return undefined;}});";
		
		return content;
	}

	function whiteListHandler(){

		var content =  "Object.defineProperty( navigator, 'userAgent', {value: \""+strParams[1]+"\"});";
		content +=  "Object.defineProperty( navigator, 'appCodeName', {value: \""+strParams[2]+"\"});";
		content +=  "Object.defineProperty( navigator, 'appName', {value: \""+strParams[3]+"\"});";
		content +=  "Object.defineProperty( navigator, 'appVersion', {value: \""+strParams[4]+"\"});";
		content +=  "Object.defineProperty( navigator, 'vendor', {value: \""+strParams[5]+"\"});";
		content +=  "Object.defineProperty( navigator, 'vendorSub', {value: \""+strParams[6]+"\"});";
		content +=  "Object.defineProperty( navigator, 'platform', {value: \""+strParams[7]+"\"});";
		content +=  "Object.defineProperty( navigator, 'oscpu', {value: \""+strParams[8]+"\"});";

		return content;
	}


	var content = "(function (){try{"  
	
	//whitelist profile
	if (boolParams[0] == true){
		content += whiteListHandler();
	}else{
		// spoof as normal
		// restore vendor functionality
		content +=  "Object.defineProperty( navigator, 'vendor', {value: \""+strParams[0]+"\"});";
	}

	//blank out the productSub property
	content += "Object.defineProperty( navigator, 'productSub', {value: \"\"});";
	
	//Disable  canvas support
	if (boolParams[1] == true) {
		content += canvasHandler();
	}

	//Reset window.name on each request
	if (boolParams[2] == true){
		content +=  "Object.defineProperty( window, 'name', {value: \"\", writable: true});";
	}

	// screen & window prefrences
	if (boolParams[3] == true){

		if(intParams[1] != null){ 
			content += windowHandler();
		}
	}

	// date prefrences
	if (boolParams[4] == true){

	 	// Send blank date strings if the user selected not to send the time zone
		if(intParams[0] == null){ 
			content += dateHandler();
		}

		// time zone offset
		content +=  "Object.defineProperty( Date.prototype, 'getTimezoneOffset', {value: function(){return "+intParams[0]+";}});";	

	}


	//remove script after modifications to prevent sites from reading it
	content += "var ras_script = document.getElementsByTagName('script')[0]; ras_script.parentNode.removeChild(ras_script);";
	content +=  "} catch (e) {} }) ();"


	script.textContent = content;
	
	// firefox should create a head tag if the document does not have one
	// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/head
	window.document.head.appendChild( script );
});

