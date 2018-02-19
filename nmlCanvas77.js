/*globals document, window */
'use strict';

/*
 * nmlCanvas77.js
 */



let hitest = function (ev) {
    for (let i = 0; i < shapes.length; i++) {
        let cx = shapes[i].ctx;
        cx.beginPath();
        cx.rect(shapes[i].x, shapes[i].y, shapes[i].width, shapes[i].height);
        cx.closePath();
        let bb = this.getBoundingClientRect();    // canvas size and pos
        // mouse to canvas coordinates
        let x = (ev.clientX - bb.left) * (this.width / bb.width);
        let y = (ev.clientY - bb.top) * (this.height / bb.height);
        if (cx.isPointInPath(x, y)) {
            cx.fillStyle = "yellow";
            cx.fill();
            // window.alert("hit: "+x+","+y);
        } else {
            // window.alert("nohit: "+x+","+y);
        }
    }
}



window.addEventListener('load', initialize);
