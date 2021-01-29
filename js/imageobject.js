import { ratio, ratioFixedSizeX, ratioFixedSizeY } from "./utilities.js";
import { resizer } from "./handleresizer.js";

export default class ImageObject {
  constructor(redraw, width, height) {
    this.x = 0;
    this.y = 0;
    this.width = ratioFixedSizeX(width);
    this.height = ratioFixedSizeY(height);
    this.angle;
    this.image = new Image();
    redraw.status = true;
  }
  draw(context, selectedObject, selectionHandles) {
    context.drawImage(this.image, this.x, this.y, this.width, this.height);
    resizer.bind(this)(context, selectedObject, selectionHandles);
  }
}
