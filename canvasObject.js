'use strict';

/*
CanvasObject
Contain objects for Assignment 4 in JS.
*/

let Canvas = {
  init(canvasId, color) {
    this.canvas = $(canvasId);
    this.context = this.canvas.getContext("2d");
    this.color = color;
    this.prep();
  },
  prep() {
    this.context.fillStyle =  this.color;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  },
  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.heigh);
  },
  getContext() {
    return this.context;
  },
  getHeight() {
    return this.canvas.height;
  },
  getWidth() {
    return this.canvas.width;
  }
};
