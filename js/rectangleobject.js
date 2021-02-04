import { positionResizeHandlers } from './handleresizer.js';

export default class Rectangle {
  constructor(
    layers,
    x,
    y,
    width,
    height,
    fill,
    strokeStyle = 'transparent',
    isCropTool,
  ) {
    this.layers = layers;
    this.x = x;
    this.y = y;
    this.width = layers.ratioFixedSizeX(width);
    this.height = layers.ratioFixedSizeY(height);
    this.strokeStyle = strokeStyle;
    this.fill = fill;
    this.isCropTool = isCropTool;
    this.isShape = true;
    this.type = 'rectangle';
  }

  /**
   * @param {object} context HTML5 canvas context
   * @param {object} selectedObject Currently selected object
   * @param {Array} selectionHandles Array of 8 selection handles
   */
  draw(context, selectedObject, selectionHandles) {
    context.fillStyle = this.fill;
    console.log(this.layers.height)
    /* Transparent fill is used by crop tool box only,
    Setting a little black fill to distinguish crop tool from normal rectangle
    */
    if (this.fill === 'transparent') {
      context.lineWidth = 5;
      context.strokeStyle = this.strokeStyle;
      context.strokeRect(this.x, this.y, this.width, this.height);
      context.fillStyle = 'black';
      context.globalAlpha = '.05';
    }
    context.fillRect(this.x, this.y, this.width, this.height);
    context.globalAlpha = '1';
    positionResizeHandlers.bind(this)(this.layers, selectedObject, selectionHandles);
  }
}
