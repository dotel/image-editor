import ImageObject from "./imageobject.js";
export default class Painter {
  constructor(fillColor, strokeSize, layers) {
    this.canvas = layers.canvas;
    this.ctx = layers.ctx;
    this.layers = layers;
    this.fillColor = fillColor;
    this.strokeSize = strokeSize;
    this.isDrawing = false;
    this.tempCanvas = document.createElement("canvas");
    this.tempCtx = this.tempCanvas.getContext("2d");
    this.tempCanvas.width = this.canvas.width;
    this.tempCanvas.height = this.canvas.height;
  }
  startDrawing() {
    this.canvas.style.cursor = "crosshair";
    this.isDrawing = true;
    this.tempCtx.beginPath();  
  }
  draw(e) {
    if (this.isDrawing) {
      this.layers.redraw.status = true;
      this.tempCtx.lineTo(
        e.clientX - this.canvas.getBoundingClientRect().left,
        e.clientY - this.canvas.getBoundingClientRect().top
        );
        this.tempCtx.strokeStyle = this.fillColor;
        this.tempCtx.lineWidth = this.strokeSize;
        this.tempCtx.lineCap = "round";
        this.tempCtx.lineJoin = "round";
        this.tempCtx.stroke();
        this.ctx.strokeStyle = this.fillColor;
        this.ctx.lineWidth = this.strokeSize;
        this.ctx.lineCap = "round";
        this.ctx.lineJoin = "round";
        this.ctx.stroke();
    }
  }

  stopDrawing() {
    if (this.isDrawing) {
      this.tempCtx.stroke();
      this.tempCtx.closePath();
      this.isDrawing = false;
      this.toImage();
      this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height)
    }
  }

  toImage() {
    let paintImage = new ImageObject(
      this.layers.redraw,
      this.tempCanvas.width,
      this.tempCanvas.height
    );
    paintImage.image.src = this.tempCanvas.toDataURL();
    paintImage.isDrawing = true;
    this.layers.objects.push(paintImage);
    this.layers.createNewState();
  }
}
