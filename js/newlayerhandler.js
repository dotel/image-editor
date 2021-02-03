import {
  randomColor,
} from './utilities.js';

import {DEFAULT_RECTANGLE} from './constants.js'
function handleNewLayersAddition(layers) {
  window.onresize = layers.setRatio.bind(layers);

  document.getElementById('newRectangle').addEventListener('click', () => {
    layers.addRectangle(
      DEFAULT_RECTANGLE.x,
      DEFAULT_RECTANGLE.y,
      DEFAULT_RECTANGLE.height,
      DEFAULT_RECTANGLE.width,
      randomColor(),
    );
  });

  document.getElementById('newText').addEventListener('submit', (e) => {
    layers.addText.bind(layers)(e);
  });

  const newImageLayer = document.getElementById('newImage');
  newImageLayer.addEventListener('change', (e) => {
    layers.addImageFromFile.bind(layers)(newImageLayer, e);
  });
}
export { handleNewLayersAddition };
