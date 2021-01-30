import {
  ratio,
  randomColor,
  ratioFixedSizeX,
  ratioFixedSizeY,
  clearContext,
  deepCloneObj,
} from "./utilities.js";
import Rectangle from "./rectangleObject.js";
import ImageObject from "./imageobject.js";
import { INTERVAL, BOX_SIZE, BOX_COLOR } from "./constants.js";
import { addTextImage } from "./texttoimage.js";
import ObjectState from "./objectstates.js";

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
    this.img;
    this.topLayer;
    this.topLayerContext;
    this.offsetx, this.offsety;
    this.actualCanvasHeight, this.actualCanvasWidth;
    this.changes = [new ObjectState(this.objects)];
    this.recentUndo = false;
    this.oldselectedObject;
    this.stateChangeRequired;
    this.currentState = 0;
  }

  initializeLayers(originalCtx, originalCanvas, image) {
    this.img = image;
    this.canvas = originalCanvas;
    this.ctx = originalCtx;

    this.canvas.onmousedown = this.handleMouseDown.bind(this);
    this.canvas.onmousemove = this.handleMouseMove.bind(this);
    this.canvas.onmouseup = this.handleMouseUp.bind(this);

    this.handleNewLayersAddition.bind(this)();

    image.onload = () => {
      this.height = image.height;
      this.width = image.width;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.ctx.drawImage(this.img, 0, 0, this.width, this.height);

      this.setRatio();

      // A top layer canvas to draw all the this.objects which are constantly this.redrawn
      this.topLayer = document.createElement("canvas");
      this.topLayer.height = this.height;
      this.topLayer.width = this.width;
      this.topLayerContext = this.topLayer.getContext("2d");

      setInterval(this.mainDraw.bind(this), INTERVAL);

      for (var i = 0; i < 8; i++) {
        this.selectionHandle.push(new Rectangle());
      }
    };
  }

  mainDraw() {
    if (this.redraw.status == true) {
      clearContext(this.ctx, this.width, this.height);

      this.ctx.drawImage(this.img, 0, 0, this.width, this.height);
      for (var i = 0; i < this.objects.length; i++) {
        this.objects[i].draw(
          this.ctx,
          this.selectedObject,
          this.selectionHandle
        );
      }
      this.redraw.status = false;
    }
  }

  handleNewLayersAddition() {
    window.onresize = this.setRatio.bind(this);

    document.getElementById("newRectangle").addEventListener("click", (e) => {
      this.addRectangle(
        0,
        0,
        Math.random() * 400,
        Math.random() * 400,
        randomColor()
      );
    });

    document.getElementById("newText").addEventListener("submit", (e) => {
      this.addText.bind(this)(e);
    });

    var newImageLayer = document.getElementById("newImage");
    newImageLayer.addEventListener("change", (e) => {
      this.addImage.bind(this)(newImageLayer, e);
    });
  }

  handleMouseDown(e) {
    this.stateChangeRequired = false;
    this.oldselectedObject = deepCloneObj(this.selectedObject);
    this.setMouseLocation(e);
    if (this.resizeHandle !== null) {
      this.isResizeDrag = true;
      return;
    }
    for (var i = this.objects.length - 1; i >= 0; i--) {
      this.objects[i].draw(this.topLayerContext);

      var imageData = this.topLayerContext.getImageData(
        this.mouseX,
        this.mouseY,
        1,
        1
      );
      if (imageData.data[3] > 0) {
        this.selectedObject = this.objects[i];
        this.offsetx = this.mouseX - this.selectedObject.x;
        this.offsety = this.mouseY - this.selectedObject.y;
        this.selectedObject.x = this.mouseX - this.offsetx;
        this.selectedObject.y = this.mouseY - this.offsety;
        this.isDrag = true;
        this.redraw.status = true;
        clearContext(this.topLayerContext, this.width, this.height);
        return;
      }
    }
    clearContext(this.topLayerContext, this.width, this.height);
    this.selectedObject = -1;
    this.redraw.status = true;
  }

  handleMouseMove(e) {
    if (this.isDrag) {
      this.setMouseLocation(e);
      this.selectedObject.x = this.mouseX - this.offsetx;
      this.selectedObject.y = this.mouseY - this.offsety;
      this.redraw.status = true;
    } else if (this.isResizeDrag) {
      this.resizeSelectedObject();
    }
    this.setMouseLocation(e);
    if (this.selectedObject !== -1 && !this.isResizeDrag) {
      for (var i = 0; i < 8; i++) {
        var selectionHandle = this.selectionHandle[i];
        if (
          this.mouseX >= selectionHandle.x &&
          this.mouseX <= selectionHandle.x + BOX_SIZE &&
          this.mouseY >= selectionHandle.y &&
          this.mouseY <= selectionHandle.y + BOX_SIZE
        ) {
          this.resizeHandle = i;
          this.redraw.status = true;

          switch (i) {
            case 0:
              this.canvas.style.cursor = "nw-resize";
              break;
            case 1:
              this.canvas.style.cursor = "n-resize";
              break;
            case 2:
              this.canvas.style.cursor = "ne-resize";
              break;
            case 3:
              this.canvas.style.cursor = "w-resize";
              break;
            case 4:
              this.canvas.style.cursor = "e-resize";
              break;
            case 5:
              this.canvas.style.cursor = "sw-resize";
              break;
            case 6:
              this.canvas.style.cursor = "s-resize";
              break;
            case 7:
              this.canvas.style.cursor = "se-resize";
              break;
          }
  
          return;
        }
      }
      this.isResizeDrag = false;
      this.resizeHandle = null;
      this.canvas.style.cursor = "auto";
    }
  }




  resizeSelectedObject() {
    var oldx = this.selectedObject.x;
    var oldy = this.selectedObject.y;

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
    }

    this.redraw.status = true;
  }

  isSelectedObjectChanged(oldselectedObject){
    return this.selectedObject.height != oldselectedObject.height ||
        this.selectedObject.width != oldselectedObject.width || 
        this.selectedObject.x != oldselectedObject.x || 
        this.selectedObject.y != oldselectedObject.y;
  }

  handleMouseUp() {
    this.isDrag = false;
    this.isResizeDrag = false;
    this.resizeHandle = null;
    if(this.isSelectedObjectChanged(this.oldselectedObject)){
      this.stateChangeRequired = true;
    } 
    
    if (this.stateChangeRequired) this.createNewState();
  }
  setRatio() {
    this.actualCanvasHeight = parseFloat(
      window.getComputedStyle(this.canvas).height
    );
    this.actualCanvasWidth = parseFloat(
      window.getComputedStyle(this.canvas).width
    );

    ratio.xratio = this.actualCanvasHeight / this.height;
    ratio.yratio = this.actualCanvasWidth / this.width;
  }

  setMouseLocation(e) {
    var offsetX = 0;
    var offsetY = 0;

    offsetX = this.canvas.getBoundingClientRect().left;
    offsetY = this.canvas.getBoundingClientRect().top;

    this.mouseX = ratioFixedSizeX(e.pageX - offsetX);
    this.mouseY = ratioFixedSizeY(e.pageY - offsetY);
  }

  addRectangle(x, y, width, height, fill) {
    var rect = new Rectangle(x, y, width, height, fill);
    this.objects.push(rect);
    this.createNewState.bind(this)();
    console.log(JSON.stringify(this.changes))
    this.redraw.status = true;
  }

  addText(e) {
    e.preventDefault();
    var data = new FormData(newText);
    var textProperties = {};
    for (const [name, value] of data) {
      textProperties[name] = value;
    }
    new addTextImage(textProperties, this.redraw, this.objects, this.canvas);
    this.redraw.status = true;
    this.createNewState();
  }

  addImage(newImageLayer, e) {
    var file = newImageLayer.files[0];
    var fr = new FileReader();
    fr.onload = createImage.bind(this);
    fr.readAsDataURL(file);

    function createImage() {
      var imageLayer = new ImageObject(this.redraw, 200, 200);
      imageLayer.image.src = fr.result;
      this.objects.push(imageLayer);
      this.createNewState.bind(this)();
    }
  }

  createNewState() {
    if (this.recentUndo) {
      for (let i = this.changes.length - 1; i > this.currentState; i--) {
        this.changes = this.changes.filter((obj) => obj !== this.changes[i]);
      }
    }
    this.currentState++;
    let newState = new ObjectState(this.objects);
    this.changes[this.currentState] = newState;
    this.recentUndo = false;
    this.redraw.status = true;
  }

  undo() {
    if (this.currentState > 0) {
      let previousState = this.changes[--this.currentState];
      let newObjectState = new ObjectState(previousState.objects);
      this.objects = newObjectState.objects;
      this.redraw.status = true;
      this.recentUndo = true;
    }
  }

  redo() {
    if (this.currentState + 1 < this.changes.length) {
      let previousState = this.changes[++this.currentState];
      let newObjectState = new ObjectState(previousState.objects);
      this.objects = newObjectState.objects;
      this.redraw.status = true;
    }
  }

  reset() {
    this.currentState = this.changes.length;
    this.objects = [];
    this.redraw.status = true;
  }

  delete() {
    this.objects = this.objects.filter((item) => item != this.selectedObject);
    this.currentState = this.changes.length;
    this.redraw.status = true;
  }
}
