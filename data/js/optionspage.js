document.body.addEventListener("change", function(e) {
  
  if( e.target.id == "notify"){
    var notifycb = document.getElementById("notify").checked;
    self.port.emit("notifycb",notifycb);
  }
  else if( e.target.id == "fonts"){
    var fontscb = document.getElementById("fonts").checked;
    self.port.emit("fontscb",fontscb);
  }
  else if( e.target.id == "dom"){
    var domcb = document.getElementById("dom").checked;
    self.port.emit("domcb",domcb);
  }
  else if( e.target.id == "history"){
    var historycb = document.getElementById("history").checked;
    self.port.emit("historycb",historycb);
  }
  else if( e.target.id == "cache"){
    var cachecb = document.getElementById("cache").checked;
    self.port.emit("cachecb",cachecb);
  }
  else if( e.target.id == "geo"){
    var geocb = document.getElementById("geo").checked;
    self.port.emit("geocb",geocb);
  }
  else if( e.target.id == "xff"){
    var xffcb = document.getElementById("xff").checked;
    self.port.emit("xffcb",xffcb);
  }
  else if( e.target.id == "via"){
    var viacb = document.getElementById("via").checked;
    self.port.emit("viacb",viacb);
  }
  else if( e.target.id == "ifnone"){
    var ifnonecb = document.getElementById("ifnone").checked;
    self.port.emit("ifnonecb",ifnonecb);
  }
  else if( e.target.id == "dns"){
    var dnscb = document.getElementById("dns").checked;
    self.port.emit("dnscb",dnscb);
  }
  else if( e.target.id == "link"){
    var linkcb = document.getElementById("link").checked;
    self.port.emit("linkcb",linkcb);
  }
  else if( e.target.id == "acceptd"){
    var acceptdcb  = document.getElementById("acceptd").checked;
    self.port.emit("acceptdcb",acceptdcb);
  }
  else if( e.target.id == "accepte"){
    var acceptecb  = document.getElementById("accepte").checked;
    self.port.emit("acceptecb",acceptecb);
  }
  else if( e.target.id == "acceptl"){
    var acceptlcb  = document.getElementById("acceptl").checked;
    self.port.emit("acceptlcb",acceptlcb);
  }
  else{
    
    //get timer and selected ua option
     var timerdd = document.getElementById("timerdd");
     var uaList = document.getElementsByName("ua");
    
     var time = timerdd[timerdd.selectedIndex].value;

     //get selected UA
     var ua_choice;
      for(var i = 0; i < uaList.length; i++){
	if(uaList[i].checked){
	  ua_choice = uaList[i].value;
	}
      }
     self.port.emit("uachange",ua_choice,time);
  
  }


},false);


function toggleList(innerListElementId) {
  
  var innerlistElement = document.getElementById(innerListElementId);
  
  //get the span of the parent li 
  //it's index is the same as it's child list, so we can get it from that
  var text = document.getElementById("li_text"+ innerListElementId.replace( /^\D+/g, '')); 

  //toggle the child list and parents assiociated indicator
  if (innerlistElement.style.display == "none"){
      innerlistElement.style.display = "block";
      text.innerHTML = " -";
  }else{
      innerlistElement.style.display = "none";
      text.innerHTML = " +";
  }
}

function changeTab(selected_tab,tabs){

  for (var i =0; i< tabs.length;i++){
    if (tabs[i].children[0].id == selected_tab.id){
      
      var selected = document.getElementById(selected_tab.id+"_content");
      selected.style.display ="block";
      selected_tab.className = "selected";

    }else{
      var non_selected = document.getElementById(tabs[i].children[0].id+"_content");
      non_selected.style.display = "none";
      tabs[i].children[0].className = "nonselected"; 
    }
         
  }


}
