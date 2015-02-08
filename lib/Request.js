var {XMLHttpRequest} = require("sdk/net/xhr"),
request = new XMLHttpRequest(),
Notifications = require("./Notifications"),
PrefServ = require("./PrefServ"),
Tabs = require("./Tabs"),
localization = require("./Localization"),
self = require("sdk/self");



exports.checkForUpdates = function(){

		//get the list of releases
        request.open("GET", "https://api.github.com/repos/dillbyrne/random-agent-spoofer/releases", false);
        request.send(null);  

        if (request.status === 200) {  

          	//parse the response
            var response = JSON.parse(request.responseText);

            //we are only interested in stable releasese not prereleases
            if (response[0].prerelease == false){

            	//check if the current version up to date
	            if ( self.version < response[0].tag_name ){
	            	
	            	Notifications.sendMsg(localization.getString("update_available_id"));
	            	
	            	// if the user has chosen to download updates automatically we open the update
	            	// url in a new tab which will start the download 
	            	if( PrefServ.getter("extensions.jid1-AVgCeF1zoVzMjA@jetpack.download_updates") === true){
	            		Tabs.openURL(response[0].assets[0].browser_download_url);
	            	}
	            	else{
	            		// otherwise we simply open the release page and let the user manually download the release
	            		// this is the default option
	            		Tabs.openURL(response[0].html_url);
	            	}

	            }
	        }

        }  
}
