/*globals document, window */
'use strict';

/*
 * nmlCanvas77.js
 */
let initialize = function () {
    mycv1 = Object.create(Canvas);
    mycv1.init('myCanvas0', 'transparent');
    mycv1.canvas.addEventListener('click', add);
    mycv = Object.create(Canvas);
    mycv.init('myCanvas1', 'transparent');
    mycv.canvas.addEventListener('click', hittest);
    // create objects
    // put in array

    let shape1 = Object.create(Shape);
    shape1.init(mycv, 20, 10, 120, 40, 'blue');
    let shape2 = Object(Shape);
    shape2.init(mycv, 200, 100, 80, 60, 'green');
    shapes.push(shape1);
    shapes.push(shape2);
    repeater(mycv, shapes);

}
//redraw the objects
let redraw = function (cv, arr) {
    cv.clear();
    cv.prep();
    // loop through array and draw
    for (var i = 0; i < arr.length; i++) {
      alert("abc ");
        arr[i].draw();
    }
}


let repeater = function (cv, arr) {
    // if this is an animation build a setInterval loop here
    // if not, just draw
    redraw(cv, arr);
}

//check what object you click on, at canvas1
let hittest = function (ev) {
    for (let i = 0; i < shapes.length; i++) {
        shapes1 = [];
        let cx = shapes[i].ctx;
        cx.beginPath();
        cx.rect(shapes[i].x, shapes[i].y, shapes[i].width, shapes[i].height);
        cx.closePath();
        let bb = this.getBoundingClientRect();    // canvas size and pos
        // mouse to canvas coordinates
        let x = (ev.clientX - bb.left) * (this.width / bb.width);
        let y = (ev.clientY - bb.top) * (this.height / bb.height);
        if (cx.isPointInPath(x, y)) {
             shapes1.push(shapes[i]);
             console.log(shapes1)
        } else {
             //window.alert("nohit: "+x+","+y);
        }
    }
}
// Supposed to add the copied object to the other canvas array
let add = function (ev) {
    redraw(mycv1, shapes1);
    console.log('hi');
}


let shapes = [];
let shapes1 = [];
let mycv;
let mycv1;
window.addEventListener('load', initialize);
