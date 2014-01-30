self.port.on("restore-options",function(options){

  //set UA Tabs elements
  var timerdd = document.getElementById('timerdd');


  for (var i = 0; i < timerdd.options.length; i++) {
    
    if (timerdd.options[i].value === options[0]) {
      timerdd.selectedIndex = i;
      break;
    }
  }

  document.getElementById(options[1]).checked = true;
  document.getElementById('notify').checked = options[2];

  //set Extras Tab Elements
  document.getElementById('fonts').checked = options[3];
  document.getElementById('dom').checked = options[4];
  document.getElementById('history').checked = options[5];
  document.getElementById('cache').checked = options[6];
  document.getElementById('geo').checked = options[7];
  document.getElementById('dns').checked = options[11];
  document.getElementById('link').checked = options[12];
  
  //header spoofing
  document.getElementById('xff').checked = options[8];
  document.getElementById('via').checked = options[9];
  document.getElementById('ifnone').checked = options[10];
  document.getElementById('acceptd').checked = options[13];
  document.getElementById('accepte').checked = options[14];
  document.getElementById('acceptl').checked = options[15];
  document.getElementById('spoof').checked = options[16];
  
});

self.port.once('tab_listener',function(){
  //get all the tabs
  var tabs = document.getElementById("tabs").children;

  //add on click listener to each
  for (var i =0; i< tabs.length;i++){
    tabs[i].onclick = function(x,y) { return function() { changeTab(x,y); }; }(tabs[i].children[0],tabs);
  } 
});



self.port.once('ua_list', function(data) {
   
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

