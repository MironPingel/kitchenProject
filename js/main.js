let can1 = document.getElementById('canL1');
let canContext = can1.getContext('2d');

let can2 = document.getElementById('canL2');
let can2Context = can2.getContext('2d');

let bgCan = document.getElementById('bg');
let bgContext = bgCan.getContext('2d');

let currentCan = can1;
let currentContext = currentCan.getContext('2d');

let lib = document.getElementById('libCan');
let libContext = lib.getContext('2d');

// State
let items = [];
let cs = null; // cs = currentSelection
let itemOnMove = false;
let selectedType = null;
let totalPrice = 0;
let lastMousePos = null;

let floor = [];
let editFloor = true;
let floorStartPoint = null;
let drawingFloor = null;


// CONTROLLS & HTML ELEMENTS
let clearBtn = document.getElementById('clear');
let gridBtn = document.getElementById('grid');
let floorBtn = document.getElementById('editFloor');
let priceText = document.getElementById('totalPrice');


// GRID
let gridTurnedOn = true;
gridBtn.addEventListener("click", function(e) {
  gridTurnedOn = !gridTurnedOn;

  if (gridTurnedOn) {
    gridBtn.innerHTML = "TURN SNAP GRID <b>OFF</b>";
    drawGrid();
  } else {
    gridBtn.innerHTML = "TURN SNAP GRID <b>ON</b>";
  }
});



let ratio = can1.width/can1.height;
let stepx = can1.width/60;
let stepy = (can1.height/60) * ratio;

if (can1.height > can1.width) {
  ratio = can1.height/can1.width;
  stepx = (can1.width/60) * ratio;
  stepy = can1.height/60;
}



let xGrid = [];
let yGrid = [];
for (var i = 0; i < can1.width; i = i+stepx) {
  xGrid.push(i);
}

for (var i = 0; i < can1.height; i = i+stepy) {
  yGrid.push(i);
}

drawGrid();




// Check if clear button is isClicked
clearBtn.addEventListener("click", function(e) {
  selectedType = null;
});

// Check if editMode button is clicked
floorBtn.addEventListener("click", function(e) {
  editFloor = !editFloor;
  update(mousePos = null, can1);
});


// Update Canvas on MouseMove
currentCan.addEventListener('mousemove', function(evt) {
  var mousePos = getMousePos(currentCan, evt);
  update(mousePos, can1);
  update(mousePos, can2);
}, false);

// Canvas 2 - Library
lib.addEventListener('mousemove', function(evt) {
  var mousePos = getMousePos(lib, evt);
}, false);



// Runs on every mouseMovement
function update(mousePos, canvas) {
  if (editFloor) {
    drawGrid();

    if (floorStartPoint) {
      // Store if width and height are postive or negative
      let initWidthSign = Math.sign(mousePos.x - floorStartPoint.x);
      let initHeightSign = Math.sign(mousePos.y - floorStartPoint.y);
      // snap width and height to grid (getClosest) and transform to previous sign (pos/neg)
      let w = getClosest(mousePos.x - floorStartPoint.x, xGrid) * initWidthSign;
      let h = getClosest(mousePos.y - floorStartPoint.y, yGrid) * initHeightSign;

      // Draw floor while creating - follow mouse
      // TODO change to context of Background Canvas
      canContext.beginPath();
      canContext.rect(floorStartPoint.x, floorStartPoint.y, w, h);
      canContext.fillStyle = "#f3f3f3";
      canContext.fill();

      // This object will be used to create the floor item & push it into the floor array
      // This is done inside the ClickEvent handler
      drawingFloor = {
        "x": floorStartPoint.x,
        "y": floorStartPoint.y,
        "width": w,
        "height": h,
      }
    }
  }

  // If no mousePosition is passed to the function (e.g. from keyboardEvents)
  // Use previous mousePosition
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

    // Turn element red if outside of floor
    if (!isInsideFloor(placeholder)) {
      placeholder.color = "red";
    }

    placeholder.draw(currentContext)
    console.log(isInsideFloor(placeholder));
  }


  // Draw all items in items array
  for (let box of items) {
    if (box) {
      // Decide which layer to draw them on
      if (box.layer === "top") {
        box.draw(canContext);
      }
      if (box.layer === "bottom"){
        box.draw(can2Context);
      }
    }
  }


  if (floor) {
    // Draw floor - follow mouse
    for(let box of floor) {
      bgContext.beginPath();
      bgContext.rect(box.x, box.y, box.width, box.height);
      bgContext.fillStyle = "lightgrey";
      bgContext.fill();
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


// Listen for ESC press (to abort drawing of Floor)
document.addEventListener("keyup", function(event) {
    if (event.keyCode == 27) {
      floorStartPoint = null;
      drawingFloor = null;
      update(mousePos = null, can1);
    }
});







// Create object onClick
// -----------------------------

currentCan.addEventListener('click', function(evt) {
  let mousePos = getMousePos(currentCan, evt);

  if (editFloor) {

    if (drawingFloor) {
      floor.push(drawingFloor);
      floorStartPoint = null;
      drawingFloor = null;
      update(mousePos, can1);
    } else {
      floorStartPoint = {
        "x": getClosest(mousePos.x, xGrid),
        "y": getClosest(mousePos.y, yGrid)
      };
      console.log("new");
    }


  } else {

    // If item is "picked up" then do this onClick
    if (itemOnMove) {
      cs.x = mousePos.x - cs.width/2;
      cs.y = mousePos.y - cs.height/2;
      // Add the item that is "picked up" to the items array again

      items.push(checkBoundries(cs));
      cs = null;
      //cs = new Box(0,0,selectedType.width, selectedType.height, selectedType.color, selectedType.type, selectedType.price, selectedType.layer);
      itemOnMove = false;

    } else {  // If no item is currently "picked up"

      let selectedTypeLayer = '';

      if (selectedType !== null) {
        selectedTypeLayer = itemTypes[selectedType].layer;
      }
      // First check if the click is inside an exsisting box
      for (var i = 0; i < items.length; i++) {

        if (items[i].isClicked(mousePos) && selectedTypeLayer !== "top") {
          console.log(items[i]);
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



// MOUSE POSITION

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}


// Difference (distance from startpoint)
function diff(a,b) {
  return Math.abs(a-b);
}



// Place new box (add BoxType in the future)
function placeBox (mousePos) {
  //let randomRGB = "rgb(" + Math.floor((Math.random() * 255)) + "," + Math.floor((Math.random() * 255)) + "," + Math.floor((Math.random() * 255)) + ")";
  if (selectedType) {
    let sel = itemTypes[selectedType];

    let x = mousePos.x;
    let y = mousePos.y;

    if (gridTurnedOn) {
      x = getClosest(mousePos.x, xGrid);
      y = getClosest(mousePos.y, yGrid);
    }

    let box = new Box(x, y, sel.width, sel.height, sel.color, sel.type, sel.price, sel.layer);
    box = checkBoundries(box);

    if (checkCollision(box)) {

      // Check if item is wall item on floor item
      if (sel.layer === "top") {
        items.push(box);
        box.draw(currentContext);
        updatePrice();
      } else { // if not - then it cant be placed
        alert("You cant place Items ontop of each other.");
      }

    } else {
      items.push(box);
      box.draw(currentContext);
      updatePrice();
    }
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


// Find closes Grid line
// ARGUMENTS: test = coordiante, x or y   |   arr = grid array (x or y)
function getClosest(test, arr) {
  test = Math.abs(test);
  var num = result = 0;
  var flag = 0;
  for(var i = 0; i < arr.length; i++) {
    num = arr[i];
    if(num < test) {
      result = num;
      flag = 1;
    }else if (num == test) {
      result = num;
      break;
    }else if (flag == 1) {
      if ((num - test) < (Math.abs(arr[i-1] - test))){
        result = num;
      }
      break;
    }else{
      break;
    }
  }
  return result;
}



// Check for collision/overlap with Items in Item array

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




// Check for collision/overlap

function isInsideFloor (item) {

  let iX = item.x;
  let iY = item.y;
  let iW = item.width;
  let iH = item.height;

  for (var i = 0; i < floor.length; i++) {
    let it = floor[i];
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



// Draw grid

function drawGrid() {
  for (var i = 0; i < xGrid.length; i++) {
    canContext.beginPath();
    canContext.moveTo(xGrid[i],0);
    canContext.lineTo(xGrid[i],can1.height);
    canContext.stroke();
    canContext.strokeStyle = "lightgrey";

    can2Context.beginPath();
    can2Context.moveTo(xGrid[i],0);
    can2Context.lineTo(xGrid[i],can1.height);
    can2Context.stroke();
    can2Context.strokeStyle = "lightgrey";
  }

  for (var i = 0; i < yGrid.length; i++) {
    canContext.beginPath();
    canContext.moveTo(0,yGrid[i]);
    canContext.lineTo(can1.width, yGrid[i]);
    canContext.stroke();
    canContext.strokeStyle = "lightgrey";

    can2Context.beginPath();
    can2Context.moveTo(0,yGrid[i]);
    can2Context.lineTo(can1.width, yGrid[i]);
    can2Context.stroke();
    can2Context.strokeStyle = "lightgrey";
  }
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


// SIGN polyfill
if (!Math.sign) {
  Math.sign = function(x) {
    // If x is NaN, the result is NaN.
    // If x is -0, the result is -0.
    // If x is +0, the result is +0.
    // If x is negative and not -0, the result is -1.
    // If x is positive and not +0, the result is +1.
    return ((x > 0) - (x < 0)) || +x;
    // A more aesthetical persuado-representation is shown below
    //
    // ( (x > 0) ? 0 : 1 )  // if x is negative then negative one
    //          +           // else (because you cant be both - and +)
    // ( (x < 0) ? 0 : -1 ) // if x is positive then positive one
    //         ||           // if x is 0, -0, or NaN, or not a number,
    //         +x           // Then the result will be x, (or) if x is
    //                      // not a number, then x converts to number
  };
}
