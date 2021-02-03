import ImageObject from './imageobject.js';

/**
 *
 * @param {object} textProperties
 * @param {object} redraw
 */
function addTextImage(textProperties, redraw) {
  const { text } = textProperties;
  const { size } = textProperties;
  const { fontFamily } = textProperties;
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');

  tempCtx.font = `${size}px ${fontFamily}`;
  tempCanvas.width = tempCtx.measureText(text).width;
  tempCanvas.height = size;

  tempCtx.font = `${size - 5}px ${fontFamily}`; // -3 because some fonts have very long g's and tend to crop out

  tempCtx.fillStyle = textProperties.color;
  tempCtx.textAlign = 'left';
  tempCtx.textBaseline = 'top';

  /**
   * Fill the temporary canvas with least opacity color to
   * make it draggable since opacity is used to select objects
   */
  tempCtx.globalAlpha = 0.01;
  tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
  tempCtx.globalAlpha = 1.0;

  tempCtx.fillText(text, 0, 0);

  const textImage = new ImageObject(redraw, 100, 100, tempCanvas.width, tempCanvas.height);

  // push the image of the text to the objects array
  textImage.image.src = tempCanvas.toDataURL();
  return textImage;
}

export { addTextImage };
