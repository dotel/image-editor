import { resizer } from "./handleresizer.js";
import { ratio } from "./utilities.js";

export default class Rectangle {
  constructor() {
    this.x;
    this.y;
    this.angle;
  }

  draw(context, selectedObj, selectionHandles) {
    // console.log(ratio.xratio)

    // if (this.x > WIDTH || this.y > HEIGHT) return;
    // if (this.x + this.w < 0 || this.y + this.h < 0) return;

    // if(this.angle != undefined){
    //   var tempCanvas = document.createElement("canvas");
    //   var tempCtx = tempCanvas.getContext("2d");

    //   tempCanvas.width = canvas.width;
    //   tempCanvas.height = canvas.height;
    //   tempCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
    //   ctx.fillStyle = "#000";

    //   ctx.fillRect(this.x, this.y, this.w, this.h);

    //   ctx.save();
    //   ctx.translate(this.w/2, 0);

    //   ctx.rotate(45*Math.PI/180);

    //   ctx.drawImage(tempCanvas,0,0,this.w,this.h,this.x,this.y,this.w,this.h);

    //   ctx.restore();
    // }

    context.fillStyle = this.fill;

    context.fillRect(this.x, this.y, this.w, this.h);

    resizer.bind(this)(context, selectedObj, selectionHandles);
  }
}
