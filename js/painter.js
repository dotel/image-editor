import ImageObject from './imageobject.js';

/**
 * Handles draw tool
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

  /**
   * Draws on two canvases at once
   * @param {MouseEvent} e Mouse move event
   */
  draw(e) {
    if (this.isDrawing) {
      const x = e.clientX - this.canvas.getBoundingClientRect().left;
      const y = e.clientY - this.canvas.getBoundingClientRect().top;
      this.tempCtx.lineTo(x, y);
      this.ctx.lineTo(
        this.layers.ratioFixedSizeX(x),
        this.layers.ratioFixedSizeY(y),
      );
      this.tempCtx.lineWidth = this.strokeSize;
      this.ctx.lineWidth = this.layers.ratioFixedSizeX(this.strokeSize);
      this.prepareBrush(this.tempCtx);
      this.prepareBrush(this.ctx);
    }
  }

  prepareBrush(ctx) {
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
      0, 0,
      this.tempCanvas.width,
      this.tempCanvas.height,
      true,
    );
    paintImage.image.src = this.tempCanvas.toDataURL();
    this.layers.objects.push(paintImage);
    this.layers.createNewState();
  }
}
