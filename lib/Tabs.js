var Tabs = require("sdk/tabs");


exports.openHelpURL = function(){

	Tabs.open({
  		url: "https://github.com/dillbyrne/random-agent-spoofer/wiki/"
	});
}

