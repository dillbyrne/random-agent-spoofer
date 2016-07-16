var PrefServ = require('./PrefServ');

exports.defineProp = function(window, obj, prop, val) {
	
		Object.defineProperty(window.wrappedJSObject[obj].prototype,
			prop,
			{
				enumerable: true,
				configurable: false,
				value: val	
			});
};

//get a random number from 0 - maximum
exports.getRandomNum = function (maximum) {
	return Math.round(Math.random() * maximum)
};


//check if a url is in the list
//if so whitelist options are checked for that url
exports.listCheck = function (url, listStates) {
	
	//act as if there are no WL entries while the whitelist is disabled
	if(PrefServ.getter('extensions.agentSpoof.whiteListDisabled')){
		resetListStates(listStates);
		return false;
	}
	
	//prevent empty window urls from overriding the list states
	if (url.length == 0)
		return false;
	
	//reset the previous entries
	resetListStates(listStates); 



	var wlist = JSON.parse(PrefServ.getter('extensions.agentSpoof.fullWhiteList'));

	for (var i = 0, len = wlist.length ; i < len ; i++) {

		if (url.indexOf(wlist[i].url) > -1){
			//check the config for the url now confirmed to be in the list
			checkWhiteListConfig(wlist[i], listStates);
			return true;
		}
	}

	return false;
}


//check for header related whitelist options
function checkWhiteListConfig(wlEntry, listStates) {

	if (wlEntry.options) {

		for (var s in listStates){
			if(wlEntry.options.indexOf(s) > -1)
				listStates[s] = true;
			console.error(s +" "+ listStates[s]);
		}

	}
}


// (Re)set whitelist values to false¬
function resetListStates(states) {
	
	for (var i in states) {
		states[i] = false;
	}

}


