import { positionResizeHandlers } from './handleresizer.js';
/**
 * Creates a new instance of ImageObject
 * Height and width ratio are fixed in the constructor
 * @param {object} layers layers object
 * @param {number} x x position of the image
 * @param {number} y y position of the image
 * @param {number} height In pixels
 * @param {number} width In pixels
 * @param {boolean} isDrawing true if the image is a drawing
 */
export default class ImageObject {
  constructor(layers, x, y, width, height, isDrawing) {
    this.x = x;
    this.y = y;
    if (isDrawing) {
      this.width = layers.ratioFixedSizeX(width);
      this.height = layers.ratioFixedSizeY(height);
    } else {
      this.width = width;
      this.height = height;
    }

    this.image = new Image();
    layers.redraw.status = true;
    this.layers = layers;
    this.isDrawing = isDrawing;
  }

  draw(context, selectedObject, selectionHandles) {
    console.log(this.image)
    context.drawImage(this.image, this.x, this.y, this.width, this.height);
    if (!this.isDrawing) {
      positionResizeHandlers.bind(this)(this.layers, selectedObject, selectionHandles);
    }
  }
}
