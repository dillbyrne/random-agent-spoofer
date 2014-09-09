var Widget = require("./Widget"),
    Data = require("./Data"),
    Chrome = require("./Chrome"),
    PageMod = require("./PageMod"),
    PrefServ = require("./PrefServ"),
    Timer = require("./Timer"),
    Notifications = require("./Notifications"),
    ua_list = Data.loadJSON("json/useragents.json"), //profile list
    fullWhiteList, //stores the full json data for whitelisting functionality such as canvas
    cur_rand = null; //current randomly selected browser profile


exports.init = function() {

    //set up preferences to reflect the user's selected settings
    PrefServ.createPrefs();

    //set inital icon and label
    Widget.toggleIconAndLabel();
    Chrome.getObserver().register();

    PageMod.init(); 

    //set initial user agent if the user had the addon enabled on shutdown
    if (PrefServ.getter("extensions.agentSpoof.enabled") == true){
    
        //set the timer if the user has opted to use it and a random ua was chosen
        if((PrefServ.getter("extensions.agentSpoof.timeInterval") != "none" && PrefServ.getter("extensions.agentSpoof.timeInterval") != "request") 
				&& PrefServ.getter("extensions.agentSpoof.uaChosen").slice(0,6) == "random"){
            startTimer();
        }else{
            prepareAndSetAgentInfo(); 
        }
    }

    //set whitlist 
    fullWhiteList = JSON.parse(PrefServ.getter("extensions.agentSpoof.fullWhiteList")); 
};

exports.getProfiles = function(){
    return ua_list;
}

exports.toggleAddonState = function(){

    //check if the addon is enabled
    if(PrefServ.getter("extensions.agentSpoof.enabled") == true)
        setAddonStateDisabled();      
    else
        setAddonStateEnabled();
    
    Widget.toggleIconAndLabel();
};

exports.setAddonState = function(value){

    //check if the addon is enabled
    if(value == false)
        setAddonStateDisabled();      
    else
        setAddonStateEnabled();

    Widget.toggleIconAndLabel();
};



exports.setAcceptHeader = function(header_pref,header_override,spoofHeader){

    PrefServ.setter(header_pref,spoofHeader);
  
    if(PrefServ.getter("extensions.agentSpoof.enabled") == true && PrefServ.getter("extensions.agentSpoof.uaChosen") != "default"){
  
        if(spoofHeader == true){
      
            var indices="";

            //check if a random option is currently chosen
            if(PrefServ.getter("extensions.agentSpoof.uaChosen").slice(0,6) == "random"){
	           //get the currently selected random indices.
	           indices = cur_rand.split(",");
            }else{
	           //get the specific selected indices
	           indices = PrefServ.getter("extensions.agentSpoof.uaChosen").split(",");
            }
	
        //get the value from the profile at the specified indices and set the value
	    PrefServ.setter(header_override,ua_list.uadata[indices[0]].useragents[indices[1]]["accept_"+header_pref.slice(28).toLowerCase()]);	
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

exports.startRandomTimer = function(){
    startTimer();
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

//Check if the selected UA is random or not
//Set a random one if it is
//Parse and set the specified one if not
function prepareAndSetAgentInfo(){ 
    var ttip; //temp tooltip
    var changed = false;

    if(PrefServ.getter("extensions.agentSpoof.uaChosen") == "random"){

        var exclude_list = PrefServ.getter("extensions.agentSpoof.excludeList").split(',');

        //check that the user has not excluded all the profiles
        //if so show a notification
        if ( PrefServ.getter("extensions.agentSpoof.randomOtherCount") + PrefServ.getter("extensions.agentSpoof.randomDesktopCount")
         < PrefServ.getter("extensions.agentSpoof.totalRandomAllCount") ){

            do{
                
                //get a random user agent
                var uaDataRandNum = getRandomNum(ua_list.uadata.length -1);
                var userAgentRandNum = getRandomNum(ua_list.uadata[uaDataRandNum].useragents.length -1);
          
           //check if the randomly chosen profile is in the exclude list
            }while( exclude_list.indexOf(ua_list.uadata[uaDataRandNum].useragents[userAgentRandNum].profileID) != -1 );

            //set the random user agent
            setAgentInfo(uaDataRandNum,userAgentRandNum);
        
            //save the current random indices
            cur_rand = uaDataRandNum+","+userAgentRandNum;

            //set the tooltip
            var uainfo = ua_list.uadata[uaDataRandNum].useragents[userAgentRandNum].description;
            ttip = "Spoofing enabled\nRight click icon or uncheck the spoofing option to disable\nRandom: "+ uainfo; 

            //show notifications if selected
            Notifications.sendMsg("Browser Profile Changed\nRandom: " + uainfo);
            changed = true;
        }else{
            Notifications.sendMsg("Unable to randomly change Profile\nAll profiles have been excluded\nCurrent profile remains unchanged");

        }
    
    }else if(PrefServ.getter("extensions.agentSpoof.uaChosen") == "random_desktop"){

        var exclude_list = PrefServ.getter("extensions.agentSpoof.excludeList").split(',');

        //check that the user has not excluded all the profiles
        //if so show a notification
        if (PrefServ.getter("extensions.agentSpoof.randomDesktopCount") < PrefServ.getter("extensions.agentSpoof.totalRandomDesktopCount")){

            do{

                //get a random user agent from the desktop options only
                var uaDataRandNum = getRandomNum(3);
                var userAgentRandNum = getRandomNum(ua_list.uadata[uaDataRandNum].useragents.length -1);
       
            //check if the randomly chosen profile is in the exclude list
            }while( exclude_list.indexOf(ua_list.uadata[uaDataRandNum].useragents[userAgentRandNum].profileID) != -1 );

            //set the random user agent
            setAgentInfo(uaDataRandNum,userAgentRandNum);

            //set the tooltip
            var uainfo = ua_list.uadata[uaDataRandNum].useragents[userAgentRandNum].description;

            //save the current random indices
            cur_rand = uaDataRandNum+","+userAgentRandNum;

            ttip = "Spoofing enabled\nRight click icon or uncheck the spoofing option to disable\nRandom (Desktop): "+ uainfo; 

            //show notifications if selected
            Notifications.sendMsg("Browser Profile Changed\nRandom (Desktop): " + uainfo);
            changed = true;
        }else{
            Notifications.sendMsg("Unable to randomly change Desktop Profile\nAll Desktop Profiles have been excluded\nCurrent profile remains unchanged");

        }

    }else if(PrefServ.getter("extensions.agentSpoof.uaChosen") == "default"){
        
        PrefServ.resetAgentInfo(); 
        
        //remove the saved current random indices
        if (cur_rand != null)
            cur_rand = null;

        ttip = "Spoofing enabled\nRight click icon or uncheck the spoofing option to disable\nDefault browser profile"; 

        //show notifications if selected
    
        Notifications.sendMsg("Browser Profile Changed\nDefault browser profile");
        changed = true;
  
    }else{
    
        //split the string to get the indices for setAgentInfo()
        var indices = PrefServ.getter("extensions.agentSpoof.uaChosen").split(",");
    
        //set the user agent
        setAgentInfo(indices[0],indices[1]);

        //set the tooltip
        var uainfo = ua_list.uadata[indices[0]].useragents[indices[1]].description;
    
        //remove the saved current random indices
        if (cur_rand != null)
            cur_rand = null;

        ttip = "Spoofing enabled\nRight click icon or uncheck the spoofing option to disable\n"+ uainfo; 

        //show notifications if selected
	   Notifications.sendMsg("Browser Profile Changed\n" + uainfo);
       changed = true;
    }

    //Ensure tooltip of the last set profile stays in the event a user has excluded all / destop profiles
    if(changed == true){
        Widget.setEnabledTooltip(ttip);
    }
};

exports.setupAndAssignProfile =function(){
    prepareAndSetAgentInfo();
};

exports.onUnload = function(reason){
  
    if(reason == "disable" || reason == "uninstall"){
        
        //restore any changes made by the addon
        PrefServ.resetAgentInfo();
        PrefServ.resetPrefs();
        PrefServ.resetExtras(); 
    }

    //clear the timer
    Timer.clearTimer();
    Chrome.getObserver().unregister();

};

exports.setFullWhiteList = function(jsonData){
    fullWhiteList = JSON.parse(jsonData);
};

exports.getFullWhiteListEntry = function(index){
    return fullWhiteList.whitelist[index];
};

//get a random number from 0 - maximum 
function getRandomNum(maximum){
    return Math.round(Math.random()*maximum) 
};

function setAddonStateDisabled(){

    //set the addon as disabled
    PrefServ.setter("extensions.agentSpoof.enabled",false);
    //reset user agent
    PrefServ.resetAgentInfo();
    //reset Extras
    PrefServ.resetExtras();
    //clear the timer
    Timer.clearTimer();
};

function setAddonStateEnabled(){

    //set the addon as enabled
    PrefServ.setter("extensions.agentSpoof.enabled",true);
    //set Extras
    PrefServ.setExtras(); 
    //clear the timer 
    Timer.clearTimer();

    //set the timer if it the user has opted to use it and a random ua was chosen
    if((PrefServ.getter("extensions.agentSpoof.timeInterval") != "none" && PrefServ.getter("extensions.agentSpoof.timeInterval") != "request") 
			&& PrefServ.getter("extensions.agentSpoof.uaChosen").slice(0,6) == "random"){
        startTimer();
    }else{
        prepareAndSetAgentInfo(); 
    }

};

function getInterval(interval){

    if (interval == "random")
        return getRandInterval();
    else
        return interval * 60000;
};

function getRandInterval(){
    return Math.floor((Math.random()*60)+1) * 60000;
};

function setAgentInfo(uadataIndex,useragentsIndex){

    for (var key in ua_list.uadata[uadataIndex].useragents[useragentsIndex]) {
        if (ua_list.uadata[uadataIndex].useragents[useragentsIndex].hasOwnProperty(key)) {
            var value = ua_list.uadata[uadataIndex].useragents[useragentsIndex][key];
            PrefServ.setProfilePrefs(key,value);  
        }

    }
};
