import {
  ratio,
  randomColor,
  ratioFixedSizeX,
  ratioFixedSizeY,
} from "./utilities.js";
import Rectangle from "./rectangleObject.js";
import ImageObject from "./imageobject.js";
import { INTERVAL, BOX_SIZE, BOX_COLOR } from "./constants.js";
import TextObject from "./textobject.js";
var redraw = { status: false };
var isDrag = false;
var isResizeDrag;
var canvas;
var ctx;
var mx, my;
var selectedObj = -1;
var selectionHandles = [];
var expectResize = null;
var objects = [];
var HEIGHT;
var WIDTH;
var img;
var topLayer;
var topLayerContext;
var offsetx, offsety;
var actualCanvasHeight, actualCanvasWidth;

function addRectangle(x, y, w, h, fill) {
  var rect = new Rectangle();
  rect.x = x;
  rect.y = y;
  rect.w = w;
  rect.h = h;
  rect.fill = fill;
  objects.push(rect);
  redraw.status = false;
}

function initializeLayers(oCtx, oCanvas, image) {
  img = image;
  canvas = oCanvas;
  ctx = oCtx;

  image.onload = () => {
    HEIGHT = image.height;
    WIDTH = image.width;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    setRatio();

    topLayer = document.createElement("canvas");
    topLayer.height = HEIGHT;
    topLayer.width = WIDTH;
    topLayerContext = topLayer.getContext("2d");

    setInterval(mainDraw, INTERVAL);
    canvas.onmousedown = handleMouseDown;
    canvas.onmouseup = handleMouseUp;
    canvas.onmousemove = handleMouseMove;

    for (var i = 0; i < 8; i++) {
      selectionHandles.push(new Rectangle());
    }

    // addRectangle(0, 0, 0, 0, randomColor());
  };
}

function clear(c) {
  c.clearRect(0, 0, WIDTH, HEIGHT);
}

function mainDraw() {
  if (redraw.status == false) {
    clear(ctx);

    ctx.drawImage(img, 0, 0, WIDTH, HEIGHT);
    for (var i = 0; i < objects.length; i++) {
      objects[i].draw(ctx, selectedObj, selectionHandles);
    }
    redraw.status = true;
  }
}

function handleMouseMove(e) {
  if (isDrag) {
    getMouse(e);

    selectedObj.x = mx - offsetx;
    selectedObj.y = my - offsety;

    redraw.status = false;
  } else if (isResizeDrag) {
    var oldx = selectedObj.x;
    var oldy = selectedObj.y;

    switch (expectResize) {
      case 0:
        selectedObj.x = mx;
        selectedObj.y = my;
        selectedObj.w += oldx - mx;
        selectedObj.h += oldy - my;
        break;
      case 1:
        selectedObj.y = my;
        selectedObj.h += oldy - my;
        break;
      case 2:
        selectedObj.y = my;
        selectedObj.w = mx - oldx;
        selectedObj.h += oldy - my;
        break;
      case 3:
        selectedObj.x = mx;
        selectedObj.w += oldx - mx;
        break;
      case 4:
        selectedObj.w = mx - oldx;
        break;
      case 5:
        selectedObj.x = mx;
        selectedObj.w += oldx - mx;
        selectedObj.h = my - oldy;
        break;
      case 6:
        selectedObj.h = my - oldy;
        break;
      case 7:
        selectedObj.w = mx - oldx;
        selectedObj.h = my - oldy;
        break;
    }

    redraw.status = false;
  }

  getMouse(e);
  if (selectedObj !== -1 && !isResizeDrag) {
    for (var i = 0; i < 8; i++) {
      var cur = selectionHandles[i];

      if (
        mx >= cur.x &&
        mx <= cur.x + BOX_SIZE &&
        my >= cur.y &&
        my <= cur.y + BOX_SIZE
      ) {
        expectResize = i;

        redraw.status = false;

        switch (i) {
          case 0:
            this.style.cursor = "nw-resize";
            break;
          case 1:
            this.style.cursor = "n-resize";
            break;
          case 2:
            this.style.cursor = "ne-resize";
            break;
          case 3:
            this.style.cursor = "w-resize";
            break;
          case 4:
            this.style.cursor = "e-resize";
            break;
          case 5:
            this.style.cursor = "sw-resize";
            break;
          case 6:
            this.style.cursor = "s-resize";
            break;
          case 7:
            this.style.cursor = "se-resize";
            break;
        }
        return;
      }
    }

    isResizeDrag = false;
    expectResize = null;
    this.style.cursor = "auto";
  }
}

function handleMouseDown(e) {
  getMouse(e);

  if (expectResize !== null) {
    isResizeDrag = true;
    return;
  }

  for (var i = objects.length - 1; i >= 0; i--) {
    objects[i].draw(topLayerContext);

    var imageData = topLayerContext.getImageData(mx, my, 1, 1);
    if (imageData.data[3] > 0) {
      selectedObj = objects[i];
      offsetx = mx - selectedObj.x;
      offsety = my - selectedObj.y;
      selectedObj.x = mx - offsetx;
      selectedObj.y = my - offsety;
      isDrag = true;

      redraw.status = false;
      clear(topLayerContext);
      return;
    }
  }
  clear(topLayerContext);
  selectedObj = -1;
  redraw.status = false;
}

function handleMouseUp() {
  isDrag = false;
  isResizeDrag = false;
  expectResize = null;
}

function setRatio() {
  actualCanvasHeight = parseFloat(window.getComputedStyle(canvas).height);
  actualCanvasWidth = parseFloat(window.getComputedStyle(canvas).width);

  ratio.xratio = actualCanvasHeight / HEIGHT;
  ratio.yratio = actualCanvasWidth / WIDTH;
}

window.onresize = setRatio;

document.getElementById("newRectangle").addEventListener("click", (e) => {
  addRectangle(
    ratioFixedSizeX(50),
    ratioFixedSizeY(50),
    ratioFixedSizeX(100),
    ratioFixedSizeY(100),
    randomColor()
  );
});

document.getElementById("newText").addEventListener("submit", (e) => {
  e.preventDefault();
  var data = new FormData(newText);
  var textProperties = {};
  for (const [name, value] of data) {
    textProperties[name] = value;
  }
  var textLayer = new TextObject(textProperties, redraw, objects);
  objects.push(textLayer);
  redraw.status = false;
});

var newImageLayer = document.getElementById("newImage");
newImageLayer.addEventListener("change", (e) => {
  var file = newImageLayer.files[0];
  var fr = new FileReader();
  fr.onload = createImage;
  fr.readAsDataURL(file);

  function createImage() {
    var imageLayer = new ImageObject(redraw, 200, 200);
    imageLayer.image.src = fr.result;
    objects.push(imageLayer);
  }
});

function getMouse(e) {
  var element = canvas;
  var offsetX = 0;
  var offsetY = 0;

  offsetX = canvas.getBoundingClientRect().left;
  offsetY = canvas.getBoundingClientRect().top;

  mx = ratioFixedSizeX(e.pageX - offsetX);
  my = ratioFixedSizeY(e.pageY - offsetY);
}

// clears all previous objects and load the image to start editing

export { initializeLayers };
