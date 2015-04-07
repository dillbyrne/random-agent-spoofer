var Panel = require("sdk/panel"),
    Data = require("./Data"),
    Ras = require("./Ras"), 
    PrefServ = require("./PrefServ"),
    Tabs = require("./Tabs"),
    Notifications = require("./Notifications"),
    localization = require("./Localization"),
    PageMod = require("./PageMod"),
    loaded = false,
    panel;


exports.init = function(){
  
    panel = Panel.Panel({
        width:450,
        height:450,
        contentURL: Data.get("html/options-panel.html"),
        contentStyleFile: Data.get("css/style.css"),
        contentScriptFile: [
            Data.get("js/set-options.js"),
            Data.get("js/optionspage.js")]  
    });

    panel.on("show",function(){
	  
        //Only update what we need on show

        //set ip inputs
        panel.port.emit("setElementValue","xffip",PrefServ.getter("extensions.agentSpoof.xffip"));
        panel.port.emit("setElementValue","viaip",PrefServ.getter("extensions.agentSpoof.viaip"));

        //set whitelist content
        panel.port.emit("setElementValue","site_whitelist",PrefServ.getter("extensions.agentSpoof.fullWhiteList"));

    });
    
    //initialize prefs before panel so we can preload panel before the user clicks it
    PrefServ.createPrefs();
    setupPanel();

    function setupPanel(){
        
        var localized_strings = [
            localization.getString("exclude_id"),
            localization.getString("random_id")
        ];

        //build the UA list
        panel.port.emit("ua_list",Ras.getProfiles(),localized_strings);

        //add listeners to tabs
        panel.port.emit("tab_listener");

        //set check boxes
        panel.port.emit("setCheckBox",PrefServ.getter("extensions.agentSpoof.uaChosen"),true);
        panel.port.emit("setCheckBox","fonts",(PrefServ.getter("browser.display.use_document_fonts") === 0 ? true:false));
        panel.port.emit("setCheckBox","dom",!(PrefServ.getter("dom.storage.enabled")));
        panel.port.emit("setCheckBox","tab_history",(PrefServ.getter("extensions.agentSpoof.limitTab")));
        panel.port.emit("setCheckBox","cache_memory",!(PrefServ.getter("browser.cache.memory.enable")));
        panel.port.emit("setCheckBox","cache_disk",!(PrefServ.getter("browser.cache.disk.enable")));
        panel.port.emit("setCheckBox","cache_network",!(PrefServ.getter("network.http.use-cache")));
        panel.port.emit("setCheckBox","geo",!(PrefServ.getter("geo.enabled")));
        panel.port.emit("setCheckBox","dns",PrefServ.getter("network.dns.disablePrefetch"));
        panel.port.emit("setCheckBox","link",!(PrefServ.getter("network.prefetch-next")));
        panel.port.emit("setCheckBox","dnt",PrefServ.getter("privacy.donottrackheader.enabled"));
        panel.port.emit("setCheckBox","xff",PrefServ.getter("extensions.agentSpoof.xff"));
        panel.port.emit("setCheckBox","via",PrefServ.getter("extensions.agentSpoof.via"));
        panel.port.emit("setCheckBox","ifnone",PrefServ.getter("extensions.agentSpoof.ifnone"));
        panel.port.emit("setCheckBox","acceptd",PrefServ.getter("extensions.agentSpoof.acceptDefault"));
        panel.port.emit("setCheckBox","accepte",PrefServ.getter("extensions.agentSpoof.acceptEncoding"));
        panel.port.emit("setCheckBox","acceptl",PrefServ.getter("extensions.agentSpoof.acceptLang"));
        panel.port.emit("setCheckBox","webgl",PrefServ.getter("webgl.disabled"));
        panel.port.emit("setCheckBox","winname",PrefServ.getter("extensions.agentSpoof.windowName"));
        panel.port.emit("setCheckBox","canvas",PrefServ.getter("extensions.agentSpoof.canvas"));
        panel.port.emit("setCheckBox","webrtc",!(PrefServ.getter("media.peerconnection.enabled")));
        panel.port.emit("setCheckBox","auth",PrefServ.getter("extensions.agentSpoof.authorization"));
        panel.port.emit("setCheckBox","browsing_downloads",!(PrefServ.getter("places.history.enabled")));
        panel.port.emit("setCheckBox","whitelist_disabled",PrefServ.getter("extensions.agentSpoof.whiteListDisabled"));
        panel.port.emit("setCheckBox","pdfjs",PrefServ.getter("pdfjs.disabled"));
        panel.port.emit("setCheckBox","search_suggest",!(PrefServ.getter("browser.search.suggest.enabled")));
        panel.port.emit("setCheckBox","dom_performance",!(PrefServ.getter("dom.enable_performance")));
        panel.port.emit("setCheckBox","dom_battery",!(PrefServ.getter("dom.battery.enabled")));
        panel.port.emit("setCheckBox","dom_gamepad",!(PrefServ.getter("dom.gamepad.enabled")));
        panel.port.emit("setCheckBox","clicktoplay",(PrefServ.getter("plugins.click_to_play")));
        panel.port.emit("setCheckBox","mixed_content_active",(PrefServ.getter("security.mixed_content.block_active_content")));
        panel.port.emit("setCheckBox","mixed_content_display",(PrefServ.getter("security.mixed_content.block_display_content")));
        panel.port.emit("setCheckBox","scriptinjection",PrefServ.getter("extensions.agentSpoof.scriptInjection"));

        //set dropdowns
        panel.port.emit("setSelectedIndexByValue","timerdd",PrefServ.getter("extensions.agentSpoof.timeInterval"));
        panel.port.emit("setSelectedIndexByValue","xffdd",PrefServ.getter("extensions.agentSpoof.xffdd"));
        panel.port.emit("setSelectedIndexByValue","viadd",PrefServ.getter("extensions.agentSpoof.viadd"));
        panel.port.emit("setSelectedIndexByValue","tzdd",PrefServ.getter("extensions.agentSpoof.tzdd"));
        panel.port.emit("setSelectedIndexByValue","refdd",PrefServ.getter("extensions.agentSpoof.referer"));
        panel.port.emit("setSelectedIndexByValue","screendd",PrefServ.getter("extensions.agentSpoof.screenSize"));
        panel.port.emit("setSelectedIndexByValue","tzdd",PrefServ.getter("extensions.agentSpoof.tzOffset"));

        //set Whitelist profile inputs
        panel.port.emit("setElementValue","useragent_input",PrefServ.getter("extensions.agentSpoof.whiteListUserAgent"));
        panel.port.emit("setElementValue","appcodename_input",PrefServ.getter("extensions.agentSpoof.whiteListAppCodeName"));
        panel.port.emit("setElementValue","appname_input",PrefServ.getter("extensions.agentSpoof.whiteListAppName"));
        panel.port.emit("setElementValue","appversion_input",PrefServ.getter("extensions.agentSpoof.whiteListAppVersion"));
        panel.port.emit("setElementValue","vendor_input",PrefServ.getter("extensions.agentSpoof.whiteListVendor"));
        panel.port.emit("setElementValue","vendorsub_input",PrefServ.getter("extensions.agentSpoof.whiteListVendorSub"));
        panel.port.emit("setElementValue","platform_input",PrefServ.getter("extensions.agentSpoof.whiteListPlatform"));
        panel.port.emit("setElementValue","oscpu_input",PrefServ.getter("extensions.agentSpoof.whiteListOsCpu"));
        panel.port.emit("setElementValue","acceptdefault_input",PrefServ.getter("extensions.agentSpoof.whiteListAccept"));
        panel.port.emit("setElementValue","acceptencoding_input",PrefServ.getter("extensions.agentSpoof.whiteListAcceptEncoding"));
        panel.port.emit("setElementValue","acceptlanguage_input",PrefServ.getter("extensions.agentSpoof.whiteListAcceptLanguage"));

        //set exclude list
        panel.port.emit("setMultiCheckBox",PrefServ.getter("extensions.agentSpoof.excludeList"));  

        //set ip inputs
        panel.port.emit("setIPDDValues","xffip",PrefServ.getter("extensions.agentSpoof.xffip"));
        panel.port.emit("setIPDDValues","viaip",PrefServ.getter("extensions.agentSpoof.viaip"));

        //set whitelist content
        panel.port.emit("setElementValue","site_whitelist",PrefServ.getter("extensions.agentSpoof.fullWhiteList"));
    };

    panel.port.on("customlink",function(url){
        Tabs.openURL(url);
    });

    panel.port.on("whitelist",function(list,fullWhiteList,siteWhiteList){
      
        //array of urls for faster lookups
        PrefServ.setter("extensions.agentSpoof.siteWhiteList",siteWhiteList); 

        // full whitelist object containing per site configs
        PrefServ.setter("extensions.agentSpoof.fullWhiteList",fullWhiteList);

        //put fullwhitelist in memory to save time when checking for whitelist lookups
        Ras.setFullWhiteList(PrefServ.getter("extensions.agentSpoof.fullWhiteList")); 

    });

    //get the profile ids to be excluded from the random selection
    panel.port.on("excludecb",function(profileid,profileindices,checked){
        
        //use indices to check if it is a desktop profile or not and platform family
        var indices = profileindices.split(',');

        //create profile exclusion counter object
        var prof = JSON.parse(PrefServ.getter("extensions.agentSpoof.exclusionCount"));


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
            if(indices[0] == Ras.getDeskIndex()){
                prof["desktop"].exclude_count++;
           
            } // a mobile profile
            else if(indices[0] == Ras.getMobileIndex()){
                prof["mobile"].exclude_count++;
            }
            else{ //other profile (console)
                prof["other"].exclude_count++;
            }

            //increase specific profile count
            prof["random_"+indices[0]+","+indices[1]].exclude_count++;


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
            if(indices[0] == Ras.getDeskIndex()){
                prof["desktop"].exclude_count--;
            }
            // a mobile profile
            else if(indices[0] == Ras.getMobileIndex()){
                prof["mobile"].exclude_count--;
            }
            else{ //other profile (console)
                prof["other"].exclude_count--;
            }

            //decrease specific profile count.
            prof["random_"+indices[0]+","+indices[1]].exclude_count--;
        }

        //save the updated exclusion count
        PrefServ.setter("extensions.agentSpoof.exclusionCount",JSON.stringify(prof));
    });

    //store a preferences value
    panel.port.on("setPrefValue",function(pref,value){
        PrefServ.setter(pref,value);
    });

    //store the accept header prefs
    panel.port.on("setAcceptHeader",function(raspref,ffpref,value){
        Ras.setAcceptHeader(raspref,ffpref,value);
    });

    // get and set the user's font preference
    panel.port.on("fonts",function(value){
        PrefServ.setter("browser.display.use_document_fonts",(value === true ? 0:1));
    });

    //get the user's timer and profile choice 
    panel.port.on("uachange",function(ua_choice,interval){
        PrefServ.setter("extensions.agentSpoof.timeInterval",interval);
        PrefServ.setter("extensions.agentSpoof.uaChosen",ua_choice);
    });

};

exports.getPanel = function(){
    return panel;
};