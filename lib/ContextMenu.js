var cm = require("sdk/context-menu");
    PrefServ = require("./PrefServ"),
    Data = require("./Data"),
    Ras = require("./Ras"),
    labels = ["Disable RAS","Enable RAS"];


var toggle = cm.Item({
    image: Data.get("images/on.png"),
    label: labels[0],
    data: "toggle"
});

var def = cm.Item({
    label: "Default",
    image: Data.get("images/selected.png"),
    data: "default"
});

var rand = cm.Item({
    label: "Random All",
    image: Data.get("images/notselected.png"),
    data: "random"
});

var rand_desk = cm.Item({
    label: "Random Desktop",
    image: Data.get("images/notselected.png"),
    data: "random_desktop"
});

var timer = cm.Menu({
    label: "Timer",
    image: Data.get("images/timer.png"),
    items: [
        cm.Item({ image: Data.get("images/selected.png"), label: "No Timer", data: "none" }),
        cm.Item({ image: Data.get("images/notselected.png"), label: "Per Request", data: "request" }),
        cm.Item({ image: Data.get("images/notselected.png"), label: "Random", data: "random_time" }),
        cm.Item({ image: Data.get("images/notselected.png"), label: "1 Min", data: "1" }),
        cm.Item({ image: Data.get("images/notselected.png"), label: "5 Mins", data: "5" }),
        cm.Item({ image: Data.get("images/notselected.png"), label: "10 Mins", data: "10" }),
        cm.Item({ image: Data.get("images/notselected.png"), label: "20 Mins", data: "20" }),
        cm.Item({ image: Data.get("images/notselected.png"), label: "30 Mins", data: "30" }),
        cm.Item({ image: Data.get("images/notselected.png"), label: "40 Mins", data: "40" }),
        cm.Item({ image: Data.get("images/notselected.png"), label: "50 Mins", data: "50" }),
        cm.Item({ image: Data.get("images/notselected.png"), label: "60 Mins", data: "60" })
      ]
});



var Menu = cm.Menu({
    label: "Random Agent Spoofer",
    image: Data.get("images/icon.png"),
    contentScriptFile: Data.get("js/itemSelection.js"),
    items: [toggle,cm.Separator(),def,rand,rand_desk,cm.Separator(),timer],
    onMessage:function (data){

        if (data === "toggle"){
            Ras.toggleAddonState();
        }else if (data === "default" || data === "random" || data === "random_desktop"){
            PrefServ.setter("extensions.agentSpoof.uaChosen",data);
        }else{   //set time
            PrefServ.setter("extensions.agentSpoof.timeInterval",data);
        }
    }
});

exports.toggleIconAndLabel = function(){
    
    if(PrefServ.getter("extensions.agentSpoof.enabled") == true){
        
        toggle.image = Data.get("images/on.png");
        toggle.label = labels[0];
    
    }else{

        toggle.image = Data.get("images/off.png");
        toggle.label = labels[1];
    }
};

exports.setProfileIcons = function(profile){
    var items = [def,rand,rand_desk];

    for (var i=0; i< items.length; i++){
        if(items[i].data === profile)
            items[i].image = Data.get("images/selected.png");
        else
            items[i].image = Data.get("images/notselected.png");
    }
};

exports.setTimerIcons = function(interval){

    for (var i=0; i< timer.items.length; i++){
        if(timer.items[i].data === interval)
            timer.items[i].image = Data.get("images/selected.png");
        else
            timer.items[i].image = Data.get("images/notselected.png");
    }
};