import ImageObject from "./imageobject.js";
import Layers from "./layers.js";
import Rectangle from "./rectangleObject.js";
import { randomColor } from "./utilities.js";

let canvas = document.getElementById("drawScreen");
let ctx = canvas.getContext("2d");
let cropBox = {};

let image = new Image();
let maskImageObject;

image.src = "./images/test.jpg";

let layers = new Layers();
layers.initializeLayers(ctx, canvas, image);

const tools = document.querySelectorAll("[data-tab-target]");
const toolContent = document.querySelectorAll("[data-tab-content]");

tools.forEach((tab) => {
  tab.addEventListener("click", () => {
    const activeTab = document.querySelector(tab.dataset.tabTarget);
    toolContent.forEach((tabContent) => {
      tabContent.classList.remove("active");
    });
    tools.forEach((tool) => {
      tool.classList.remove("active");
    });
    tab.classList.add("active");
    activeTab.classList.add("active");
  });
});

// load new image for editing
var input = document.getElementById("file-selector");

input.onchange = function () {
  let file = input.files[0];
  let fr = new FileReader();
  fr.onload = createImage;
  fr.readAsDataURL(file);
  function createImage() {
    image.src = fr.result;
  }
  layers = new Layers();
  layers.initializeLayers(ctx, canvas, image);
};

var maskImageSelector = document.getElementById("maskImageSelector");
var loadedMaskImage = document.getElementById("loadedMaskImage");
maskImageSelector.onchange = function () {
  let file = maskImageSelector.files[0];
  let fr = new FileReader();
  fr.onload = createImage;
  fr.readAsDataURL(file);
  function createImage() {
    maskImageObject = new ImageObject(layers.redraw, 100, 100);
    maskImageObject.image.src = fr.result;
    layers.objects.push(maskImageObject);
    loadedMaskImage.innerHTML = `<img src = ${fr.result}>`;
    // layers.createNewState();
  }
};

var maskImage = document.getElementById("maskImage");
maskImage.addEventListener("submit", (e) => {
  loadedMaskImage.innerHTML = "";
  e.preventDefault();
  layers.mask(maskImageObject);
});

function download() {
  const image = canvas.toDataURL("image/jpeg", 0.9);
  const link = document.createElement("a");
  link.href = image;
  link.download = "edited_image.jpg";
  link.click();
}

document.getElementById("downloadBtn").addEventListener("click", download);

document.getElementById("undo").addEventListener("click", () => {
  layers.undo();
});

document.getElementById("redo").addEventListener("click", () => {
  layers.redo();
});

document.getElementById("delete").addEventListener("click", () => {
  layers.delete();
});

document.getElementById("reset").addEventListener("click", () => {
  layers.reset();
});


document.getElementById("sendLayerBackward").addEventListener("click", () => {
  layers.sendSelectedLayerBackward();
});

document.getElementById("sendLayerForward").addEventListener("click", () => {
  layers.sendSelectedLayerForward();
});

document.getElementById("imgResizeValue").addEventListener("submit", (e) => {
  layers.resize(e);
});

var resizeValueX = document.getElementById("resizeValueX");
var resizeValueY = document.getElementById("resizeValueY");
var preserveAspectRatio = document.getElementById("preserveAspectRatio");

document.getElementById("resizeValueX").addEventListener("change", (e) => {
  if (preserveAspectRatio.checked) {
    var xFactor = e.target.value / layers.img.width;
    resizeValueY.value = parseInt(xFactor * layers.img.height);
  }
});

document.getElementById("resizeValueY").addEventListener("change", (e) => {
  if (preserveAspectRatio.checked) {
    var yFactor = e.target.value / layers.img.height;
    resizeValueX.value = parseInt(yFactor * layers.img.width);
  }
});
var defaultDraw = document.getElementById("defaultDraw");

var drawElement = document.getElementById("draw");

drawElement.addEventListener("change", beginDraw);

defaultDraw.addEventListener("click", beginDraw, true);

drawElement.addEventListener("change", removeDefaultDraw);

function removeDefaultDraw() {
  defaultDraw.removeEventListener("click", beginDraw, true);
}

function beginDraw() {
  var data = new FormData(draw);
  let drawOptions = {};
  for (const [name, value] of data) {
    drawOptions[name] = value;
  }
  layers.draw(drawOptions.color, drawOptions.size);
}

let canvasX = document.getElementById("currentCanvasX");
let canvasY = document.getElementById("currentCanvasY");

setInterval(() => {
  canvasX.innerText = layers.canvas.width;
  canvasY.innerText = layers.canvas.height;
}, 200);

var crop = document.getElementById("crop");
var applyCrop = document.getElementById("applyCrop");


crop.addEventListener("click", newCropBox, {once: true});

function newCropBox(e){
    e.preventDefault();
    var cropBoxSize = {x: layers.width /2, y : layers.height /2};
    cropBox = new Rectangle(0, 0, cropBoxSize.x, cropBoxSize.y, "transparent", "white", "true");
    layers.objects.push(cropBox);
    layers.redraw.status = true;
}

applyCrop.addEventListener('submit', (e) => {
  e.preventDefault();
  crop.addEventListener("click", newCropBox, {once: true});
  layers.crop(cropBox);
})

applyCrop.addEventListener('reset', (e) => {
  crop.addEventListener("click", newCropBox, {once: true});
  e.preventDefault();
  layers.changes = [];
  layers.objects = [];
  layers.redrawEverything();
})

window.onkeypress = (e) => {
  switch (e.key) {
    case "Delete":
      if (layers.selectedObject != -1) {
        layers.delete();
      }
      break;
    case "z":
      if (e.ctrlKey) {
        layers.undo();
      }
      break;
    case "y":
      if (e.ctrlKey) {
        layers.redo();
      }
      break;
  }
};
