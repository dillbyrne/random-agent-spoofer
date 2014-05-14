var Panel = require("sdk/panel"),
    Data = require("./Data"),
    Ras = require("./Ras"), 
    Timer = require("./Timer"),
    PrefServ = require("./PrefServ"),
    Notifications = require("./Notifications"),
    loaded = false,
    panel;


exports.init = function(){
  
    panel = Panel.Panel({
        width:450,
        height:350,
        contentURL: Data.get("html/options-panel.html"),
        contentStyleFile: Data.get("css/style.css"),
        contentScriptFile: [
            Data.get("js/set-options.js"),
            Data.get("js/optionspage.js")]  
    });

    panel.on("show",function(){
	  
        //only pass the UA list once
        if (!loaded){
                loaded = true;
                //build the UA list
                panel.port.emit("ua_list",Ras.getProfiles());

                //add listeners to tabs
                panel.port.emit("tab_listener");
        }

        var options = new Array();
        options[0] =  PrefServ.getter("extensions.agentSpoof.timeInterval");
        options[1] =  PrefServ.getter("extensions.agentSpoof.uaChosen");
        options[2] =  PrefServ.getter("extensions.agentSpoof.notify");
        options[3] =  PrefServ.getter("extensions.agentSpoof.fonts");
        options[4] =  PrefServ.getter("extensions.agentSpoof.dom");
        options[5] =  PrefServ.getter("extensions.agentSpoof.tabHistory");
        options[6] =  PrefServ.getter("extensions.agentSpoof.cache");
        options[7] =  PrefServ.getter("extensions.agentSpoof.geo");
        options[8] =  PrefServ.getter("extensions.agentSpoof.xff");
        options[9] =  PrefServ.getter("extensions.agentSpoof.via");
        options[10] = PrefServ.getter("extensions.agentSpoof.ifnone");
        options[11] = PrefServ.getter("extensions.agentSpoof.dns");
        options[12] = PrefServ.getter("extensions.agentSpoof.link");
        options[13] = PrefServ.getter("extensions.agentSpoof.acceptDefault");
        options[14] = PrefServ.getter("extensions.agentSpoof.acceptEncoding");
        options[15] = PrefServ.getter("extensions.agentSpoof.acceptLang");
        options[16] = PrefServ.getter("extensions.agentSpoof.enabled");
		options[17] = PrefServ.getter("extensions.agentSpoof.xffdd");
		options[18] = PrefServ.getter("extensions.agentSpoof.xffip");
		options[19] = PrefServ.getter("extensions.agentSpoof.viadd");
		options[20] = PrefServ.getter("extensions.agentSpoof.viaip");
		options[21] = PrefServ.getter("extensions.agentSpoof.browsingHistory");
        options[22] = PrefServ.getter("extensions.agentSpoof.tzOffset");
        options[23] = PrefServ.getter("extensions.agentSpoof.excludeList");
        panel.port.emit("restore-options",options);

    });

    //count of the total number of profiles, desktop and all (desktop+ others such as mobile,spiders,consoles. etc)
    panel.port.once("randomcount",function(desktop,all){
        PrefServ.setter("extensions.agentSpoof.totalRandomDesktopCount",desktop);
        PrefServ.setter("extensions.agentSpoof.totalRandomAllCount",all);
    });

    
    
    //get the profile ids to be excluded from the random count
    panel.port.on("excludecb",function(profileid,profileindices,checked){
        
        //use indices to check if it is a desktop profile or not
        var indices = profileindices.split(',');

        //check if the profile is to be added or removed
        //act accordingly


        if(checked == true){
            //add profileid to the exclude list
            var exclude_list = [] 
            var list = PrefServ.getter("extensions.agentSpoof.excludeList");
            
            if (list.length == 0){
                exclude_list.push(profileid);
            }
            else{
                exclude_list = list.split(',');
                exclude_list.push(profileid);
            }
            
            PrefServ.setter("extensions.agentSpoof.excludeList",exclude_list.toString());

            //increase count of excluded profiles

            //a desktop profile
            if(indices[0] <4){
                PrefServ.setter("extensions.agentSpoof.randomDesktopCount",PrefServ.getter("extensions.agentSpoof.randomDesktopCount")+1);
            }
            else{ // a mobile ,spider,console,etc profile
                PrefServ.setter("extensions.agentSpoof.randomOtherCount",PrefServ.getter("extensions.agentSpoof.randomOtherCount")+1);
            }

        }else{
            //remove profileid from the exclude list
            var exclude_list = PrefServ.getter("extensions.agentSpoof.excludeList").split(',');
            var index = exclude_list.indexOf(profileid);

            if (index > -1) {
                exclude_list.splice(index, 1);
            }

            PrefServ.setter("extensions.agentSpoof.excludeList",exclude_list.toString());

            //decrease count of excluded profiles

            //a desktop profile
            if(indices[0] <4){
                PrefServ.setter("extensions.agentSpoof.randomDesktopCount",PrefServ.getter("extensions.agentSpoof.randomDesktopCount")-1);
            }
            else{ // a mobile ,spider,console,etc profile
                PrefServ.setter("extensions.agentSpoof.randomOtherCount",PrefServ.getter("extensions.agentSpoof.randomOtherCount")-1);
            }
        }


    });


    //set the timezone offset
    panel.port.on("tzdd",function(value){
        PrefServ.setter("extensions.agentSpoof.tzOffset",value);
    });

	//set the ipdropdown preference for xff or via	
	panel.port.on("ipdd",function(dropdown,preference){
		PrefServ.setter("extensions.agentSpoof."+dropdown,preference);
	});
	
	//set the custom ip value for xff or via
	panel.port.on("validcustomip",function(header,ip){
		PrefServ.setter("extensions.agentSpoof."+header,ip);
	});

	//set the browsing and download history state
	panel.port.on("browsing_downloadscb",function(value){
        PrefServ.setter("extensions.agentSpoof.browsingHistory",value);

        if(PrefServ.getter("extensions.agentSpoof.enabled") == true){
            if (value == true)
                PrefServ.setter("places.history.enabled",!(value));
            else
	            PrefServ.resetter("places.history.enabled");
            }
	});

    // set the users spoofing preference
    // this is an alternative method to toggle the addon state
    // in addition to the quick toggle
    panel.port.on("spoofcb",function(value){
        Ras.setAddonState(value);
    });


    //set the users default (document) accept header preference
    panel.port.on("acceptdcb",function(value){
        Ras.setAcceptHeader("extensions.agentSpoof.acceptDefault","network.http.accept.default",value);
    });

    //set the users encoding accept header preference
    panel.port.on("acceptecb",function(value){
        Ras.setAcceptHeader("extensions.agentSpoof.acceptEncoding","network.http.accept-encoding",value);
    });

    //set the users language accept header preference
    panel.port.on("acceptlcb",function(value){
        Ras.setAcceptHeader("extensions.agentSpoof.acceptLang","intl.accept_languages",value);
    });

    //set the users dns prefetch preference
    panel.port.on("dnscb",function(value){
        PrefServ.setter("extensions.agentSpoof.dns",value);

        if(PrefServ.getter("extensions.agentSpoof.enabled") == true){
            if(value == true)
                PrefServ.setter("network.dns.disablePrefetch",value);
            else
                PrefServ.resetter("network.dns.disablePrefetch");
            }
    });

    //set the users link prefetch preference
    panel.port.on("linkcb",function(value){
        PrefServ.setter("extensions.agentSpoof.link",value);

        if(PrefServ.getter("extensions.agentSpoof.enabled") == true){
            if (value == true)
                PrefServ.setter("network.prefetch-next",!(value));
            else
	            PrefServ.resetter("network.prefetch-next");
            }
    });

    //set the users notification preference
    panel.port.on("notifycb",function(value){
        PrefServ.setter("extensions.agentSpoof.notify",value);
    });

    //set the users xff header preference
    panel.port.on("xffcb",function(value){
        PrefServ.setter("extensions.agentSpoof.xff",value);
    });

    //set the users via header preference
    panel.port.on("viacb",function(value){
        PrefServ.setter("extensions.agentSpoof.via",value);
    });

    //set the users if-none-modified header preference
    panel.port.on("ifnonecb",function(value){
        PrefServ.setter("extensions.agentSpoof.ifnone",value);
    });

    //set the users geo location preference
    panel.port.on("geocb",function(value){
        PrefServ.setter("extensions.agentSpoof.geo",value);

        if(PrefServ.getter("extensions.agentSpoof.enabled") == true){
            if (value == true){
                PrefServ.setter("geo.enabled",!(value));
                PrefServ.setter("geo.wifi.uri","");
            }
            else{
	            PrefServ.resetter("geo.enabled");
	            PrefServ.resetter("geo.wifi.uri");
            }
        }
    });

    //set the users local dom storage preference
    panel.port.on("domcb",function(value){
        PrefServ.setter("extensions.agentSpoof.dom",value);

        if(PrefServ.getter("extensions.agentSpoof.enabled") == true){
            if (value == true)
                PrefServ.setter("dom.storage.enabled",!(value));
            else
	            PrefServ.resetter("dom.storage.enabled");
            }
    });

    //set the users cache preference
    panel.port.on("cachecb",function(value){
        PrefServ.setter("extensions.agentSpoof.cache",value);

        if(PrefServ.getter("extensions.agentSpoof.enabled") == true){
            if (value == true){
                PrefServ.setter("browser.cache.memory.enable", !(value));
	            PrefServ.setter("browser.cache.disk.enable", !(value));
            }else{
	            PrefServ.resetter("browser.cache.memory.enable");
	            PrefServ.resetter("browser.cache.disk.enable");
            }
        }
    });

    // get and set the user's font preference
    panel.port.on("fontscb",function(value){
        PrefServ.setter("extensions.agentSpoof.fonts",value);

        if(PrefServ.getter("extensions.agentSpoof.enabled") == true){
            if (value == true)
                PrefServ.setter("browser.display.use_document_fonts",0);
            else
	            PrefServ.resetter("browser.display.use_document_fonts");
        }
    });

    // get and set the user's session history max preference
    panel.port.on("historycb",function(value){

        PrefServ.setter("extensions.agentSpoof.tabHistory",value);

        if(PrefServ.getter("extensions.agentSpoof.enabled") == true){
            if (value == true)
                PrefServ.setter("browser.sessionhistory.max_entries",2);
            else
	            PrefServ.resetter("browser.sessionhistory.max_entries");
            }
    });

    //get the user's timer and ua choice 
    panel.port.on("uachange",function(ua_choice,interval){

        //save the options
        PrefServ.setter("extensions.agentSpoof.timeInterval",interval);
        PrefServ.setter("extensions.agentSpoof.uaChosen",ua_choice);

        //check if the user has the addon enabled
        //if so have the changes made take effect immediately
        if(PrefServ.getter("extensions.agentSpoof.enabled") == true){

	       //clear timer
           Timer.clearTimer();

	       //set the timer if the user has opted to use it and a random ua was chosen
            if((PrefServ.getter("extensions.agentSpoof.timeInterval") != "none" && PrefServ.getter("extensions.agentSpoof.timeInterval") != "request") 
				&& PrefServ.getter("extensions.agentSpoof.uaChosen").slice(0,6) == "random"){
                Ras.startRandomTimer();
	        }
            else{
	            Ras.setupAndAssignProfile();
	        }
        }
    });

};

exports.get = function(){
  return panel;
};
