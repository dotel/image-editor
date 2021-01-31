import LayerObject from "./layerobject.js";

var ratio = {
  xratio: null,
  yratio: null,
};

function clearContext(ctx, width, height) {
  ctx.clearRect(0, 0, width, height);
}

function randomColor() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

function grayScale(ctx) {
  let pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < pixelData.data.length; i += 4) {
    var avg =
      (pixelData.data[i] + pixelData.data[i + 1] + pixelData.data[i + 2]) / 3;
    pixelData.data[i] = avg;
    pixelData.data[i + 1] = avg;
    pixelData.data[i + 2] = avg;
  }
  ctx.putImageData(pixelData, 0, 0);
}

function angleToRadian(deg) {
  return (Math.PI * deg) / 180;
}

function ratioFixedSizeX(x) {
  return x / ratio.xratio;
}

function ratioFixedSizeY(y) {
  return y / ratio.yratio;
}

function getMouseLocation(e, canvas, mouseX, mouseY) {
  var offsetX = 0;
  var offsetY = 0;

  offsetX = canvas.getBoundingClientRect().left;
  offsetY = canvas.getBoundingClientRect().top;

  mouseX = ratioFixedSizeX(e.pageX - offsetX);
  mouseY = ratioFixedSizeY(e.pageY - offsetY);
}

// Returns a clone of the object
function deepCloneObj(object) {
  let layerObj = {};
  for (var key in object) {
    layerObj[key] = object[key];
  }
  layerObj.draw = object.draw;
  return layerObj;
}

// Swaps i and j index or arr array
function swapArrayElement(arr, i, j) {
  let temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}

export {
  clearContext,
  randomColor,
  grayScale,
  angleToRadian,
  ratioFixedSizeX,
  ratioFixedSizeY,
  getMouseLocation,
  deepCloneObj,
  swapArrayElement,
  ratio,
};
