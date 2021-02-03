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

function getInitialDrawproperties() {
  const data = new FormData(drawProperties);
  const drawOptions = {};
  for (const [name, value] of data) {
    drawOptions[name] = value;
  }
  return drawOptions;
}

/**
 * Returns true if the image argument is potrait
 * @param {HTMLImageElement} image
 */
function isPotrait(image) {
  return image.height > image.width;
}

/**
 * Swaps two values and return them
 * @param {object} x
 * @param {object} y
 */
function swapValuesAndReturn(x, y) {
  const temp = x;
  x = y;
  y = temp;
  return [x, y];
}

export {
  clearContext,
  randomColor,
  angleToRadian,
  deepCloneObj,
  swapArrayElement,
  getInitialDrawproperties,
  isPotrait,
  swapValuesAndReturn,
};
