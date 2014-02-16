var widget = require("sdk/widget"),
    Data = require("./Data"),
    Panel = require("./Panel"),
    PrefServ = require("./PrefServ"),
    Ras = require("./Ras"),
    widgetObj,
    ttip = "Spoofing enabled\nRight click icon or uncheck the spoofing option to disable";

exports.init = function(){
  
    widgetObj = widget.Widget({
        id: "agent-spoof",
        label:"Random Agent Spoofer",
        panel: Panel.get(),
        contentURL: Data.get('images/off.png'),
        contentScriptFile: Data.get("js/click-listener.js")
    });  


    widgetObj.port.on("right-click", Ras.toggleAddonState);

};

exports.toggleIconAndLabel = function(){
    
    if(PrefServ.getter("extensions.agentSpoof.enabled") == true){
        
        widgetObj.contentURL = Data.get("images/on.png");
        widgetObj.tooltip = ttip;
    
    }else{

        widgetObj.contentURL = Data.get("images/off.png");
        widgetObj.tooltip = "Spoofing disabled\nRight click icon or check the spoofing option to enable";
    }
};

exports.setEnabledTooltip = function(text){
    
    ttip = text;
    
    if(PrefServ.getter("extensions.agentSpoof.enabled") == true)
        widgetObj.tooltip = ttip;

};