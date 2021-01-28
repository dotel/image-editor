import { ratio, ratioFixedSizeX, ratioFixedSizeY } from "./utilities.js";
import { resizer } from "./handleresizer.js";
import ImageObject from "./imageobject.js";
export default class TextObject {
  constructor(textProperties, redraw, objects) {
    this.text = textProperties.text;
    this.size = textProperties.size;
    this.x = ratioFixedSizeX(30);
    this.y = ratioFixedSizeX(50);
    this.tempCanvas = document.createElement("canvas");
    this.tempCtx = this.tempCanvas.getContext("2d");
    this.tempCtx.font = `${this.size}px Arial`;

    this.tempCanvas.width = this.tempCtx.measureText(this.text).width;
    this.tempCanvas.height = this.size;

    this.tempCtx.font = `${this.size}px Arial`;
    this.tempCtx.fillStyle = textProperties.color;
    this.tempCtx.textAlign = "left";
    this.tempCtx.textBaseline = "top";

    this.tempCtx.globalAlpha = 0.01;
    console.log(this.tempCanvas.width);
    this.tempCtx.fillRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
    this.tempCtx.globalAlpha = 1.0;

    this.tempCtx.fillText(this.text, 0, 0);

    this.textImage = new ImageObject(
      redraw,
      this.tempCanvas.width,
      this.tempCanvas.height
    );
    this.textImage.image.src = this.tempCanvas.toDataURL();
    objects.push(this.textImage);
    objects = objects.filter((item) => item !== this);
    console.log(objects)
  }
  draw(ctx, selectedObject, selectionHandles) {
    // this.textImage.draw(ctx, selectedObject, selectionHandles);
  }
}
