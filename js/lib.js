const drawnItems = [];

// Draw all items in Library (loop through itemTypes array)
for (var type in itemTypes) {
  if (itemTypes.hasOwnProperty(type)) {
    let t = itemTypes[type];
    let o = new Box(t.x, t.y, t.width, t.height, t.color, type, t.price, t.layer);
    o.draw(libContext);
    drawnItems.push(o);

    // Draw text for each element 50px above it
    libContext.font = '28px sans-serif';
    libContext.textAlign = 'left';
    libContext.fillText(t.title, t.x-t.width/2, t.y-60);
    libContext.font = '17px sans-serif';
    libContext.fillText(t.price + ' DKR', t.x-t.width/2, t.y-40);
  }
}

// Regsiter when an item is clicked inside Library
lib.addEventListener('click', function(evt) {
  let mousePos = getMousePos(lib, evt);
  for (var i = 0; i < drawnItems.length; i++) {
    if (drawnItems[i].isClicked(mousePos)) {
      if (editFloor) {
        flashMessage("Currently editing Floor", "You are still in in floor edit mode. You need to switch that off before you can place elements.", "error");
      } else {
        selectedType = drawnItems[i].type;
        console.log(selectedType);
      }
    }
  }
})
