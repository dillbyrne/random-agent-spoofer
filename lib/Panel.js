var Panel = require("sdk/panel"),
    Data = require("./Data"),
    Ras = require("./Ras"), 
    Timer = require("./Timer"),
    PrefServ = require("./PrefServ"),
    Tabs = require("./Tabs"),
    Notifications = require("./Notifications"),
    PageMod = require("./PageMod"),
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
	  
        //only set panel content manually at first run.

        if (!loaded){

                loaded = true;

                //build the UA list
                panel.port.emit("ua_list",Ras.getProfiles());

                //add listeners to tabs
                panel.port.emit("tab_listener");


                //set check boxes
                panel.port.emit("setCheckBox",PrefServ.getter("extensions.agentSpoof.uaChosen"),true);
                panel.port.emit("setCheckBox","notify",PrefServ.getter("extensions.agentSpoof.notify"));
                panel.port.emit("setCheckBox","fonts",PrefServ.getter("extensions.agentSpoof.fonts"));
                panel.port.emit("setCheckBox","dom",PrefServ.getter("extensions.agentSpoof.dom"));
                panel.port.emit("setCheckBox","history",PrefServ.getter("extensions.agentSpoof.tabHistory"));
                panel.port.emit("setCheckBox","cache",PrefServ.getter("extensions.agentSpoof.cache"));
                panel.port.emit("setCheckBox","geo",PrefServ.getter("extensions.agentSpoof.geo"));
                panel.port.emit("setCheckBox","dns",PrefServ.getter("extensions.agentSpoof.dns"));
                panel.port.emit("setCheckBox","link",PrefServ.getter("extensions.agentSpoof.link"));
                panel.port.emit("setCheckBox","xff",PrefServ.getter("extensions.agentSpoof.xff"));
                panel.port.emit("setCheckBox","via",PrefServ.getter("extensions.agentSpoof.via"));
                panel.port.emit("setCheckBox","ifnone",PrefServ.getter("extensions.agentSpoof.ifnone"));
                panel.port.emit("setCheckBox","acceptd",PrefServ.getter("extensions.agentSpoof.acceptDefault"));
                panel.port.emit("setCheckBox","accepte",PrefServ.getter("extensions.agentSpoof.acceptEncoding"));
                panel.port.emit("setCheckBox","acceptl",PrefServ.getter("extensions.agentSpoof.acceptLang"));
                panel.port.emit("setCheckBox","spoof",PrefServ.getter("extensions.agentSpoof.enabled"));
                panel.port.emit("setCheckBox","webgl",PrefServ.getter("extensions.agentSpoof.webGl"));
                panel.port.emit("setCheckBox","winname",PrefServ.getter("extensions.agentSpoof.windowName"));
                panel.port.emit("setCheckBox","canvas",PrefServ.getter("extensions.agentSpoof.canvas"));
                panel.port.emit("setCheckBox","webrtc",PrefServ.getter("extensions.agentSpoof.webRTC"));
                panel.port.emit("setCheckBox","auth",PrefServ.getter("extensions.agentSpoof.authorization"));
                panel.port.emit("setCheckBox","browsing_downloads",PrefServ.getter("extensions.agentSpoof.browsingHistory"));
                panel.port.emit("setCheckBox","whitelist_disabled",PrefServ.getter("extensions.agentSpoof.whiteListDisabled"));

                //set dropdowns
                panel.port.emit("setSelectedIndexByValue","timerdd",PrefServ.getter("extensions.agentSpoof.timeInterval"));
                panel.port.emit("setSelectedIndexByValue","xffdd",PrefServ.getter("extensions.agentSpoof.xffdd"));
                panel.port.emit("setSelectedIndexByValue","viadd",PrefServ.getter("extensions.agentSpoof.viadd"));
                panel.port.emit("setSelectedIndexByValue","tzdd",PrefServ.getter("extensions.agentSpoof.tzdd"));
                panel.port.emit("setSelectedIndexByValue","dntdd",PrefServ.getter("extensions.agentSpoof.dnt"));
                panel.port.emit("setSelectedIndexByValue","refdd",PrefServ.getter("extensions.agentSpoof.referer"));
                panel.port.emit("setSelectedIndexByValue","screendd",PrefServ.getter("extensions.agentSpoof.screenSize"));



                //set Whitelist profile inputs
                panel.port.emit("setTextInputValue","useragent_input",PrefServ.getter("extensions.agentSpoof.whiteListUserAgent"));
                panel.port.emit("setTextInputValue","appcodename_input",PrefServ.getter("extensions.agentSpoof.whiteListAppCodeName"));
                panel.port.emit("setTextInputValue","appname_input",PrefServ.getter("extensions.agentSpoof.whiteListAppName"));
                panel.port.emit("setTextInputValue","appversion_input",PrefServ.getter("extensions.agentSpoof.whiteListAppVersion"));
                panel.port.emit("setTextInputValue","vendor_input",PrefServ.getter("extensions.agentSpoof.whiteListVendor"));
                panel.port.emit("setTextInputValue","vendorsub_input",PrefServ.getter("extensions.agentSpoof.whiteListVendorSub"));
                panel.port.emit("setTextInputValue","platform_input",PrefServ.getter("extensions.agentSpoof.whiteListPlatform"));
                panel.port.emit("setTextInputValue","oscpu_input",PrefServ.getter("extensions.agentSpoof.whiteListOsCpu"));
                panel.port.emit("setTextInputValue","acceptdefault_input",PrefServ.getter("extensions.agentSpoof.whiteListAccept"));
                panel.port.emit("setTextInputValue","acceptencoding_input",PrefServ.getter("extensions.agentSpoof.whiteListAcceptEncoding"));
                panel.port.emit("setTextInputValue","acceptlanguage_input",PrefServ.getter("extensions.agentSpoof.whiteListAcceptLanguage"));


                //set exclude list
                panel.port.emit("setMultiCheckBox",PrefServ.getter("extensions.agentSpoof.excludeList"));  
        }

                //set ip inputs
                panel.port.emit("setElementValue","xffip",PrefServ.getter("extensions.agentSpoof.xffip"));
                panel.port.emit("setElementValue","viaip",PrefServ.getter("extensions.agentSpoof.viaip"));

                //set whitelist content
                panel.port.emit("setSiteList","site_whitelist",PrefServ.getter("extensions.agentSpoof.fullWhiteList"));

    });

    //count of the total number of profiles, desktop and all (desktop+ others such as mobile,spiders,consoles. etc)
    //used for excluding profiles from random selection
    panel.port.once("randomcount",function(desktop,all){
        PrefServ.setter("extensions.agentSpoof.totalRandomDesktopCount",desktop);
        PrefServ.setter("extensions.agentSpoof.totalRandomAllCount",all);
    });
    
    panel.port.on("wlhelp",function(){
        Tabs.openHelpURL();
    });

    panel.port.on("whitelist",function(list,fullWhiteList,siteWhiteList){
      
        //array of urls for faster lookups
        PrefServ.setter("extensions.agentSpoof.siteWhiteList",siteWhiteList); 

        // full whitelist object containing per site configs
        PrefServ.setter("extensions.agentSpoof.fullWhiteList",fullWhiteList);

        //put fullwhitelist in memory to save time when checking for whitelist lookups
        Ras.setFullWhiteList(PrefServ.getter("extensions.agentSpoof.fullWhiteList")); 

    });

    panel.port.on("whitelist_disabledcb",function(value){
        PrefServ.setter("extensions.agentSpoof.whiteListDisabled",value);
    });

    //get whitelist browser profile
    panel.port.on("wl_prof",function(wl_profile){

        PrefServ.setter("extensions.agentSpoof.whiteListUserAgent", wl_profile[0]);
        PrefServ.setter("extensions.agentSpoof.whiteListAppCodeName", wl_profile[1]);
        PrefServ.setter("extensions.agentSpoof.whiteListAppName", wl_profile[2]);
        PrefServ.setter("extensions.agentSpoof.whiteListAppVersion", wl_profile[3]);
        PrefServ.setter("extensions.agentSpoof.whiteListVendor", wl_profile[4]);
        PrefServ.setter("extensions.agentSpoof.whiteListVendorSub", wl_profile[5]);
        PrefServ.setter("extensions.agentSpoof.whiteListPlatform", wl_profile[6]);
        PrefServ.setter("extensions.agentSpoof.whiteListOsCpu", wl_profile[7]);
        PrefServ.setter("extensions.agentSpoof.whiteListAccept", wl_profile[8]);
        PrefServ.setter("extensions.agentSpoof.whiteListAcceptEncoding", wl_profile[9]);
        PrefServ.setter("extensions.agentSpoof.whiteListAcceptLanguage", wl_profile[10]);

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

    //set webgl pref
    panel.port.on("webglcb",function(value){
        PrefServ.setter("extensions.agentSpoof.webGl",value);

        if(PrefServ.getter("extensions.agentSpoof.enabled") == true){
            if (value == true)
                PrefServ.setter("webgl.disabled",value);
            else
                PrefServ.resetter("webgl.disabled");
            }
    });


    //set webrtc pref
    panel.port.on("webrtccb",function(value){
        PrefServ.setter("extensions.agentSpoof.webRTC",value);

        if(PrefServ.getter("extensions.agentSpoof.enabled") == true){
            if (value == true)
                PrefServ.setter("media.peerconnection.enabled",!(value));
            else
                PrefServ.resetter("media.peerconnection.enabled");
            }
    });

    //set pdfjs pref
    panel.port.on("pdfjscb",function(value){
        PrefServ.setter("extensions.agentSpoof.pdfjs",value);

        if(PrefServ.getter("extensions.agentSpoof.enabled") == true){
            if (value == true)
                PrefServ.setter("pdfjs.disabled",value);
            else
                PrefServ.resetter("pdfjs.disabled");
            }
    });

    //set search suggest pref
    panel.port.on("search_suggestcb",function(value){
        PrefServ.setter("extensions.agentSpoof.searchsuggest",value);

        if(PrefServ.getter("extensions.agentSpoof.enabled") == true){
            if (value == true)
                PrefServ.setter("browser.search.suggest.enabled",!(value));
            else
                PrefServ.resetter("browser.search.suggest.enabled");
            }
    });

    //set the timezone offset
    panel.port.on("tzdd",function(value){
        PrefServ.setter("extensions.agentSpoof.tzOffset",value);
    });

    //set the spoofed screen choice
    panel.port.on("screendd",function(value){
        PrefServ.setter("extensions.agentSpoof.screenSize",value);
    });

    //set the referer header pref
    panel.port.on("refdd",function(value){
        PrefServ.setter("extensions.agentSpoof.referer",value);
    });

    //set the DNT header pref
    panel.port.on("dntdd",function(value){
        PrefServ.setter("extensions.agentSpoof.dnt",value);
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


    // Set Window.name protection preference
    panel.port.on("winnamecb",function(value){
        PrefServ.setter("extensions.agentSpoof.windowName",value);
    });

    // Set preference to disable canvas support
    panel.port.on("canvascb",function(value){
        PrefServ.setter("extensions.agentSpoof.canvas",value);
    });


    // Set Authentication header sending preference
    panel.port.on("authcb",function(value){
        PrefServ.setter("extensions.agentSpoof.authorization",value);
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
