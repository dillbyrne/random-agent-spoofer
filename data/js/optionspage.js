document.body.addEventListener("change", function(e) {
 
  //get selected checkbox
  if (e.target.type == "checkbox"){
    self.port.emit(e.target.id+"cb",document.getElementById(e.target.id).checked);
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
      selected.className = "tabContent";
      selected_tab.className = "selected";

    }else{
      var non_selected = document.getElementById(tabs[i].children[0].id+"_content");
      non_selected.className = "hidden";
      tabs[i].children[0].className = "nonselected"; 
    }
         
  }


}
