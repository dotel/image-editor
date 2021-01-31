// Ratio by which every layer should be resized when canvas is resized
const ratio = {
  xratio: null,
  yratio: null,
};

// Clears the canvas context
function clearContext(ctx, width, height) {
  ctx.clearRect(0, 0, width, height);
}


// Generates a random hex color
function randomColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

// Converts angle in degree to radians
function angleToRadian(deg) {
  return (Math.PI * deg) / 180;
}

/**
 * 
 * @param {number} x Width or x value
 * @returns {number} Adjusted x value
 */
function ratioFixedSizeX(x) {
  return x / ratio.xratio;
}

/**
 * 
 * @param {number} y Height or y value
 * @returns {number} Adjusted y value
 */
function ratioFixedSizeY(y) {
  return y / ratio.yratio;
}

// Returns a clone of the object
function deepCloneObj(object) {
  const layerObj = {};
  for (const key in object) {
    layerObj[key] = object[key];
  }
  layerObj.draw = object.draw;
  return layerObj;
}

// Swaps i and j index or arr array
function swapArrayElement(arr, i, j) {
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}

export {
  clearContext,
  randomColor,
  angleToRadian,
  ratioFixedSizeX,
  ratioFixedSizeY,
  deepCloneObj,
  swapArrayElement,
  ratio,
};
