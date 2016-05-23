/*Based up on the work done by kkapsner in canvas blocker */

(function(){

	const {utils: Cu} = Components;
	const {require} = Cu.import("resource://gre/modules/commonjs/toolkit/require.js", {});
	const {intercept} = require("../../lib/intercept.js");	
	var frameScriptEnabled = true, 
	context = this;

	function interceptWrapper(ev){
		
		// Only run if script injection has been enabled and the
		// frame script has not been unloaded
		if (frameScriptEnabled && sendSyncMessage("RAS-scriptInjection")[0]){
			// window is only equal to content for the top window. For susequent
			// calls (e.g. iframe windows) the new generated window has to be 
			// used.
			
			var window = ev.target.defaultView;
			intercept({subject: window},sendSyncMessage("RAS-frameOptions")[0]);
			
		}
	}

	addEventListener("DOMWindowCreated", interceptWrapper);
	addEventListener("unload", function(ev){

		if (ev.target === context){
			removeEventListener("DOMWindowCreated", interceptWrapper);
		}
	});
	
	addMessageListener("RAS-unload", function unload(){
		frameScriptEnabled = false;
		removeEventListener("DOMWindowCreated", interceptWrapper);
		removeMessageListener("RAS-unload", unload);
	});

}());
