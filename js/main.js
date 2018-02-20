let can1 = document.getElementById('canL1');
// let canContext = can1.getContext('2d');

let can2 = document.getElementById('canL2');
// let can2Context = can2.getContext('2d');

let currentCan = can1;
let currentContext = currentCan.getContext('2d');

let lib = document.getElementById('libCan');
let libContext = lib.getContext('2d');

let items = [];
let cs = null; // cs = currentSelection
let itemOnMove = false;
let selectedType = null;
let totalPrice = 0;
let priceText = document.getElementById('totalPrice');
let lastMousePos = null;


function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}




// Update Canvas on MouseMove
currentCan.addEventListener('mousemove', function(evt) {
  var mousePos = getMousePos(currentCan, evt);
  update(mousePos, currentCan);
}, false);

// Canvas 2 - Library
lib.addEventListener('mousemove', function(evt) {
  var mousePos = getMousePos(lib, evt);
}, false);



// Runs on every mouseMovement
function update(mousePos, canvas) {
  if (mousePos === null) {
    mousePos = lastMousePos;
  } else {
    lastMousePos = mousePos;
  }

  let context = canvas.getContext("2d");
  // Clear before drawing again
  context.clearRect(0, 0, canvas.width, canvas.height);

  if (cs) {
    // Center the CS (currentSelection) on the cursor
    cs.x = mousePos.x - cs.width/2;
    cs.y = mousePos.y - cs.height/2;
    // draw the box that follows the cursor
    cs.draw(context)
  } else if (selectedType !== null){
    let sel = itemTypes[selectedType];
    let x = mousePos.x;
    let y = mousePos.y;
    let placeholder = new Box(x, y, sel.width, sel.height, sel.color, sel.type, sel.price, sel.layer);
    placeholder.draw(context)
  }

  // Draw all items in items array
  for (let box of items) {
    if (box) {
      box.draw(context);
    }
  }
}





// Listen for r press (to rotate)
document.addEventListener("keypress", function(event) {

    if (event.keyCode == 114) {
      if (cs) {
        rotateItem(cs);
        update(mousePos = null, currentCan)
      } else if (selectedType !== null){
        console.log("Rotate Template");
        rotateItem(itemTypes[selectedType]);
        update(mousePos = null, currentCan)
      }
    }
});








// Create object onClick
// -----------------------------

currentCan.addEventListener('click', function(evt) {
  let mousePos = getMousePos(currentCan, evt);

  // If item is "picked up" then do this onClick
  if (itemOnMove) {
    cs.x = mousePos.x - cs.width/2;
    cs.y = mousePos.y - cs.height/2;
    // Add the item that is "picked up" to the items array again

    items.push(checkBoundries(cs));
    cs = new Box(0,0,selectedType.width, selectedType.height, selectedType.color, selectedType.type, selectedType.price, selectedType.layer);
    itemOnMove = false;

  } else {  // If no item is currently "picked up"

    // First check if the click is inside an exsisting box
    for (var i = 0; i < items.length; i++) {
      if (items[i].isClicked(mousePos)) {
        console.log("HIT!");
        // Set global CS (currentSelection) = to the clicked Box
        cs = items[i];
        // Remove the selected box from items array
        items.splice(i, 1);
        // Set state to itemOnMove
        itemOnMove = true;
      }
    }

    // if not item is currently being moved, then create a new item onClick
    if(!itemOnMove) {
      placeBox(mousePos);
    }
  }
}, false); // end of EventListener (Click)




currentCan.addEventListener('dblclick', function(evt) {
  let mousePos = getMousePos(currentCan, evt);
  for (var i = 0; i < items.length; i++) {
    if (items[i].isClicked(mousePos)) {
      items.splice(i, 1);
      updatePrice();
      cs = null;
    }
  }
}, false);




// ------ Functions & "Classes" ------
// -----------------------------------


// Place new box (add BoxType in the future)
function placeBox (mousePos) {
  //let randomRGB = "rgb(" + Math.floor((Math.random() * 255)) + "," + Math.floor((Math.random() * 255)) + "," + Math.floor((Math.random() * 255)) + ")";
  let sel = itemTypes[selectedType];
  let box = new Box(mousePos.x, mousePos.y, sel.width, sel.height, sel.color, sel.type, sel.price, sel.layer);
  box = checkBoundries(box);

  if (checkCollision(box)) {
    alert("You cant place Items ontop of each other.");
  } else {
    items.push(box);
    box.draw(currentContext);
    updatePrice();
  }
}



// Check if item is inside the confains of the canvas, otherwise move it to the edge

function checkBoundries (item) {
  if (item.x + item.width > currentCan.width) {
    item.x = currentCan.width - item.width;
  } else if (item.x < 0) {
    item.x = 0;
  }

  if (item.y + item.width > currentCan.height) {
    item.y = currentCan.height - item.height;
  } else if (item.y < 0) {
    item.y = 0;
  }
  return item;
}


function checkCollision (item) {

  let iX = item.x;
  let iY = item.y;
  let iW = item.width;
  let iH = item.height;

  for (var i = 0; i < items.length; i++) {
    let it = items[i];
    let x = it.x;
    let y = it.y;
    let w = it.width;
    let h = it.height;

    if (iX < x + w &&
       iX + iW > x &&
       iY < y + h &&
       iH + iY > y) {
      return true;
    }
  }
  return false;
}


// Update price

function updatePrice() {
  let price = 0;

  for (var i = 0; i < items.length; i++) {
    price += items[i].price;
  }

  priceText.innerHTML = price;
}





// Rotate Function - Switches height and width values

function rotateItem (item) {
  let prevWidth = item.width;
  let prevHeight = item.height;
  item.width = prevHeight;
  item.height = prevWidth;
  return item;
}





// BoxObject
function Box (x, y, width, height, color, type, price, layer) {
  this.width = width;
  this.height = height;
  this.x = x - width/2;
  this.y = y - height/2;
  this.color = color;
  this.type = type;
  this.price = price;
  this.layer = layer;

  this.draw = (context) => {
    context.beginPath();
    context.rect(this.x, this.y, this.width, this.height);
    context.fillStyle = this.color;
    context.fill();
  }

  this.isClicked = (mousePos) => {
    let xTop = this.x + this.width;
    let xLow = this.x;
    let yTop = this.y + this.height;
    let yLow = this.y;

    // Return true if Click is inside box - false if not
    return mousePos.x < xTop && mousePos.x > xLow && mousePos.y < yTop && mousePos.y > yLow;
  }

}
