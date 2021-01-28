import { ratio, ratioFixedSizeX, ratioFixedSizeY } from "./utilities.js";
import { resizer } from "./handleresizer.js";

export default class ImageObject {
  constructor(redraw, width, height) {
    this.x = 0;
    this.y = 0;
    this.w = ratioFixedSizeX(width);
    this.h = ratioFixedSizeY(height);
    this.angle;
    this.image = new Image();
    redraw.status = false;
  }
  draw(context, selectedObj, selectionHandles) {
    context.drawImage(this.image, this.x, this.y, this.w, this.h);
    resizer.bind(this)(context, selectedObj, selectionHandles);
  }
}
