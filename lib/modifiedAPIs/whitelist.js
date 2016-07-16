var PrefServ = require('../PrefServ'),
utils = require('../Utils');

function getWhiteListAttributes() {

	return { 
		'userAgent': PrefServ.getter('extensions.agentSpoof.whiteListUserAgent'),
		'appCodeName': PrefServ.getter('extensions.agentSpoof.whiteListAppCodeName'),
		'appName': PrefServ.getter('extensions.agentSpoof.whiteListAppName'),
		'appVersion' : PrefServ.getter('extensions.agentSpoof.whiteListAppVersion'),
		'vendor' : PrefServ.getter('extensions.agentSpoof.whiteListVendor'),
		'vendorSub' : PrefServ.getter('extensions.agentSpoof.whiteListVendorSub'),
		'platform' : PrefServ.getter('extensions.agentSpoof.whiteListPlatform'),
		'oscpu' : PrefServ.getter('extensions.agentSpoof.whiteListOsCpu')
	};
};

exports.whiteListHandler = function(window) {
	
	//only use whitelisted profile if the real profile is not selected	
	if(PrefServ.getter('extensions.agentSpoof.uaChosen') != 'default'){

		var wl = getWhiteListAttributes();
		utils.defineProp(window,"Navigator","userAgent",wl.userAgent);
		utils.defineProp(window,"Navigator","appCodeName",wl.appCodeName);
		utils.defineProp(window,"Navigator","appName",wl.appName);
		utils.defineProp(window,"Navigator","appVersion",wl.appVersion);
		utils.defineProp(window,"Navigator","vendor",wl.vendor);
		utils.defineProp(window,"Navigator","vendorSub",wl.vendorSub);
		utils.defineProp(window,"Navigator","platform",wl.platform);
		utils.defineProp(window,"Navigator","oscpu",wl.oscpu);
	}
};
