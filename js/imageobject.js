import { ratioFixedSizeX, ratioFixedSizeY } from './utilities.js';
import { positionResizeHandlers } from './handleresizer.js';
/**
 * Creates a new instance of ImageObject
 * @param {object} redraw
 * @param {number} height
 * @param {number} width
 */
export default class ImageObject {
  constructor(redraw, width, height) {
    this.x = 0;
    this.y = 0;
    this.width = ratioFixedSizeX(width);
    this.height = ratioFixedSizeY(height);
    this.image = new Image();
    redraw.status = true;
    this.isDrawing;
  }

  draw(context, selectedObject, selectionHandles) {
    context.drawImage(this.image, this.x, this.y, this.width, this.height);
    if (!this.isDrawing) {
      positionResizeHandlers.bind(this)(context, selectedObject, selectionHandles);
    }
  }
}
