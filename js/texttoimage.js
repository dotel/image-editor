import { ratio, ratioFixedSizeX, ratioFixedSizeY } from "./utilities.js";
import { resizer } from "./handleresizer.js";
import ImageObject from "./imageobject.js";
function addTextImage(textProperties, redraw, objects) {
  let text = textProperties.text;
  let size = textProperties.size;
  let tempCanvas = document.createElement("canvas");
  let tempCtx = tempCanvas.getContext("2d");
  tempCtx.font = `${size}px Arial`;

  tempCanvas.width = tempCtx.measureText(text).width;
  tempCanvas.height = size;

  tempCtx.font = `${size}px Arial`;
  tempCtx.fillStyle = textProperties.color;
  tempCtx.textAlign = "left";
  tempCtx.textBaseline = "top";

  /**
   * Fill the temporary canvas with least opacity color to
   * make it draggable since opacity is used to select objects
   */
  tempCtx.globalAlpha = 0.01;
  tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
  tempCtx.globalAlpha = 1.0;

  tempCtx.fillText(text, 0, 0);

  let textImage = new ImageObject(redraw, tempCanvas.width, tempCanvas.height);

  // push the image of the text to the objects array and remove the original text
  textImage.image.src = tempCanvas.toDataURL();
  objects.push(textImage);
}

export { addTextImage };
