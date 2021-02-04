import {
  clearContext,
  deepCloneObj,
  swapArrayElement,
  angleToRadian,
  getInitialDrawproperties,
  isPotrait,
  swapValuesAndReturn,
} from './utilities.js';
import Rectangle from './rectangleobject.js';
import ImageObject from './imageobject.js';
import {
  TOOLS, DEFAULT_IMAGE, DEFAULT_RECTANGLE, DEFAULT_STICKER, DEFAULT_CIRCLE, RESIZING_BOX_SIZE,
} from './constants.js';
import { addTextImage } from './texttoimage.js';
import ObjectState from './objectstates.js';
import Painter from './painter.js';
import { createCircleImage } from './circletoimage.js';

let painter;
const maindrawInterval = {};

export default class Layers {
  constructor() {
    this.redraw = { status: false };
    this.isDrag = false;
    this.isResizeDrag = false;
    this.selectionHandle = [];
    this.resizeHandle = null;
    this.objects = [];
    this.selectedObject = -1;
    this.recentUndo = false;
    this.oldselectedObject = -1;
    this.stateChangeRequired = false;
    this.toolSelected = -1;
    this.originalImage = new Image();
    this.angle = 0;
  }

  /**
   *
   * @param {object} originalCtx Canvas context
   * @param {object} originalCanvas HTML5 canvas
   * @param {image} image Html5 image object
   */
  initializeLayers(originalCtx, originalCanvas, image) {
    this.changes = [new ObjectState(this.objects)];
    this.currentState = 0;
    this.image = image;
    this.canvas = originalCanvas;
    this.ctx = originalCtx;

    this.canvas.onmousedown = this.handleMouseDown.bind(this);
    this.canvas.onmousemove = this.handleMouseMove.bind(this);
    this.canvas.onmouseup = this.handleMouseUp.bind(this);

    this.image.onload = () => {
      // Saves the original height/width of the image on first load only
      if (this.height === undefined) {
        this.originalImage.width = image.width;
        this.originalImage.height = image.height;
        this.originalImage.src = image.src;
      }
      this.height = image.height;
      this.width = image.width;
      this.canvas.width = this.width;
      this.canvas.height = this.height;

      this.ctx.drawImage(this.image, 0, 0, this.width, this.height);

      this.setRatio();

      this.topLayer = document.createElement('canvas');
      this.topLayer.height = this.height;
      this.topLayer.width = this.width;
      this.topLayerContext = this.topLayer.getContext('2d');

      requestAnimationFrame(this.mainDraw.bind(this));
      for (let i = 0; i < 8; i += 1) {
        this.selectionHandle.push(new Rectangle(this));
      }
      painter = new Painter(getInitialDrawproperties().color,
        getInitialDrawproperties().size, this);
    };
  }

  // redraw only when redraw status is true and the painter isn't drawing
  mainDraw() {
    if (this.redraw.status && !(painter && painter.isDrawing)) {
      this.ctx.drawImage(this.image, 0, 0, this.width, this.height);
      for (let i = 0; i < this.objects.length; i += 1) {
        this.objects[i].draw(
          this.ctx,
          this.selectedObject,
          this.selectionHandle,
        );
      }
      this.redraw.status = false;
    }
    requestAnimationFrame(this.mainDraw.bind(this));
  }

  /**
   * Handles mouse down event
   * @param {Event} e Mouse down event
   */
  handleMouseDown(e) {
    this.setMouseLocation(e);
    if (this.resizeHandle !== null) {
      this.isResizeDrag = true;
      return;
    }
    if (this.toolSelected !== TOOLS.DRAW) clearContext(this.topLayerContext, this.width, this.height);
    for (let i = this.objects.length - 1; i >= 0; i -= 1) {
      this.objects[i].draw(this.topLayerContext);
      const imageData = this.topLayerContext.getImageData(
        this.mouseX,
        this.mouseY,
        1,
        1,
      );
      if (imageData.data[3] > 0) {
        this.selectedObject = this.objects[i];
        this.oldselectedObject = deepCloneObj(this.selectedObject);
        this.offsetx = this.mouseX - this.selectedObject.x;
        this.offsety = this.mouseY - this.selectedObject.y;
        this.selectedObject.x = this.mouseX - this.offsetx;
        this.selectedObject.y = this.mouseY - this.offsety;
        this.isDrag = true;
        this.redrawEverything();
        clearContext(this.topLayerContext, this.width, this.height);
        return;
      }
    }
    this.selectedObject = -1;
    this.oldselectedObject = -1;
    this.redrawEverything();
  }

  /**
   * Resizes and moves selected object
   * @param {Event} e Mouse moved event
   */
  handleMouseMove(e) {
    if (this.isDrag) {
      this.setMouseLocation(e);
      this.selectedObject.x = this.mouseX - this.offsetx;
      this.selectedObject.y = this.mouseY - this.offsety;
      this.redrawEverything();
    } else if (this.isResizeDrag) {
      this.resizeSelectedObject();
    }
    this.setMouseLocation(e);
    if (this.selectedObject !== -1 && !this.isResizeDrag) {
      for (let i = 0; i < 8; i += 1) {
        const selectionHandle = this.selectionHandle[i];
        if (
          this.mouseX >= selectionHandle.x
          && this.mouseX <= selectionHandle.x + this.selectionHandleBoxSize
          && this.mouseY >= selectionHandle.y
          && this.mouseY <= selectionHandle.y + this.selectionHandleBoxSize
        ) {
          this.resizeHandle = i;
          this.redrawEverything();

          switch (i) {
            case 0:
              this.canvas.style.cursor = 'nw-resize';
              break;
            case 1:
              this.canvas.style.cursor = 'n-resize';
              break;
            case 2:
              this.canvas.style.cursor = 'ne-resize';
              break;
            case 3:
              this.canvas.style.cursor = 'w-resize';
              break;
            case 4:
              this.canvas.style.cursor = 'e-resize';
              break;
            case 5:
              this.canvas.style.cursor = 'sw-resize';
              break;
            case 6:
              this.canvas.style.cursor = 's-resize';
              break;
            case 7:
              this.canvas.style.cursor = 'se-resize';
              break;
            default:
              break;
          }
          return;
        }
      }
      this.isResizeDrag = false;
      this.resizeHandle = null;
      if (this.toolSelected !== TOOLS.DRAW) this.canvas.style.cursor = 'auto';
    }
  }

  /**
   * Resizes selected object based on resizeHandle choosen
   */
  resizeSelectedObject() {
    const oldx = this.selectedObject.x;
    const oldy = this.selectedObject.y;

    switch (this.resizeHandle) {
      case 0:
        this.selectedObject.x = this.mouseX;
        this.selectedObject.y = this.mouseY;
        this.selectedObject.width += oldx - this.mouseX;
        this.selectedObject.height += oldy - this.mouseY;
        break;
      case 1:
        this.selectedObject.y = this.mouseY;
        this.selectedObject.height += oldy - this.mouseY;
        break;
      case 2:
        this.selectedObject.y = this.mouseY;
        this.selectedObject.width = this.mouseX - oldx;
        this.selectedObject.height += oldy - this.mouseY;
        break;
      case 3:
        this.selectedObject.x = this.mouseX;
        this.selectedObject.width += oldx - this.mouseX;
        break;
      case 4:
        this.selectedObject.width = this.mouseX - oldx;
        break;
      case 5:
        this.selectedObject.x = this.mouseX;
        this.selectedObject.width += oldx - this.mouseX;
        this.selectedObject.height = this.mouseY - oldy;
        break;
      case 6:
        this.selectedObject.height = this.mouseY - oldy;
        break;
      case 7:
        this.selectedObject.width = this.mouseX - oldx;
        this.selectedObject.height = this.mouseY - oldy;
        break;
      default:
        break;
    }
    this.redrawEverything();
  }

  /**
   * Handles mouse up event
   */
  handleMouseUp() {
    this.isDrag = false;
    this.isResizeDrag = false;
    this.resizeHandle = null;
    if (this.isSelectedObjectChanged(this.oldselectedObject)) {
      this.stateChangeRequired = true;
    }
    if (this.stateChangeRequired && !this.oldselectedObject.isCropTool) {
      this.createNewState();
    }
    this.stateChangeRequired = false;
  }

  /**
   * @param {object} oldselectedObject Selected object clone right after it was selected
   */
  isSelectedObjectChanged(oldselectedObject) {
    return (
      this.selectedObject.height !== oldselectedObject.height
      || this.selectedObject.width !== oldselectedObject.width
      || this.selectedObject.x !== oldselectedObject.x
      || this.selectedObject.y !== oldselectedObject.y
    );
  }

  /**
   * Resizes xratio and yratio to the changed canvas size
   */
  setRatio() {
    this.actualCanvasHeight = parseFloat(
      window.getComputedStyle(this.canvas).height,
    );
    this.actualCanvasWidth = parseFloat(
      window.getComputedStyle(this.canvas).width,
    );

    this.xratio = this.actualCanvasHeight / this.height;
    this.yratio = this.actualCanvasWidth / this.width;
    this.selectionHandleBoxSize = this.ratioFixedSizeX(RESIZING_BOX_SIZE);
  }

  setMouseLocation(e) {
    let offsetX = 0;
    let offsetY = 0;

    offsetX = this.canvas.getBoundingClientRect().left;
    offsetY = this.canvas.getBoundingClientRect().top;

    this.mouseX = this.ratioFixedSizeX(e.pageX - offsetX);
    this.mouseY = this.ratioFixedSizeY(e.pageY - offsetY);
  }

  addRectangle(x, y, width, height, fill, strokeStyle) {
    const rect = new Rectangle(this, x, y, width, height, fill, strokeStyle);
    this.objects.push(rect);
    this.createNewState.bind(this)();
    this.redrawEverything();
  }

  addCircle(e, fill) {
    const circleImage = createCircleImage(DEFAULT_CIRCLE.x, DEFAULT_CIRCLE.y, 100, this, fill);
    this.objects.push(circleImage);
    this.redrawEverything();
    this.createNewState();
  }

  addText(e) {
    e.preventDefault();
    const newText = document.getElementById('newText');
    const data = new FormData(newText);
    const textProperties = {};
    for (const [name, value] of data) {
      textProperties[name] = value;
    }
    const textImage = addTextImage(textProperties, this);
    this.objects.push(textImage);
    this.redrawEverything();
    this.createNewState();
  }

  /**
   * Adds a new image layer to the canvas
   *
   * @param {Image} imageElement
   * @param {string} type Type of image - text, sticker, frame, mask, normal
   */
  addImage(imageElement, type) {
    let height;
    let width;
    let x;
    let y;
    if (type === 'frame') {
      [x, y] = [0, 0];
      if ((isPotrait(imageElement) && !isPotrait(this.image))
      || (!isPotrait(imageElement) && isPotrait(this.image))) {
        [height, width] = swapValuesAndReturn(height, width);
      }
      height = this.image.width;
      width = this.image.height;
    } else if (type === 'sticker') {
      [x, y] = [DEFAULT_STICKER.x, DEFAULT_STICKER.y];
      height = this.ratioFixedSizeX(DEFAULT_STICKER.x);
      width = this.ratioFixedSizeX(DEFAULT_STICKER.y);
    }
    const imageLayer = new ImageObject(
      this,
      x,
      y,
      height,
      width,
    );
    imageLayer.image.src = imageElement.src;
    imageLayer.image.onload = () => {
      this.objects.push(imageLayer);
      this.createNewState.bind(this)();
    };
  }

  addImageFromFile(newImageLayer) {
    const file = newImageLayer.files[0];
    const fr = new FileReader();
    const imageLayer = new ImageObject(
      this,
      this.ratioFixedSizeX(DEFAULT_IMAGE.x),
      this.ratioFixedSizeX(DEFAULT_IMAGE.y),
      this.ratioFixedSizeX(DEFAULT_IMAGE.width),
      this.ratioFixedSizeY(DEFAULT_IMAGE.height),
    );
    function createImage() {
      imageLayer.image.src = fr.result;
      this.objects.push(imageLayer);
      this.createNewState.bind(this)();
    }
    fr.onload = createImage.bind(this);
    fr.readAsDataURL(file);
  }

  /**
   * Creates a new undo state
   */
  createNewState() {
    if (this.recentUndo) {
      for (let i = this.changes.length - 1; i > this.currentState; i -= 1) {
        this.changes = this.changes.filter((obj) => obj !== this.changes[i]);
      }
    }
    this.currentState += 1;
    const newState = new ObjectState(this.objects);
    this.changes[this.currentState] = newState;
    this.recentUndo = false;
    this.redrawEverything();
  }

  /**
   * Can't redo operations on image itself, like crop and resize and reset
   */
  undo() {
    if (this.currentState > 0) {
      this.currentState -= 1;
      const previousState = this.changes[this.currentState];
      const newObjectState = new ObjectState(previousState.objects);
      this.objects = newObjectState.objects;
      this.recentUndo = true;
      this.redrawEverything();
    }
  }

  /**
   * Redo previous operation.
   */
  redo() {
    if (this.currentState + 1 < this.changes.length) {
      this.currentState += 1;
      const previousState = this.changes[this.currentState];
      const newObjectState = new ObjectState(previousState.objects);
      this.objects = newObjectState.objects;
      this.redrawEverything();
    }
  }

  /**
   * Resets the image back to it's original state
   */
  reset() {
    this.currentState = this.changes.length;
    this.objects = [];
    this.height = this.originalImage.height;
    this.width = this.originalImage.width;
    this.canvas.height = this.height;
    this.canvas.width = this.width;
    this.image = this.originalImage;
    this.setRatio();
    this.redrawEverything();
  }

  /**
   * Deletes the selected layer from the canvas
   */
  delete() {
    if (this.selectedObject !== -1 && !this.selectedObject.isCropTool) {
      this.objects = this.objects.filter((item) => item !== this.selectedObject);
      this.createNewState();
      this.currentState = this.changes.length - 1;
      this.redrawEverything();
    }
  }

  /**
   *
   * @param {color} color Hex color used by the paint brush
   * @param {number} size Size of the stroke
   */
  draw(color, size) {
    const drawProperties = document.getElementById('drawProperties');
    drawProperties.addEventListener('input', () => {
      const data = new FormData(drawProperties);
      const drawOptions = {};
      for (const [name, value] of data) {
        drawOptions[name] = value;
      }
      painter.fillColor = drawOptions.color;
      painter.strokeSize = drawOptions.size;
    });
    painter.stokeSize = size;
    painter.fillColor = color;
    function isDrawToolSelected() {
      return this.toolSelected === TOOLS.DRAW;
    }
    function startDrawing() {
      if (this.selectedObject === -1 && isDrawToolSelected.bind(this)()) {
        painter.startDrawing.bind(painter)(maindrawInterval);
      }
    }
    function continueDrawing(e) {
      if (isDrawToolSelected.bind(this)()) {
        painter.draw.bind(painter)(e);
      }
    }
    function stopDrawing() {
      if (isDrawToolSelected.bind(this)()) painter.stopDrawing.bind(painter)();
    }
    this.canvas.addEventListener('mousedown', startDrawing.bind(this));
    this.canvas.addEventListener('mousemove', continueDrawing.bind(this));

    this.canvas.addEventListener('mouseup', stopDrawing.bind(this));
    this.canvas.addEventListener('mouseout', stopDrawing.bind(this));
  }

  // Resizes the canvas when viewport is decreased in size and sets up ratio;
  resize(e) {
    e.preventDefault();
    const imgResizeValue = document.getElementById('imgResizeValue');
    const data = new FormData(imgResizeValue);
    const imageSize = {};
    for (const [name, value] of data) {
      imageSize[name] = value;
    }
    this.height = parseInt(imageSize.yValue);
    this.width = parseInt(imageSize.xValue);
    this.canvas.height = this.height;
    this.canvas.width = this.width;
    this.image.height = this.height;
    this.image.width = this.width;
    this.topLayer.height = this.canvas.height;
    this.topLayer.width = this.canvas.width;

    this.initializeLayers(this.ctx, this.canvas, this.image);
    painter = new Painter(getInitialDrawproperties().color,
        getInitialDrawproperties().size, this);
    this.setRatio();
    this.redrawEverything();
  }

  sendSelectedLayerBackward() {
    const indexOfselectedObject = this.objects.indexOf(this.selectedObject);
    if (indexOfselectedObject > 0) {
      swapArrayElement(
        this.objects,
        indexOfselectedObject,
        indexOfselectedObject - 1,
      );
      this.redrawEverything();
    }
  }

  sendSelectedLayerForward() {
    const indexOfselectedObject = this.objects.indexOf(this.selectedObject);
    if (indexOfselectedObject < this.objects.length - 1) {
      swapArrayElement(
        this.objects,
        indexOfselectedObject,
        indexOfselectedObject + 1,
      );
      this.redrawEverything();
    }
  }

  mask(maskImageObject) {
    this.objects = this.objects.filter((obj) => obj !== maskImageObject);
    this.redrawEverything();
    setTimeout(() => {
      const tempImg = new Image();
      tempImg.src = this.canvas.toDataURL();
      this.height = maskImageObject.height;
      this.width = maskImageObject.width;
      this.canvas.height = this.height;
      this.canvas.width = this.width;
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = this.width;
      tempCanvas.height = this.height;

      tempImg.onload = () => {
        tempCtx.drawImage(
          tempImg,
          maskImageObject.x,
          maskImageObject.y,
          maskImageObject.width,
          maskImageObject.height,
          0,
          0,
          tempCanvas.width,
          tempCanvas.height,
        );
        tempCtx.globalCompositeOperation = 'destination-in';
        tempCtx.drawImage(
          maskImageObject.image,
          0,
          0,
          tempCanvas.width,
          tempCanvas.height,
        );
        const tempImage = new Image(maskImageObject.width, maskImageObject.height);
        tempImage.src = tempCanvas.toDataURL();
        tempImage.onload = () => {
          this.initializeLayers(this.ctx, this.canvas, tempImage);
          this.redrawEverything();
        };
      };
    }, 100);

    // this.redrawEverything();
    // this.image.src = this.canvas.toDataURL();
  }

  crop(cropBox) {
    const cropBoxClone = deepCloneObj(cropBox);
    this.objects = this.objects.filter((obj) => obj !== cropBox);
    this.redraw.status = true;

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.height = cropBoxClone.height;
    tempCanvas.width = cropBoxClone.width;

    setTimeout(() => {
      const canvasImg = new Image();
      canvasImg.width = this.width;
      canvasImg.height = this.height;

      canvasImg.src = this.canvas.toDataURL();
      canvasImg.onload = () => {
        tempCtx.drawImage(
          canvasImg,
          cropBoxClone.x,
          cropBoxClone.y,
          cropBoxClone.width,
          cropBoxClone.height,
          0,
          0,
          cropBoxClone.width,
          cropBoxClone.height,
        );

        this.image.src = tempCanvas.toDataURL();
      };

      this.height = cropBoxClone.height;
      this.width = cropBoxClone.width;
      this.canvas.height = this.height;
      this.canvas.width = this.width;
      this.setRatio();
      this.redrawEverything();
    }, 200);
  }

  createNewCanvas() {
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(0, 0, this.width, this.height);
    const newImage = new Image();
    newImage.width = this.image.width;
    newImage.height = this.image.height;
    newImage.src = this.canvas.toDataURL();
    newImage.onload = () => {
      this.originalImage = newImage;
      this.image = newImage;
      this.initializeLayers(this.ctx, this.canvas, this.image);
      this.objects = [];
      this.changes = [];
    };
  }

  /**
 * Rotates the image inside the canvas flexibly by resizing the canvas
 * @param {number} angle
 */
  rotate(angle) {
    const img = new Image();
    img.src = this.canvas.toDataURL();
    img.onload = () => {
      this.objects = [];
      this.changes = [];
      const rads = angleToRadian(angle);
      const c = Math.abs(Math.cos(rads));
      const s = Math.abs(Math.sin(rads));
      this.canvas.width = this.height * s + this.width * c;
      this.canvas.height = this.height * c + this.width * s;
      this.height = this.canvas.height;
      this.width = this.canvas.width;

      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = this.canvas.width;
      tempCanvas.height = this.canvas.height;

      const cx = this.canvas.width / 2;
      const cy = this.canvas.height / 2;
      tempCtx.translate(cx, cy);
      tempCtx.rotate(rads);
      tempCtx.drawImage(img, -this.image.width / 2, -this.image.height / 2);
      const tempImage = new Image();
      tempImage.src = tempCanvas.toDataURL();
      
      tempImage.onload = () => {
        painter = new Painter(getInitialDrawproperties().color,
          getInitialDrawproperties().size, this);
        this.topLayer.height = this.canvas.height;
        this.topLayer.width = this.canvas.width;
        this.initializeLayers(this.ctx, this.canvas, tempImage);
        this.redrawEverything();
      };
    };
  }

  rotateLeft() {
    this.rotate(90);
  }

  rotateRight() {
    this.rotate(-90);
  }

  rotateAngle(x) {
    this.rotate(x);
  }

  /**
 *
 * @param {number} x  x value
 * @returns {number} Ratio adjusted x value
 */
  ratioFixedSizeX(x) {
    return x / this.xratio;
  }

  /**
 *
 * @param {number} y  y value
 * @returns {number} Ratio adjusted y value
 */
  ratioFixedSizeY(y) {
    return y / this.yratio;
  }

  redrawEverything() {
    this.redraw.status = true;
  }
}
