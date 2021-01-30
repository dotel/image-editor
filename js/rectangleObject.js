import { resizer } from "./handleresizer.js";
import { ratio, ratioFixedSizeX, ratioFixedSizeY } from "./utilities.js";

export default class Rectangle {
  constructor(x, y, width, height, fill) {
    this.x = ratioFixedSizeX(x);
    this.y = ratioFixedSizeY(y);
    this.width = ratioFixedSizeX(width);
    this.height = ratioFixedSizeY(height);
    this.fill = fill;
  }

  draw(context, selectedObject, selectionHandles) {
    context.fillStyle = this.fill;

    context.fillRect(this.x, this.y, this.width, this.height);

    resizer.bind(this)(context, selectedObject, selectionHandles);
  }
}
