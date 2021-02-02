import {
    randomColor,
  } from './utilities.js';
function handleNewLayersAddition(layers) {
    window.onresize = layers.setRatio.bind(layers);

    document.getElementById('newRectangle').addEventListener('click', () => {
      layers.addRectangle(
        0,
        0,
        Math.random() * 400,
        Math.random() * 400,
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
export {handleNewLayersAddition};