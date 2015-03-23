var ActionButton = require("./ActionButton"),
    Data = require("./Data"),
    Chrome = require("./Chrome"),
    PageMod = require("./PageMod"),
    PrefServ = require("./PrefServ"),
    Timer = require("./Timer"),
    ContextMenu = require("./ContextMenu"),
    localization = require("./Localization"),
    Notifications = require("./Notifications"),
    profData = Data.loadJSON("json/useragents.json"), //profile list
    fullWhiteList, //stores the full json data for whitelisting functionality such as canvas
    currentRandomIndices = null; //current randomly selected browser profile
    deskIndex = getAttributeIndex(profData,"desktop"), //desktop index in the json
    mobileIndex = getAttributeIndex(profData,"mobile"), //mobile index in the json



exports.init = function() {

    ContextMenu.setPlatformItems(createPlatfromContextMenuItems());

    //set inital icons and labels
    ActionButton.toggleIconAndLabel();
    ContextMenu.setProfileIcons(PrefServ.getter("extensions.agentSpoof.uaChosen"));
    ContextMenu.setTimerIcons(PrefServ.getter("extensions.agentSpoof.timeInterval"));
    ContextMenu.showMenu( PrefServ.getter("extensions.jid1-AVgCeF1zoVzMjA@jetpack.show_context_menu") );


    Chrome.getObserver().register();

    PageMod.init(); 

    //set initial profile and timer options
    setupProfileAndTimer();

    //set whitlist 
    fullWhiteList = JSON.parse(PrefServ.getter("extensions.agentSpoof.fullWhiteList")); 
};

exports.getProfiles = function(){
    return profData;
};

exports.setAcceptHeader = function(header_pref,header_override,spoofHeader){

    PrefServ.setter(header_pref,spoofHeader);
  
    if(PrefServ.getter("extensions.agentSpoof.uaChosen") != "default"){
  
        if(spoofHeader == true){
      
            var indices="";

            //check if a random option is currently chosen
            if(PrefServ.getter("extensions.agentSpoof.uaChosen").slice(0,6) == "random"){
	           //get the currently selected random indices.
	           indices = currentRandomIndices.split(",");
            }else{
	           //get the specific selected indices
	           indices = PrefServ.getter("extensions.agentSpoof.uaChosen").split(",");
            }
	
        //get the value from the profile at the specified indices and set the value
	    PrefServ.setter(header_override,profData[indices[0]].list[indices[1]].useragents[indices[2]]["accept_"+header_pref.slice(28).toLowerCase()]);	
    }
    else
        PrefServ.resetter(header_override);
  }
};

function startTimer(){
  
    //get the time based on the selected interval
    var time = getInterval(PrefServ.getter("extensions.agentSpoof.timeInterval"));
    //Set User Agent
    prepareAndSetAgentInfo();
    //start timer
    Timer.setTimedFunc(startTimer,time);
};

exports.profileAndTimerSetup = function(){
    setupProfileAndTimer();
};

//Generate a random but valid ip
//Returns an ip address
exports.getRandomIP = function(){
  
    //first block of the invalid ips 
    //This will remove the invalid ranges and leave us with more than enough
    //ips for the purpose of spoofing the forward and via headers
    var invalidIPs = [0,10,100,127,169,172,192,198,203,224,225,226,227,228,229,230,
                231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,
                247,248,249,250,251,252,253,254,255];
  
    var ip ="";
  
    for (var i =0; i<4; i++){
        var temp =""; 
        
        do{
            temp = getRandomNum(255);
        }while(i == 0 && invalidIPs.indexOf(temp) != -1);
    
        if(i != 3)
            temp+=".";
        
        ip+=temp;
    }
    return ip;
};

//Check if the selected profile is random or not
//Set a random one if it is
//Parse and set the specified one if not
function prepareAndSetAgentInfo(){ 

    var ttip; //temp tooltip
    var changed = false;
    var excludeCount = JSON.parse(PrefServ.getter("extensions.agentSpoof.exclusionCount"));
    var uaChosen = PrefServ.getter("extensions.agentSpoof.uaChosen");
    var exclude_list = PrefServ.getter("extensions.agentSpoof.excludeList").split(',');

    console.log(uaChosen);

    if( uaChosen == "random"){

        //check that the user has not excluded all the profiles
        //if so show a notification
        if ( excludeCount["other"].exclude_count + excludeCount["mobile"].exclude_count + excludeCount["desktop"].exclude_count 
            < excludeCount["other"].total_count + excludeCount["mobile"].total_count + excludeCount["desktop"].total_count ){

            do{
                
                //get a random profile
                var listTypeRandNum = getRandomNum(profData.length -1)
                var listRandNum = getRandomNum(profData[listTypeRandNum].list.length -1);
                var profileRandNum = getRandomNum(profData[listTypeRandNum].list[listRandNum].useragents.length -1);
          
           //check if the randomly chosen profile is in the exclude list
            }while ( exclude_list.indexOf(profData[listTypeRandNum].list[listRandNum].useragents[profileRandNum].profileID) != -1 );

            //setup the profile and set a localized tooltip and notification
            ttip = setProfile(listTypeRandNum,listRandNum,profileRandNum,true,
                localization.getString("spoofing_enabled_id")+"\n"
                +localization.getString("disable_spoofing_id")+"\n"
                +localization.getString("random_notification_prefix_id")+ " ",
                localization.getString("browser_profile_changed_id")+"\n"
                +localization.getString("random_notification_prefix_id") + " ");

            changed = true;

        }else{
            Notifications.sendMsg(localization.getString("unable_to_change_random_profile_id")+"\n"
                +localization.getString("all_profiles_excluded_id")+"\n"
                +localization.getString("profile_unchanged_id"));
        }
    
    }else if( uaChosen == "random_desktop"){

        //check that the user has not excluded all the desktop profiles
        //if so show a notification
        if (excludeCount["desktop"].exclude_count < excludeCount["desktop"].total_count){

            do{

                //get a random user agent from the desktop options only
                var listRandNum = getRandomNum(profData[deskIndex].list.length -1);
                var profileRandNum = getRandomNum(profData[deskIndex].list[listRandNum].useragents.length -1);

       
            //check if the randomly chosen profile is in the exclude list
            }while( exclude_list.indexOf(profData[deskIndex].list[listRandNum].useragents[profileRandNum].profileID) != -1 );

            ttip = setProfile(deskIndex,listRandNum,profileRandNum,true,
                localization.getString("spoofing_enabled_id")+"\n"
                +localization.getString("disable_spoofing_id")+"\n"
                +localization.getString("random_desktop_notification_prefix_id")+ " ",
                localization.getString("browser_profile_changed_id")+"\n"
                +localization.getString("random_desktop_notification_prefix_id") + " ");

            changed = true;

        }else{
            Notifications.sendMsg(localization.getString("unable_to_change_random_desktop_profile_id")+"\n"
                +localization.getString("all_desktop_profiles_excluded_id")+"\n"
                +localization.getString("profile_unchanged_id"));
        }

    }else if( uaChosen == "random_mobile"){

        //check that the user has not excluded all the mobile profiles
        //if so show a notification
        if (excludeCount["mobile"].exclude_count < excludeCount["mobile"].total_count){

            do{

                //get a random user agent from the mobile options only
                var listRandNum = getRandomNum(profData[mobileIndex].list.length -1);
                var profileRandNum = getRandomNum(profData[mobileIndex].list[listRandNum].useragents.length -1);

       
            //check if the randomly chosen profile is in the exclude list
            }while( exclude_list.indexOf(profData[mobileIndex].list[listRandNum].useragents[profileRandNum].profileID) != -1 );

            ttip = setProfile(mobileIndex,listRandNum,profileRandNum,true,
                localization.getString("spoofing_enabled_id")+"\n"
                +localization.getString("disable_spoofing_id")+"\n"
                +localization.getString("random_mobile_notification_prefix_id")+ " ",
                localization.getString("browser_profile_changed_id")+"\n"
                +localization.getString("random_mobile_notification_prefix_id") + " ");

            changed = true;

        }else{
            Notifications.sendMsg(localization.getString("unable_to_change_random_mobile_profile_id")+"\n"
                +localization.getString("all_mobile_profiles_excluded_id")+"\n"
                +localization.getString("profile_unchanged_id"));
        }

    }else if( uaChosen == "default"){
        
        PrefServ.resetAgentInfo(); 
        
        //remove the saved current random indices
        currentRandomIndices = null;
        ttip =  localization.getString("spoofing_disabled_id")+"\n"
                +localization.getString("enable_spoofing_id")+"\n"
                +localization.getString("default_profile_notification_id"); 

        //show notifications if selected
        Notifications.sendMsg(localization.getString("browser_profile_changed_id")+"\n"
                +localization.getString("default_profile_notification_id"));
        changed = true;
  
    //random platfrom specific options e.g random windows browsers
    }else if(uaChosen.slice(0,7) == "random_"){

        //get the first 2 indices
        var indices = uaChosen.substring(7).split(",");

        //check all profiles have not being excluded for the current platform
        if (excludeCount[uaChosen].exclude_count < excludeCount[uaChosen].total_count){
            do{

                //get a random profile until the profile id is not in the list of excluded profiles
                var profileRandNum = getRandomNum(profData[indices[0]].list[indices[1]].useragents.length -1);

            }while(exclude_list.indexOf(profData[indices[0]].list[indices[1]].useragents[profileRandNum].profileID) != -1 );


            ttip = setProfile(indices[0],indices[1],profileRandNum,true,
                localization.getString("spoofing_enabled_id")+"\n"
                +localization.getString("disable_spoofing_id")+"\n"
                +localization.getString("random_id")+ " "+profData[indices[0]].list[indices[1]].description+":\n",
                localization.getString("browser_profile_changed_id")+"\n"
                +localization.getString("random_id")+ " "+profData[indices[0]].list[indices[1]].description+":\n");

           changed = true;

        }else{
            Notifications.sendMsg(localization.getString("unable_to_randomly_change_id")+" "
                +profData[indices[0]].list[indices[1]].description+" "
                +localization.getString("profile_tab_id")+"\n"+localization.getString("all_id")+" "
                +profData[indices[0]].list[indices[1]].description+" "
                +localization.getString("profiles_excluded_id")+"\n"
                +localization.getString("profile_unchanged_id"));
        }

    }else{
    
        //split the string to get the indices for setAgentInfo()
        var indices = PrefServ.getter("extensions.agentSpoof.uaChosen").split(",");

        ttip = setProfile(indices[0],indices[1],indices[2],false,
                localization.getString("spoofing_enabled_id")+"\n"
                +localization.getString("disable_spoofing_id")+"\n",
                localization.getString("browser_profile_changed_id")+"\n");

       changed = true;
    }

    //Ensure tooltip of the last set profile stays in the event a user has excluded all / destop profiles
    if(changed == true){
        ActionButton.setEnabledTooltip(ttip);
    }
};


function setProfile(sectionIndex,platformIndex,profileIndex,saveIndices,tooltip,notification){
    //set the  profile
    setAgentInfo(sectionIndex,platformIndex,profileIndex);

    //get profile description
    var description = profData[sectionIndex].list[platformIndex].useragents[profileIndex].description;

    //save the current random indices
    if (saveIndices === true)
        currentRandomIndices = sectionIndex+","+platformIndex+","+profileIndex;
    else
        currentRandomIndices = null;

    //create the tooltip
    var ttip = tooltip + description; 

    //show notifications if selected
    Notifications.sendMsg(notification + description);

    return ttip;
};

//used for per request timer setting in Chrome.js
exports.setupAndAssignProfile = function(){
    prepareAndSetAgentInfo();
};

exports.onUnload = function(reason){
  
    if(reason == "disable" || reason == "uninstall"){
        
        //restore any changes made by the addon
        PrefServ.resetPrefs();
        PrefServ.resetAgentInfo();
    }

    //clear the timer
    Timer.clearTimer();
    Chrome.getObserver().unregister();

};

exports.onInstall = function(){
    
    //disable bfcache so pages are forced to always load the injection script
    //the option is still available in the extras to disable should users choose it
    PrefServ.setter("network.http.use-cache", false);
};

//handle upgrades to new versions of the addon
//from 0.9.5.1 to 0.9.5.2 only
exports.onUpgrade = function(){

    //upgrade to the latest firefox if the previous default whilelist profile is in use
    if(PrefServ.getter("extensions.agentSpoof.whiteListUserAgent") === "Mozilla/5.0 (Windows NT 6.2; rv:35.0) Gecko/20100101 Firefox/35.0")
        PrefServ.setter("extensions.agentSpoof.whiteListUserAgent","Mozilla/5.0 (Windows NT 6.2; rv:36.0) Gecko/20100101 Firefox/36.0");

    //update the default whitelist if it is unchanged
    if(PrefServ.getter("extensions.agentSpoof.fullWhiteList") === "[{\"url\":\"youtube.com\",\"options\":[\"canvas\"]}]")
        PrefServ.setter("extensions.agentSpoof.fullWhiteList","[{\"url\":\"play.google.com\"},{\"url\":\"s.ytimg.com\",\"options\":[\"canvas\"]},{\"url\":\"youtube.com\",\"options\":[\"canvas\",\"windowName\"]}]"); 
    
    //update site whitelist if it has not changed
    if(PrefServ.getter("extensions.agentSpoof.siteWhiteList") === "youtube.com")
        PrefServ.setter("extensions.agentSpoof.siteWhiteList","play.google.com,s.ytimg.com,youtube.com"); 
    

    //handle pref changes and remove unused prefs
    PrefServ.resetter("extensions.agentSpoof.tabHistory");
    PrefServ.resetter("extensions.agentSpoof.fonts");
    PrefServ.resetter("extensions.agentSpoof.enabled");
    PrefServ.resetter("extensions.agentSpoof.dom");
    PrefServ.resetter("extensions.agentSpoof.geo");
    PrefServ.resetter("extensions.agentSpoof.dns");
    PrefServ.resetter("extensions.agentSpoof.link");
    PrefServ.resetter("extensions.agentSpoof.browsingHistory");
    PrefServ.resetter("extensions.agentSpoof.webGl");
    PrefServ.resetter("extensions.agentSpoof.webRTC");
    PrefServ.resetter("extensions.agentSpoof.pdfjs");
    PrefServ.resetter("extensions.agentSpoof.searchsuggest");
    PrefServ.resetter("extensions.agentSpoof.notify");
    PrefServ.resetter("extensions.agentSpoof.cache");
    PrefServ.resetter("extensions.agentSpoof.dnt");
    PrefServ.resetter("browser.cache.memory.disk"); //no longer used in firefox



    //update code to add mobile attribte to exclusion count
    var excludeCount = JSON.parse(PrefServ.getter("extensions.agentSpoof.exclusionCount"));
    
    //add mobile entry
    excludeCount.mobile = {"total_count":0,"exclude_count":0};

    //calculate the existing excluded profiles counts with resepct to mobile
    excludeCount["mobile"].exclude_count =  excludeCount["random_1,0"].exclude_count + 
                                            excludeCount["random_1,1"].exclude_count + 
                                            excludeCount["random_1,2"].exclude_count +
                                            excludeCount["random_1,3"].exclude_count ;


    excludeCount["mobile"].total_count =  excludeCount["random_1,0"].total_count + 
                                            excludeCount["random_1,1"].total_count + 
                                            excludeCount["random_1,2"].total_count +
                                            excludeCount["random_1,3"].total_count ;                                         

    //For now "other" only contains games console browsers so we set other counts = console counts
    excludeCount["other"] = excludeCount["random_2,0"];

    //remove the old non_desktop entry
    delete excludeCount["non_desktop"];

    //convert back to a string and save preference
    PrefServ.setter("extensions.agentSpoof.exclusionCount",JSON.stringify(excludeCount));
    console.log (excludeCount);



};

exports.setFullWhiteList = function(jsonData){
    fullWhiteList = JSON.parse(jsonData);
};

exports.getFullWhiteListEntry = function(index){
    return fullWhiteList[index];
};

exports.getDeskIndex = function(){
    return deskIndex;
}

exports.getMobileIndex = function(){
    return mobileIndex;
}

//get a random number from 0 - maximum 
function getRandomNum(maximum){
    return Math.round(Math.random()*maximum) 
};

function setupProfileAndTimer(){

    //set the timer if the user has opted to use it and a random ua was chosen
    if((PrefServ.getter("extensions.agentSpoof.timeInterval") != "none" && PrefServ.getter("extensions.agentSpoof.timeInterval") != "request") 
            && PrefServ.getter("extensions.agentSpoof.uaChosen").slice(0,6) == "random"){
        startTimer();
    }else{
        prepareAndSetAgentInfo(); 
    }
};

function getInterval(interval){

    if (interval == "randomTime")
        return Math.floor((Math.random()*60)+1) * 60000; 
    else
        return interval * 60000;
};

function getAttributeIndex(data,attrib){

    for (var i=0;i< data.length;i++){
        if(data[i].type == attrib){
            return i;
        }
    }
    return 0; 
};

function setAgentInfo(listTypeIndex,listIndex,profileIndex){

    for (var key in profData[listTypeIndex].list[listIndex].useragents[profileIndex]) {
        if (profData[listTypeIndex].list[listIndex].useragents[profileIndex].hasOwnProperty(key)) {
            var value = profData[listTypeIndex].list[listIndex].useragents[profileIndex][key];
            PrefServ.setProfilePrefs(key,value);  
        }

    }
};


function createPlatfromContextMenuItems(){
    var items = new Array() ;

    for (var k = 0;k < profData.length;k++){

        for (var i = 0; i < profData[k].list.length; i++){
            
            items.push({ 
                image: Data.get("images/notselected.png"), 
                label: localization.getString("random_id") +" " + profData[k].list[i].description, 
                data: "random_"+k+","+i 
            });
        }
    }
    return items;
};
