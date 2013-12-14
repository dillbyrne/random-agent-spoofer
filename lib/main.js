var widgets = require("sdk/widget");
var data = require("sdk/self").data;
var pref_serv = require("sdk/preferences/service");
var ff_timer = require("sdk/timers");
var notifications = require("sdk/notifications");

//User agent, platform and other assiociated data
var ua_list = JSON.parse(data.load("json/useragents.json"));

//addon specific preferences
var agent_spoof_pref = "extensions.agentSpoof.enabled";
var timer_interval_pref = "extensions.agentSpoof.timeInterval";
var ua_choice_pref = "extensions.agentSpoof.uaChosen";
var notify_pref = "extensions.agentSpoof.notify";

//user agent specific preferences
var ua_override = "general.useragent.override";
var platform_override = "general.platform.override";
var appname_override = "general.appname.override";
var appversion_override = "general.appversion.override";
var ua_vendor = "general.useragent.vendor";
var ua_vendorsub = "general.useragent.vendorsub";

//extra privacy enhancing preferences
var buildID_override = "general.buildID.override";
var oscpu_override = "general.oscpu.override";

//has the useragent list been loaded 
var loaded = false;

//keep track of timer
var timer_id;

var tooltips = new Array();
tooltips[0] = "Spoofing enabled\nRight click to disable";
tooltips[1] = "Spoofing disabled\nRight click to enable";

var icons = new Array();
icons[0] = "images/on.png";
icons[1] = "images/off.png";

//create prefs if they are not set
if (!(pref_serv.has(agent_spoof_pref))) {
  pref_serv.set(timer_interval_pref, "none");
  pref_serv.set(agent_spoof_pref, false);
  pref_serv.set(ua_choice_pref, "random");
  pref_serv.set(notify_pref, true);
}


//create a panel to display the options to the user
var options_panel = require("sdk/panel").Panel({
  width:450,
  height:350,
  contentURL: data.url("html/options-panel.html"),
  contentStyleFile: data.url("css/style.css"),
  contentScriptFile: [
    data.url("js/set-options.js"),
    data.url("js/optionspage.js")
    ]
});


//send the get-options script a message when the panel is hidden
options_panel.on("hide",function(){
  options_panel.port.emit("hide");
});


//restore chosen options whent the panel is shown
options_panel.on("show",function(){
    
  //only pass the UA list once
  if (!loaded){
    loaded = true;
    //build the UA list
    options_panel.port.emit("ua_list",ua_list);
  }

  var options = new Array();
  options[0] = pref_serv.get(timer_interval_pref);
  options[1] = pref_serv.get(ua_choice_pref);
  options[2] = pref_serv.get(notify_pref);
  
  options_panel.port.emit("restore-options",options);

});

//get the users notification preference
options_panel.port.on("notifycb",function(value){
  pref_serv.set(notify_pref,value);
});


//get the user's timer and ua choice 
options_panel.port.on("uachange",function(ua_choice,interval){
  
  //save the options
  pref_serv.set(timer_interval_pref,interval);
  pref_serv.set(ua_choice_pref,ua_choice);
  
    //check if the user has the addon enabled
    //if so have the changes made take effect immediately
    if(pref_serv.get(agent_spoof_pref) == true){
      
      //clear timer 
      ff_timer.clearTimeout(timer_id);
    
      //set the timer if it the user has opted to use it and a random ua was chosen
      if(pref_serv.get(timer_interval_pref) != "none" && ( pref_serv.get(ua_choice_pref) == "random" || pref_serv.get(ua_choice_pref) == "random_desktop")){
	startTimer();
      }else{
	prepareAndSetAgentInfo(); 
      }
    }

});



var widget = widgets.Widget({
  id: "agent-spoof",
  label:"User Agent Spoofer",
  panel: options_panel,
  contentURL: data.url('images/off.png'),
  contentScriptFile: data.url("js/click-listener.js")
});



//toggle user agent spoofing by right clicking
widget.port.on("right-click", function(){
  

  //check if the addon is enabled
  if(pref_serv.get(agent_spoof_pref) == true){
      
    //set the addon as disabled
    pref_serv.set(agent_spoof_pref,false);

    //reset user agent
    resetAgentInfo();

    //clear the timer
    ff_timer.clearTimeout(timer_id);
    //console.log("timer cleared");
  }
  else{

    //set the addon as enabled
    pref_serv.set(agent_spoof_pref,true);
   
    //clear the timer 
    ff_timer.clearTimeout(timer_id);

    //set the timer if it the user has opted to use it and a random ua was chosen
    if(pref_serv.get(timer_interval_pref) != "none" && ( pref_serv.get(ua_choice_pref) == "random" || pref_serv.get(ua_choice_pref) == "random_desktop")){
      startTimer();
    }else{
      prepareAndSetAgentInfo(); 
    }
  }
  
  toggleIconAndLabel();
  
});

function getInterval(interval){
  
  if (interval == "random")
    return getRandInterval();
  else
    return interval * 60000;
}


function getRandInterval(){
  return Math.floor((Math.random()*60)+1) * 60000;
}

function startTimer(){
  
    //get the time based on the selected interval
    time = getInterval(pref_serv.get(timer_interval_pref));
    //console.log("interval is "+ time);
    
    //Set User Agent
    prepareAndSetAgentInfo();
    
    //start timer
    timer_id = ff_timer.setTimeout(startTimer,time);
  
}


function setAgentInfo(uadataIndex,useragentsIndex){

  for (var key in ua_list.uadata[uadataIndex].useragents[useragentsIndex]) {
    if (ua_list.uadata[uadataIndex].useragents[useragentsIndex].hasOwnProperty(key)) {
      var value = ua_list.uadata[uadataIndex].useragents[useragentsIndex][key];
      
      //set the corresponding attributes
      if(key == "appname")
	pref_serv.set(appname_override,value);
      else if(key == "platform")
	pref_serv.set(platform_override,value);
      else if(key == "appversion")
	pref_serv.set(appversion_override,value);
      else if(key == "vendor")
	pref_serv.set(ua_vendor,value);
      else if(key == "vendorsub")
	pref_serv.set(ua_vendorsub,value);
      else if(key == "oscpu")
	pref_serv.set(oscpu_override,value);
      else if(key == "buildID")
	pref_serv.set(buildID_override,value);
      else
	pref_serv.set(ua_override,value);

    }

  }
}


//Reset any UA related attributes
function resetAgentInfo(){

    pref_serv.reset(appname_override);
    pref_serv.reset(platform_override);
    pref_serv.reset(appversion_override);
    pref_serv.reset(ua_vendorsub);
    pref_serv.reset(ua_vendor);
    pref_serv.reset(ua_override);
    pref_serv.reset(oscpu_override);
    pref_serv.reset(buildID_override);
    

}


//Check if the selected UA is random or not
//Set a random one if it is
//Parse and set the specified one if not
function prepareAndSetAgentInfo(){

  if(pref_serv.get(ua_choice_pref) == "random"){

    //get a random user agent
    var uaDataRandNum = getRandomNum(ua_list.uadata.length -1);
    var userAgentRandNum = getRandomNum(ua_list.uadata[uaDataRandNum].useragents.length -1);
   
    //console.log(uaDataRandNum,userAgentRandNum);

    //set the random user agent
    setAgentInfo(uaDataRandNum,userAgentRandNum);

    //set the tooltip
    var uainfo = ua_list.uadata[uaDataRandNum].useragents[userAgentRandNum].description;

    tooltips[0] = "Spoofing enabled\nRight click to disable\nRandom: "+ uainfo; 

    //show notifications if selected
    if (pref_serv.get(notify_pref) == true ){
	notifications.notify({
	  text: "User Agent Changed\nRandom: " + uainfo,
	  iconURL: data.url("images/icon.png")
	});
    }

  }
  else if(pref_serv.get(ua_choice_pref) == "random_desktop"){

    //get a random user agent from the desktop options only
    var uaDataRandNum = getRandomNum(3);
    var userAgentRandNum = getRandomNum(ua_list.uadata[uaDataRandNum].useragents.length -1);
   
    //console.log(uaDataRandNum,userAgentRandNum);

    //set the random user agent
    setAgentInfo(uaDataRandNum,userAgentRandNum);

    //set the tooltip
    var uainfo = ua_list.uadata[uaDataRandNum].useragents[userAgentRandNum].description;

    tooltips[0] = "Spoofing enabled\nRight click to disable\nRandom (Desktop): "+ uainfo; 

    //show notifications if selected
    if (pref_serv.get(notify_pref) == true ){
	notifications.notify({
	  text: "User Agent Changed\nRandom (Desktop): " + uainfo,
	  iconURL: data.url("images/icon.png")
	});
    }

  }
  else{
    
    //split the string to get the indices for setAgentInfo()
    var indices = pref_serv.get(ua_choice_pref).split(",");
    
    //set the user agent
    setAgentInfo(indices[0],indices[1]);

    //set the tooltip
    var uainfo = ua_list.uadata[indices[0]].useragents[indices[1]].description;

    tooltips[0] = "Spoofing enabled\nRight click to disable\n"+ uainfo; 

    //show notifications if selected
    if (pref_serv.get(notify_pref) == true ){
	notifications.notify({
	  text: "User Agent Changed\n" + uainfo,
	  iconURL: data.url("images/icon.png")
	});
    }
  }
      

      widget.tooltip = tooltips[0];
}


//get a random number from 0 - maximum 
function getRandomNum(maximum){

  return Math.round(Math.random()*maximum) 
}


function toggleIconAndLabel(){
  if(pref_serv.get(agent_spoof_pref) == true){
    widget.contentURL = data.url(icons[0]);
    widget.tooltip = tooltips[0];
  }
  else{
    widget.contentURL = data.url(icons[1]);
    widget.tooltip = tooltips[1];
  }
}

exports.onUnload = function(reason){
  

  if(reason == "disable" || reason == "uninstall"){
    //restore any changes made by the addon
    
    resetAgentInfo();
    pref_serv.reset(agent_spoof_pref);
    pref_serv.reset(timer_interval_pref); 
    pref_serv.reset(ua_choice_pref);
    pref_serv.reset(notify_pref);
  }

    //clear the timer
    ff_timer.clearTimeout(timer_id);
}


//set up preferences to reflect the user's selected settings
function initialSetup(){

  //set inital icon and label
  toggleIconAndLabel();

  //set initial user agent if the user had the addon enabled on shutdown
  if (pref_serv.get(agent_spoof_pref) == true){
    
    //set the timer if it the user has opted to use it and a random ua was chosen
    if(pref_serv.get(timer_interval_pref) != "none" && ( pref_serv.get(ua_choice_pref) == "random" || pref_serv.get(ua_choice_pref) == "random_desktop" )) {
      startTimer();
    }else{
      prepareAndSetAgentInfo(); 
    }
  }

}


initialSetup();
