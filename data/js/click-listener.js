this.addEventListener('click', function(event){
  
  if(event.button == 2 || (event.button == 0 && event.shiftKey == true))
    self.port.emit('right-click');
    event.preventDefault();

}, true);
