self.port.on("inject", function( params) {

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



	var content = "(function (){try{"  
	

	// time zone offset
	content +=  "Object.defineProperty( Date.prototype, 'getTimezoneOffset', {value: function(){return "+params[0]+";}});";


	// screen & window prefrences
	if(params[1] != null){ 

 		content +=  "Object.defineProperty( screen, 'width', {value: "+params[1]+"});";
		content +=  "Object.defineProperty( screen, 'height', {value: "+params[2]+"});";
		content +=  "Object.defineProperty( screen, 'availWidth', {value: "+params[3]+"});";
		content +=  "Object.defineProperty( screen, 'availHeight', {value: "+params[4]+"});";
		content +=  "Object.defineProperty( window, 'innerWidth', {value: "+params[5]+"});";
		content +=  "Object.defineProperty( window, 'innerHeight', {value: "+params[6]+"});";
		content +=  "Object.defineProperty( window, 'outerWidth', {value: "+params[7]+"});";
		content +=  "Object.defineProperty( window, 'outerHeight', {value: "+params[8]+"});";
	  //content +=  "Object.defineProperty( screen, 'colorDepth', {value: "+params[9]+"});";

	    content +=  "Object.defineProperty( window, 'open', {value: function(url,name,paramaters){var winOpen = Window.prototype.open;var win = winOpen.call(this, url, name, paramaters);"+copyWinAttribs("win", "win.opener")+"return win;}});";

	}

	//remove script after modifications to prevent sites from reading it
	content += "var ras_script = document.getElementsByTagName('script')[0]; ras_script.parentNode.removeChild(ras_script);";
	content +=  "} catch (e) {} }) ();"


	script.innerHTML = content;
	
	// firefox should create a head tag if the document does not have one
	// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/head
	window.document.head.appendChild( script );
});

