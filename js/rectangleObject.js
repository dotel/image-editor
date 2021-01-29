import { resizer } from "./handleresizer.js";
import { ratio } from "./utilities.js";

export default class Rectangle {
  constructor() {
    this.x;
    this.y;
    this.angle;
    this.width;
    this.height;
  }

  draw(context, selectedObject, selectionHandles) {
    context.fillStyle = this.fill;

    context.fillRect(this.x, this.y, this.width, this.height);

    resizer.bind(this)(context, selectedObject, selectionHandles);
  }
}
