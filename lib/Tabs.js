var Tabs = require("sdk/tabs");


exports.openURL = function(site){

	Tabs.open({
  		url: site
	});
}

/*exports.getActiveTabURL = function(){
	return Tabs.activeTab.url;
}

exports.getAndSplitURL = function() {

    var url = Tabs.activeTab.url;

    var res;
    var prefix;
    var base;
    var path;
    
    res = url.split("://");
    prefix = res[0]+"://";
    base = res[1].split('/')[0];    
    path = url.slice(prefix.length+base.length,url.length);
    
    res = [prefix,base,path];
 
    return res;
}*/