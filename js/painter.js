import ImageObject from './imageobject.js';

/**
 * This class handles draw tool
 */

export default class Painter {
  constructor(fillColor, strokeSize, layers) {
    this.canvas = layers.canvas;
    this.ctx = layers.ctx;
    this.layers = layers;
    this.fillColor = fillColor;
    this.strokeSize = strokeSize;
    this.isDrawing = false;
    this.tempCanvas = document.createElement('canvas');
    this.tempCtx = this.tempCanvas.getContext('2d');
    this.tempCanvas.width = this.canvas.width;
    this.tempCanvas.height = this.canvas.height;
  }

  startDrawing() {
    this.isDrawing = true;
    this.tempCtx.beginPath();
    this.ctx.beginPath();
  }

  draw(e) {
    if (this.isDrawing) {
      this.tempCtx.lineTo(
        e.clientX - this.canvas.getBoundingClientRect().left,
        e.clientY - this.canvas.getBoundingClientRect().top,
        );
        this.ctx.lineTo(
          this.layers.ratioFixedSizeX(e.clientX - this.canvas.getBoundingClientRect().left),
          this.layers.ratioFixedSizeY(e.clientY - this.canvas.getBoundingClientRect().top),
          );
      this.tempCtx.lineWidth = this.strokeSize;
      this.ctx.lineWidth = this.layers.ratioFixedSizeX(this.strokeSize);
      this.drawOnGivenContext(this.tempCtx)
      this.drawOnGivenContext(this.ctx);
    }
  }
  drawOnGivenContext(ctx){
    ctx.strokeStyle = this.fillColor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  stopDrawing() {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.tempCtx.stroke();
      this.tempCtx.closePath();
      this.ctx.stroke();
      this.ctx.closePath();
      this.drawingToImage();
      this.tempCtx.clearRect(
        0,
        0,
        this.tempCanvas.width,
        this.tempCanvas.height,
      );
    }
  }

  drawingToImage() {
    const paintImage = new ImageObject(
      this.layers,
      this.tempCanvas.width,
      this.tempCanvas.height,
      true
    );
    paintImage.image.src = this.tempCanvas.toDataURL();
    this.layers.objects.push(paintImage);
    this.layers.createNewState();
  }
}
