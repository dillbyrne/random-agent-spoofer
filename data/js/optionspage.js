document.body.addEventListener("change", function(e) {
  
  if( e.target.id == "notify"){
    self.port.emit("notifycb",document.getElementById("notify").checked);
  }
  else if( e.target.id == "fonts"){
    self.port.emit("fontscb",document.getElementById("fonts").checked);
  }
  else if( e.target.id == "dom"){
    self.port.emit("domcb",document.getElementById("dom").checked);
  }
  else if( e.target.id == "history"){
    self.port.emit("historycb",document.getElementById("history").checked);
  }
  else if( e.target.id == "cache"){
    self.port.emit("cachecb",document.getElementById("cache").checked);
  }
  else if( e.target.id == "geo"){
    self.port.emit("geocb",document.getElementById("geo").checked);
  }
  else if( e.target.id == "xff"){
    self.port.emit("xffcb",document.getElementById("xff").checked);
  }
  else if( e.target.id == "via"){
    self.port.emit("viacb",document.getElementById("via").checked);
  }
  else if( e.target.id == "ifnone"){
    self.port.emit("ifnonecb",document.getElementById("ifnone").checked);
  }
  else if( e.target.id == "dns"){
    self.port.emit("dnscb",document.getElementById("dns").checked);
  }
  else if( e.target.id == "link"){
    self.port.emit("linkcb",document.getElementById("link").checked);
  }
  else if( e.target.id == "acceptd"){
    self.port.emit("acceptdcb",document.getElementById("acceptd").checked);
  }
  else if( e.target.id == "accepte"){
    self.port.emit("acceptecb",document.getElementById("accepte").checked);
  }
  else if( e.target.id == "acceptl"){
    self.port.emit("acceptlcb",document.getElementById("acceptl").checked);
  }
  else if( e.target.id == "spoof"){
    self.port.emit("spoofcb",document.getElementById("spoof").checked);
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
