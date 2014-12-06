var ui = require("sdk/ui"),
    Data = require("./Data"),
    PrefServ = require("./PrefServ"),
    Panel = require("./Panel"),
    labels = [
        "Spoofing enabled\nUncheck the spoofing option to disable or use the context menu option",
        "Spoofing disabled\nCheck the spoofing option to enable or use the context menu option"
        ],
    button,
    panel = null; //Panel.getPanel() will not work at this point

exports.init = function(){
  
    button = ui.ActionButton({
        id: "random-agent-spoofer",
        label:"Random Agent Spoofer",
        icon:{
            "16":Data.get("images/on64.png"),
            "32":Data.get("images/icon64.png"),
            "64":Data.get("images/icon64.png")
        },
        onClick: function(state){
            if (panel === null)
                panel = Panel.getPanel();

            panel.show({
                position: button
            });
        }
       
    });  

};

exports.toggleIconAndLabel = function(){
    
    if(PrefServ.getter("extensions.agentSpoof.enabled") == true){
        
        button.icon = Data.get("images/on64.png");
        button.label = labels[0];
    
    }else{

        button.icon = Data.get("images/off64.png");
        button.label = labels[1];
    }
};

exports.setEnabledTooltip = function(text){
    
    //store the current profile tooltip info
    labels[0] = text;

    //if the addon is already enabled, update the tooltip
    if(PrefServ.getter("extensions.agentSpoof.enabled") == true){
        button.label = labels[0];
    }


};