let drawnItems = [];

// Draw all items in Library (loop through itemTypes array)
for (var type in itemTypes) {
  if (itemTypes.hasOwnProperty(type)) {
    let t = itemTypes[type];
    let o = new Box(t.x, t.y, t.width, t.height, t.color, type, t.price);
    o.draw(libContext);
    drawnItems.push(o);

    // Draw text for each element 50px above it
    libContext.font = '28px sans-serif';
    libContext.textAlign = 'center';
    libContext.fillText(t.title, t.x, t.y-60);
    libContext.font = '16px sans-serif';
    libContext.fillText(t.price + ' DKR', t.x, t.y-40);
  }
}

// Regsiter when an item is clicked inside Library
lib.addEventListener('click', function(evt) {
  let mousePos = getMousePos(lib,evt);

  for (var i = 0; i < drawnItems.length; i++) {
    if (drawnItems[i].isClicked(mousePos)) {
      cs = drawnItems[i];
      selectedType = drawnItems[i];
    }
  }
})
