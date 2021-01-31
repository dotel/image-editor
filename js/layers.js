/* eslint-disable import/extensions */
import {
  ratio,
  randomColor,
  ratioFixedSizeX,
  ratioFixedSizeY,
  clearContext,
  deepCloneObj,
  swapArrayElement,
} from './utilities.js';
import Rectangle from './rectangleObject.js';
import ImageObject from './imageobject.js';
import { INTERVAL, BOX_SIZE } from './constants.js';
import { addTextImage } from './texttoimage.js';
import ObjectState from './objectstates.js';
import Painter from './painter.js';

const originalImageWidth = document.getElementById('originalImageWidth');
const originalImageHeight = document.getElementById('originalImageHeight');
const maindrawInterval = {};

export default class Layers {
  constructor() {
    this.redraw = { status: false };
    this.isDrag = false;
    this.isResizeDrag;
    this.canvas;
    this.ctx;
    this.mouseX, this.mouseY;
    this.selectedObject = -1;
    this.selectionHandle = [];
    this.resizeHandle = null;
    this.objects = [];
    this.height;
    this.width;
    this.image;
    this.topLayer;
    this.topLayerContext;
    this.offsetx, this.offsety;
    this.actualCanvasHeight, this.actualCanvasWidth;
    this.changes = [new ObjectState(this.objects)];
    this.recentUndo = false;
    this.oldselectedObject = -1;
    this.stateChangeRequired;
    this.currentState = 0;
    this.cropTool;
    this.toolSelected;
    this.originalImage = new Image();
  }

  /**
   * 
   * @param {object} originalCtx Canvas context
   * @param {object} originalCanvas HTML5 canvas
   * @param {image} image Html5 image object
   */
  initializeLayers(originalCtx, originalCanvas, image) {
    this.image = image;
    this.canvas = originalCanvas;
    this.ctx = originalCtx;

    this.canvas.onmousedown = this.handleMouseDown.bind(this);
    this.canvas.onmousemove = this.handleMouseMove.bind(this);
    this.canvas.onmouseup = this.handleMouseUp.bind(this);

    this.handleNewLayersAddition.bind(this)();

    this.image.onload = () => {
      if (this.height === undefined) {
        this.originalImage.width = image.width;
        this.originalImage.height = image.height;
        this.originalImage.src = image.src;
        originalImageHeight.innerText = `${image.height}`;
        originalImageWidth.innerText = `${image.width}`;
      }

      this.height = image.height;
      this.width = image.width;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      // Main image being edited is drawn to the the main canvas
      this.ctx.drawImage(this.image, 0, 0, this.width, this.height);

      this.setRatio();

      // A top layer canvas to draw all the objects which are constantly redrawn
      this.topLayer = document.createElement('canvas');
      this.topLayer.height = this.height;
      this.topLayer.width = this.width;
      this.topLayerContext = this.topLayer.getContext('2d');

      maindrawInterval.interval = setInterval(
        this.mainDraw.bind(this),
        INTERVAL,
      );

      for (let i = 0; i < 8; i += 1) {
        this.selectionHandle.push(new Rectangle());
      }
    };
  }

  mainDraw() {
    if (this.redraw.status === true) {
      clearContext(this.ctx, this.width, this.height);

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
  }

  handleNewLayersAddition() {
    window.onresize = this.setRatio.bind(this);

    document.getElementById('newRectangle').addEventListener('click', () => {
      this.addRectangle(
        0,
        0,
        Math.random() * 400,
        Math.random() * 400,
        randomColor(),
      );
    });

    document.getElementById('newText').addEventListener('submit', (e) => {
      this.addText.bind(this)(e);
    });

    const newImageLayer = document.getElementById('newImage');
    newImageLayer.addEventListener('change', (e) => {
      this.addImage.bind(this)(newImageLayer, e);
    });
  }

  handleMouseDown(e) {
    this.setMouseLocation(e);
    if (this.resizeHandle !== null) {
      this.isResizeDrag = true;
      return;
    }
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
    clearContext(this.topLayerContext, this.width, this.height);
    this.selectedObject = -1;
    this.oldselectedObject = -1;
    this.redrawEverything();
  }

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
          && this.mouseX <= selectionHandle.x + BOX_SIZE
          && this.mouseY >= selectionHandle.y
          && this.mouseY <= selectionHandle.y + BOX_SIZE
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
      this.canvas.style.cursor = 'auto';
    }
  }

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

  isSelectedObjectChanged(oldselectedObject) {
    return (
      this.selectedObject.height !== oldselectedObject.height
      || this.selectedObject.width !== oldselectedObject.width
      || this.selectedObject.x !== oldselectedObject.x
      || this.selectedObject.y !== oldselectedObject.y
    );
  }

  setRatio() {
    this.actualCanvasHeight = parseFloat(
      window.getComputedStyle(this.canvas).height,
    );
    this.actualCanvasWidth = parseFloat(
      window.getComputedStyle(this.canvas).width,
    );

    ratio.xratio = this.actualCanvasHeight / this.height;
    ratio.yratio = this.actualCanvasWidth / this.width;
  }

  setMouseLocation(e) {
    let offsetX = 0;
    let offsetY = 0;

    offsetX = this.canvas.getBoundingClientRect().left;
    offsetY = this.canvas.getBoundingClientRect().top;

    this.mouseX = ratioFixedSizeX(e.pageX - offsetX);
    this.mouseY = ratioFixedSizeY(e.pageY - offsetY);
  }

  addRectangle(x, y, width, height, fill, strokeStyle) {
    const rect = new Rectangle(x, y, width, height, fill, strokeStyle);
    this.objects.push(rect);
    this.createNewState.bind(this)();
    this.redrawEverything();
  }

  addText(e) {
    e.preventDefault();
    const newText = document.getElementById('newText');
    const data = new FormData(newText);
    const textProperties = {};
    for (const [name, value] of data) {
      textProperties[name] = value;
    }
    let textImage = addTextImage(textProperties, this.redraw);
    this.objects.push(textImage);
    this.redrawEverything();
    this.createNewState();
  }

  addImage(newImageLayer) {
    const file = newImageLayer.files[0];
    const fr = new FileReader();
    function createImage() {
      const imageLayer = new ImageObject(
        this.redraw,
        ratioFixedSizeX(200),
        ratioFixedSizeY(200),
      );
      imageLayer.image.src = fr.result;
      this.objects.push(imageLayer);
      this.createNewState.bind(this)();
    }
    fr.onload = createImage.bind(this);
    fr.readAsDataURL(file);
  }

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

  redo() {
    if (this.currentState + 1 < this.changes.length) {
      this.currentState += 1;
      const previousState = this.changes[this.currentState];
      const newObjectState = new ObjectState(previousState.objects);
      this.objects = newObjectState.objects;
      this.redrawEverything();
    }
  }

  reset() {
    this.currentState = this.changes.length;
    this.objects = [];
    this.canvas.height = originalImageHeight.innerText;
    this.canvas.width = originalImageWidth.innerText;
    this.height = originalImageHeight.innerText;
    this.width = originalImageWidth.innerText;
    this.image = this.originalImage;

    this.redrawEverything();
  }

  delete() {
    if (this.selectedObject !== -1 && !this.selectedObject.isCropTool) {
      this.objects = this.objects.filter((item) => item !== this.selectedObject);
      this.createNewState();
      this.currentState = this.changes.length - 1;
      this.redrawEverything();
    }
  }

  draw(color, size) {
    const painter = new Painter(color, size, this);
    function startDrawing() {
      if (this.selectedObject === -1) {
        painter.startDrawing.bind(painter)();
      }
    }
    this.canvas.addEventListener('mousedown', (e) => startDrawing.bind(this)(maindrawInterval, e));
    this.canvas.addEventListener('mousemove', painter.draw.bind(painter));
    this.canvas.addEventListener('mouseup', painter.stopDrawing.bind(painter));
    this.canvas.addEventListener('mouseout', painter.stopDrawing.bind(painter));
  }

  resize(e) {
    e.preventDefault();
    const imgResizeValue = document.getElementById('imgResizeValue');
    const data = new FormData(imgResizeValue);
    const imageSize = {};
    for (const [name, value] of data) {
      imageSize[name] = value;
    }
    this.height = imageSize.yValue;
    this.width = imageSize.xValue;
    this.canvas.height = this.height;
    this.canvas.width = this.width;
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
    this.height = maskImageObject.height;
    this.width = maskImageObject.width;
    this.canvas.height = this.height;
    this.canvas.width = this.width;
    this.objects = this.objects.filter((obj) => obj !== maskImageObject);
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = this.width;
    tempCanvas.height = this.height;
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

    tempCtx.globalAlpha = 0.8;
    tempCtx.drawImage(
      maskImageObject.image,
      0,
      0,
      tempCanvas.width,
      tempCanvas.height,
    );
    tempCtx.globalCompositeOperation = 'source-in';
    tempCtx.drawImage(
      this.image,
      maskImageObject.x,
      maskImageObject.y,
      maskImageObject.width,
      maskImageObject.height,
      0,
      0,
      tempCanvas.width,
      tempCanvas.height,
    );
    const tempImage = new Image(maskImageObject.width, maskImageObject.height);
    tempImage.src = tempCanvas.toDataURL();
    tempImage.onload = () => {
      this.image = tempImage;
    };
    this.reset();
    this.setRatio();
    this.redrawEverything();
  }

  crop(cropBox) {
    const cropBoxClone = deepCloneObj(cropBox);
    this.objects = this.objects.filter((obj) => obj != cropBox);
    this.redraw.status = true;

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.height = cropBoxClone.height;
    tempCanvas.width = cropBoxClone.width;

    setTimeout(() => {
      const canvasImg = new Image();
      canvasImg.width = this.width;
      canvasImg.height = this.height;

      canvasImg.src = this.canvas.toDataURL('image/jpeg', 0.9);
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

        this.image.src = tempCanvas.toDataURL('image/jpeg', 0.9);
      };

      this.height = cropBoxClone.height;
      this.width = cropBoxClone.width;
      this.canvas.height = this.height;
      this.canvas.width = this.width;
      this.setRatio();
      this.redrawEverything();
    }, 200);
  }

  redrawEverything() {
    this.redraw.status = true;
  }
}
