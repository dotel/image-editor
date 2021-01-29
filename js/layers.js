import {
  ratio,
  randomColor,
  ratioFixedSizeX,
  ratioFixedSizeY,
  clearContext,
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
var mouseX, mouseY;
var selectedObject = -1;
var selectionHandles = [];
var resizeHandle = null;
var objects = [];
var HEIGHT;
var WIDTH;
var img;
var topLayer;
var topLayerContext;
var offsetx, offsety;
var actualCanvasHeight, actualCanvasWidth;

function initializeLayers(originalCtx, originalCanvas, image) {
  img = image;
  canvas = originalCanvas;
  ctx = originalCtx;

  canvas.onmousedown = handleMouseDown;
  canvas.onmouseup = handleMouseUp;
  canvas.onmousemove = handleMouseMove;

  image.onload = () => {
    HEIGHT = image.height;
    WIDTH = image.width;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    ctx.drawImage(img, 0, 0, WIDTH, HEIGHT);

    setRatio();

    // A top layer canvas to draw all the objects which are constantly redrawn
    topLayer = document.createElement("canvas");
    topLayer.height = HEIGHT;
    topLayer.width = WIDTH;
    topLayerContext = topLayer.getContext("2d");

    setInterval(mainDraw, INTERVAL);

    for (var i = 0; i < 8; i++) {
      selectionHandles.push(new Rectangle());
    }
  };
}

function mainDraw() {
  if (redraw.status == true) {
    clearContext(ctx, WIDTH, HEIGHT);

    ctx.drawImage(img, 0, 0, WIDTH, HEIGHT);
    for (var i = 0; i < objects.length; i++) {
      objects[i].draw(ctx, selectedObject, selectionHandles);
    }
    redraw.status = false;
  }
}

function handleMouseMove(e) {
  if (isDrag) {
    setMouseLocation(e);
    selectedObject.x = mouseX - offsetx;
    selectedObject.y = mouseY - offsety;
    redraw.status = true;
  } else if (isResizeDrag) {
    resizeSelectedObject();
  }
  setMouseLocation(e);
  if (selectedObject !== -1 && !isResizeDrag) {
    for (var i = 0; i < 8; i++) {
      var selectionHandle = selectionHandles[i];

      if (
        mouseX >= selectionHandle.x &&
        mouseX <= selectionHandle.x + BOX_SIZE &&
        mouseY >= selectionHandle.y &&
        mouseY <= selectionHandle.y + BOX_SIZE
      ) {
        resizeHandle = i;

        redraw.status = true;

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
    resizeHandle = null;
    this.style.cursor = "auto";
  }
}

function resizeSelectedObject() {
  var oldx = selectedObject.x;
  var oldy = selectedObject.y;

  switch (resizeHandle) {
    case 0:
      selectedObject.x = mouseX;
      selectedObject.y = mouseY;
      selectedObject.width += oldx - mouseX;
      selectedObject.height += oldy - mouseY;
      break;
    case 1:
      selectedObject.y = mouseY;
      selectedObject.height += oldy - mouseY;
      break;
    case 2:
      selectedObject.y = mouseY;
      selectedObject.width = mouseX - oldx;
      selectedObject.height += oldy - mouseY;
      break;
    case 3:
      selectedObject.x = mouseX;
      selectedObject.width += oldx - mouseX;
      break;
    case 4:
      selectedObject.width = mouseX - oldx;
      break;
    case 5:
      selectedObject.x = mouseX;
      selectedObject.width += oldx - mouseX;
      selectedObject.height = mouseY - oldy;
      break;
    case 6:
      selectedObject.height = mouseY - oldy;
      break;
    case 7:
      selectedObject.width = mouseX - oldx;
      selectedObject.height = mouseY - oldy;
      break;
  }
  redraw.status = true;
}

function handleMouseDown(e) {
  setMouseLocation(e);
  if (resizeHandle !== null) {
    isResizeDrag = true;
    return;
  }
  for (var i = objects.length - 1; i >= 0; i--) {
    objects[i].draw(topLayerContext);

    var imageData = topLayerContext.getImageData(mouseX, mouseY, 1, 1);
    if (imageData.data[3] > 0) {
      selectedObject = objects[i];
      offsetx = mouseX - selectedObject.x;
      offsety = mouseY - selectedObject.y;
      selectedObject.x = mouseX - offsetx;
      selectedObject.y = mouseY - offsety;
      isDrag = true;

      redraw.status = true;
      clearContext(topLayerContext, WIDTH, HEIGHT);
      return;
    }
  }
  clearContext(topLayerContext, WIDTH, HEIGHT);
  selectedObject = -1;
  redraw.status = true;
}

function handleMouseUp() {
  isDrag = false;
  isResizeDrag = false;
  resizeHandle = null;
}

window.onresize = setRatio;

function setRatio() {
  actualCanvasHeight = parseFloat(window.getComputedStyle(canvas).height);
  actualCanvasWidth = parseFloat(window.getComputedStyle(canvas).width);

  ratio.xratio = actualCanvasHeight / HEIGHT;
  ratio.yratio = actualCanvasWidth / WIDTH;
}

// clears all previous objects and load the new image to start editing
function clearLayers() {
  objects = [];
}

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
  var textLayer = new TextObject(textProperties, redraw, objects, canvas);
  objects.push(textLayer);
  redraw.status = true;
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

function setMouseLocation(e) {
  var offsetX = 0;
  var offsetY = 0;

  offsetX = canvas.getBoundingClientRect().left;
  offsetY = canvas.getBoundingClientRect().top;

  mouseX = ratioFixedSizeX(e.pageX - offsetX);
  mouseY = ratioFixedSizeY(e.pageY - offsetY);
}

function addRectangle(x, y, width, height, fill) {
  var rect = new Rectangle();
  rect.x = x;
  rect.y = y;
  rect.width = width;
  rect.height = height;
  rect.fill = fill;
  objects.push(rect);
  redraw.status = true;
}

export { initializeLayers, clearLayers };
