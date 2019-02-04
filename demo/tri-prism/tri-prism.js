// -------------------------- demo -------------------------- //

var canvas = document.querySelector('canvas');
var proxyCanvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
var w = 14 * Math.sqrt(2);
var h = 14 * Math.sqrt(2);
var minWindowSize = Math.min( window.innerWidth - 20, window.innerHeight - 20 );
var zoom = Math.floor( minWindowSize / w );

var canvasWidth = canvas.width = w * zoom;
var canvasHeight = canvas.height = h * zoom;
var shrink = 1/3;
proxyCanvas.width = canvasWidth * shrink;
proxyCanvas.height = canvasHeight * shrink;
var TAU = Zdog.TAU;

var illo = new Zdog.Illo({
  canvas: proxyCanvas,
  rotate: { x: -35/360 * TAU, y: 45/360 * TAU },
  zoom: zoom,
});


var isRotating = false;

var navy = '#456';
var red = '#D21';
var ochre = '#F90';

document.body.style.backgroundColor = '#EDC';

// -- illustration shapes --- //

function makePrism( options ) {
  var prism = new Zdog.Anchor({
    addTo: illo,
    rotate: options.rotate,
  });

  var rotor = new Zdog.Anchor({
    addTo: prism,
  });

  var positioner = new Zdog.Anchor({
    addTo: rotor,
    translate: { z: 1, y: -1 },
  });

  var triangle = new Zdog.Shape({
    addTo: positioner,
    path: [
      { z:  1, y:  1 },
      { z: -1, y: -1 },
      { z: -1, y:  1 },
    ],
    color: red,
    fill: true,
    stroke: 1/zoom,
  });
  triangle.copy({
    translate: { x: -2 },
    color: navy,
  });

  // slope
  new Zdog.Shape({
    addTo: positioner,
    path: [
      { x: -2, y: 1, z: 1 },
      { x: -2, y: -1, z: -1 },
      { x:  0, y: -1, z: -1 },
      { x:  0, y:  1, z:  1 },
    ],
    color: ochre,
    fill: true,
    stroke: 1/zoom,
  });

  var base = new Zdog.Rect({
    addTo: positioner,
    width: 2,
    height: 2,
    translate: { x: -1, z: -1 },
    rotate: { y: TAU/2 },
    color: navy,
    fill: true,
    stroke: 1/zoom,
    backface: false,
  });
  base.copy({
    translate: { x: -1, y: 1 },
    rotate: { x: -TAU/4 },
    color: red,
  });

  return prism;
}

var prismA = makePrism({

});

var prismB = makePrism({
  rotate: { x: TAU/4, z: TAU/4 },
});

var prismC = makePrism({
  rotate: { y: -TAU/4, z: -TAU/4 },
});

// -- animate --- //

var t = 0;
var tSpeed = 1/80;

// -- update -- //

var transforms = {
  0: function( prism, easeT ) {
    prism.children[0].rotate.y = 0;
    prism.children[0].rotate.z = 0;
    prism.children[0].rotate.x = easeT;
  },
  1: function( prism, easeT ) {
    prism.children[0].rotate.y = -easeT;
  },
  2: function( prism, easeT ) {
    prism.children[0].rotate.y = -easeT - TAU/4;
  },
  3: function( prism, easeT ) {
    prism.children[0].rotate.z = -easeT;
  },
  4: function( prism, easeT ) {
    prism.children[0].rotate.z = -easeT - TAU/4;
  },
  5: function( prism, easeT ) {
    prism.children[0].rotate.x = easeT + TAU/4;
  },

};

function update() {
  var easeT = Zdog.easeInOut( t, 4 ) * TAU/4;

  var turn = Math.floor( t % 6 );
  var transform = transforms[ turn ];

  transform( prismA, easeT );
  transform( prismB, easeT );
  transform( prismC, easeT );

  t += tSpeed;

  illo.updateGraph();
}

// -- render -- //

var shiftX = Math.round( 3 * Math.sqrt(2) * zoom );
var shiftY = Math.round( 2 * Math.sqrt(2) * Math.sqrt(3)/2 * zoom );

function render() {
  illo.renderGraph();

  ctx.clearRect( 0, 0, canvasWidth, canvasHeight );

  ctx.save();
  ctx.translate( Math.round( w * shrink * zoom ), Math.round( h * shrink * zoom ) );

  for ( var col = -2; col < 3; col++ ) {
    for ( var row = -2; row < 3; row++ ) {
      var x = col * shiftX;
      var y = ( row * 2 + col % 2 ) * shiftY;
      ctx.drawImage( illo.canvas, x, y );
    }
  }

  ctx.restore();
}

function animate() {
  update();
  render();
  requestAnimationFrame( animate );
}

animate();

// ----- inputs ----- //

// click drag to rotate
var dragStartAngleX, dragStartAngleY;

new Zdog.Dragger({
  startElement: canvas,
  onPointerDown: function() {
    isRotating = false;
    dragStartAngleX = illo.rotate.x;
    dragStartAngleY = illo.rotate.y;
  },
  onPointerMove: function( pointer, moveX, moveY ) {
    var angleXMove = moveY / canvasWidth * TAU;
    var angleYMove = moveX / canvasWidth * TAU;
    illo.rotate.x = dragStartAngleX + angleXMove;
    illo.rotate.y = dragStartAngleY + angleYMove;
  },
});

