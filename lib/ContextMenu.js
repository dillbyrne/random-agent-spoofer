var cm = require("sdk/context-menu");
    PrefServ = require("./PrefServ"),
    Data = require("./Data"),
    Ras = require("./Ras"),
    localization = require("./Localization"),
    parentMenu = null,
    menuItems = null,
    platformItems = null,
    timerItems = null;



var def = cm.Item({
    label: localization.getString("real_id"),
    image: Data.get("images/selected.png"),
    data: "default"
});

var rand = cm.Item({
    label: localization.getString("random_id"),
    image: Data.get("images/notselected.png"),
    data: "random"
});

var rand_desk = cm.Item({
    label: localization.getString("random_desktop_id"),
    image: Data.get("images/notselected.png"),
    data: "random_desktop"
});

var rand_mob = cm.Item({
    label: localization.getString("random_mobile_id"),
    image: Data.get("images/notselected.png"),
    data: "random_mobile"
});

var rand_plat = cm.Menu({
    label: localization.getString("random_platform_id"),
    image: Data.get("images/icon.png"),
    items: []
});

var timer = cm.Menu({
    label: localization.getString("timer_id"),
    image: Data.get("images/timer.png"),
    items: [
        cm.Item({ image: Data.get("images/selected.png"), label: localization.getString("no_timer_id"), data: "none" }),
        cm.Item({ image: Data.get("images/notselected.png"), label: localization.getString("per_request_id"), data: "request" }),
        cm.Item({ image: Data.get("images/notselected.png"), label: localization.getString("random_id"), data: "randomTime" }),
        cm.Item({ image: Data.get("images/notselected.png"), label: localization.getString("1_min_id"), data: "1" }),
        cm.Item({ image: Data.get("images/notselected.png"), label: localization.getString("5_mins_id"), data: "5" }),
        cm.Item({ image: Data.get("images/notselected.png"), label: localization.getString("10_mins_id"), data: "10" }),
        cm.Item({ image: Data.get("images/notselected.png"), label: localization.getString("20_mins_id"), data: "20" }),
        cm.Item({ image: Data.get("images/notselected.png"), label: localization.getString("30_mins_id"), data: "30" }),
        cm.Item({ image: Data.get("images/notselected.png"), label: localization.getString("40_mins_id"), data: "40" }),
        cm.Item({ image: Data.get("images/notselected.png"), label: localization.getString("50_mins_id"), data: "50" }),
        cm.Item({ image: Data.get("images/notselected.png"), label: localization.getString("60_mins_id"), data: "60" })
      ]
});

var Menu = cm.Menu({
    label: "Random Agent Spoofer",
    image: Data.get("images/icon.png"),
    contentScriptFile: Data.get("js/itemSelection.js"),
    items: [def,rand,rand_desk,rand_mob,rand_plat,cm.Separator(),timer],
    onMessage:function (data){

        if (data === "default" || data === "random" || data.slice(0,7) === "random_"){
            PrefServ.setter("extensions.agentSpoof.uaChosen",data);
        }else{   //set time
            PrefServ.setter("extensions.agentSpoof.timeInterval",data);
        }
    }
});

exports.setProfileIcons = function(profile){
    
    var items = rand_plat.items;
    items.push(def,rand,rand_desk);

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

exports.setPlatformItems = function(items){

    for (var i =0; i< items.length; i++){
        rand_plat.addItem(cm.Item(items[i]));
    }


}; 

exports.showMenu = function(isShown){
    if (isShown === false){
        //remove RAS menu

        //backup menuitems and get parent reference menu
        parentMenu = Menu.parentMenu;
        menuItems = Menu.items;
        platformItems = rand_plat.items;
        timerItems = timer.items; 

        parentMenu.removeItem(Menu);

    }
    else if (isShown ===  true && menuItems !== null){
        //add RAS menu

        //restore menu and items
        parentMenu.addItem(Menu);
        Menu.items = menuItems;
        rand_plat.items = platformItems;
        timer.items = timerItems;

        //set values to null 
        menuItems = null;
        platformItems = null;
        timerItems = null;
        
    }
}

