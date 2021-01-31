import { resizer } from "./handleresizer.js";
import { ratio, ratioFixedSizeX, ratioFixedSizeY } from "./utilities.js";

export default class Rectangle {
  constructor(x, y, width, height, fill, strokeStyle = 'transparent', isCropTool) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.strokeStyle = strokeStyle;
    this.fill = fill;
    this.isCropTool = isCropTool;
  }

  draw(context, selectedObject, selectionHandles) {
    context.fillStyle = this.fill;
    if(this.fill == 'transparent'){
      context.fillStyle = 'black';
      context.globalAlpha = '.05'
    }
    context.fillRect(this.x, this.y, this.width, this.height);
    context.globalAlpha = '1';
    context.strokeStyle = this.strokeStyle;
    context.lineWidth = 5;
    context.strokeRect(this.x, this.y, this.width, this.height);
    
    resizer.bind(this)(context, selectedObject, selectionHandles);
  }
}
