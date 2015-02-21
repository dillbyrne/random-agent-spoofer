var Tabs = require("sdk/tabs");


exports.openURL = function(site){

	Tabs.open({
  		url: site
	});
}
