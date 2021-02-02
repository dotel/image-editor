import { positionResizeHandlers } from './handleresizer.js';
/**
 * Creates a new instance of ImageObject
 * @param {object} layers layers object
 * @param {number} height
 * @param {number} width
 */
export default class ImageObject {
  constructor(layers, width, height, isDrawing) {
    this.x = 0;
    this.y = 0;
    if(isDrawing){
      this.width = layers.ratioFixedSizeX(width);
      this.height = layers.ratioFixedSizeY(height);
    } else{
      this.width = width;
      this.height = height;
    }

    this.image = new Image();
    layers.redraw.status = true;
    this.layers = layers;
    this.isDrawing = isDrawing;
  }

  draw(context, selectedObject, selectionHandles) {
    context.drawImage(this.image, this.x, this.y, this.width, this.height);
    if (!this.isDrawing) {
      positionResizeHandlers.bind(this)(this.layers, selectedObject, selectionHandles);
    }
  }
}
