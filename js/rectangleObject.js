import { resizer } from "./handleresizer.js";
import { ratio } from "./utilities.js";

export default class Rectangle {
  constructor() {
    this.x;
    this.y;
    this.angle;
  }

  draw(context, selectedObj, selectionHandles) {
    context.fillStyle = this.fill;

    context.fillRect(this.x, this.y, this.w, this.h);

    resizer.bind(this)(context, selectedObj, selectionHandles);
  }
}
