self.port.on("hide", function(arg){
  
  //get relevant elements
  var timerdd = document.getElementById('timerdd');
  var uaList = document.getElementsByName('ua');

  //get the chosen options
  var optionsArray = new Array();
   
  var time = timerdd[timerdd.selectedIndex].value;
  optionsArray.push(time);
  
  
  
  //get selected UA
  var ua_choice;
  for(var i = 0; i < uaList.length; i++){
    if(uaList[i].checked){
            ua_choice = uaList[i].value;
      }
  }

  optionsArray.push(ua_choice);

  //return options to main.js for processing 
  self.port.emit("chosen-options", optionsArray );

});



self.port.on("restore-options",function(options){

  //set relevant elements
  var timerdd = document.getElementById('timerdd');


  for (var i = 0; i < timerdd.options.length; i++) {
    
    if (timerdd.options[i].value === options[0]) {
      timerdd.selectedIndex = i;
      break;
    }
  }

  document.getElementById(options[1]).checked = true;
 
});



self.port.on('ua_list', function(data) {
   
    //create the list of user agents
    
    var ualist_div  = document.getElementById('ualist');  
    
    //outer list
    var listElement = document.createElement("ul");

    ualist_div.appendChild(listElement);

    for (var i = 0; i < data.uadata.length; i++){

      var listItem = document.createElement("li");
     
      var b = document.createElement("b");
      var textSpan = document.createElement("span");
      var indicatorSpan = document.createElement("span");

      textSpan.appendChild(document.createTextNode(data.uadata[i].description));
      textSpan.setAttribute("class","parentli");
      indicatorSpan.appendChild(document.createTextNode(" +"));
      indicatorSpan.setAttribute("id","li_text"+i);
      
      textSpan.appendChild(indicatorSpan);
      b.appendChild(textSpan);
      listItem.appendChild(b);

      
      //inner List  
      var innerListElement = document.createElement("ul");
      innerListElement.setAttribute("class","innerlist");
      innerListElement.setAttribute("id","innerlist"+i);

      //set the inline style to none 
      //this prevents the need for two clicks to open the list
      innerListElement.style.display = "none";

      //show or hide inner list element when the list item it is appended to is clicked
      listItem.onclick = function(x) { return function() { toggleList(x); }; }(innerListElement.id);
      
      for (var j=0; j< data.uadata[i].useragents.length; j++){
	
	var innerListItem = document.createElement("li");
	
	//pass the item index for the parent and for child as the value and id
	var radio = document.createElement("input");
	radio.setAttribute("name","ua");	
	radio.setAttribute("type","radio");	
	radio.setAttribute("id",i+","+j);	
	radio.setAttribute("value",i+","+j);
	
	var label = document.createElement("label");
	label.setAttribute("for",i+","+j);
	label.appendChild(document.createTextNode(data.uadata[i].useragents[j].description));

	
	
	innerListItem.appendChild(radio);
	innerListItem.appendChild(label);



	//prevent clicks on child element triggering the showing/hiding of the
	//child list	
	innerListElement.onclick= function stopProp (event){
	  event.stopPropagation();
	}

	innerListElement.appendChild(innerListItem);

      }
      
      listItem.appendChild(innerListElement);
      listElement.appendChild(listItem);

    }
     


});

