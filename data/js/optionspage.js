document.body.addEventListener("change", function(e) {
  
  if( e.target.id == "notify"){
    var notifycb = document.getElementById('notify').checked;
    self.port.emit("notifycb",notifycb);

  }
  else{
    
    //get timer and selected ua option
     var timerdd = document.getElementById('timerdd');
     var uaList = document.getElementsByName('ua');
    
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

