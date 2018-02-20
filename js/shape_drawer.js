$(function() {
  var letsdraw = false;
  var theCanvas = document.getElementById('can');
  var ctx = theCanvas.getContext('2d');
  var canvasOffset = $('#can').offset();
  var lastpoints = {
    "x": 0,
    "y": 0
  };

  $('#can').mousemove(function(e) {
    if (letsdraw === true) {
      lastpoints.x = e.pageX;
      lastpoints.y = e.pageY;
    }
  });

  $('#can').mousedown(function(e) {
    letsdraw = true;
    ctx.strokeStyle = 'lightgrey';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(e.pageX - canvasOffset.left, e.pageY - canvasOffset.top);
  });

  $('#can').mouseup(function(e) {
    ctx.lineTo(lastpoints.x - canvasOffset.left, lastpoints.y - canvasOffset.top);
    ctx.stroke();
    letsdraw = false;
  });
});
