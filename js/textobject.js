import { ratio, ratioFixedSizeX } from "./utilities.js";
import { resizer } from "./handleresizer.js";
export default class TextObject {
  constructor(textProperties) {
    this.text = textProperties.text;
    this.size = textProperties.size;
    this.color = textProperties.color;
    this.x = ratioFixedSizeX(30);
    this.y = ratioFixedSizeX(50);
    this.w = ratioFixedSizeX(50);
    this.h = this.size;
  }
  draw(ctx, selectedObject, selectionHandles) {
    ctx.font = `${ratioFixedSizeX(this.size)}px serif`;
    ctx.fillStyle = this.color;
    ctx.fillText(this.text, this.x, this.y);
  }
}
