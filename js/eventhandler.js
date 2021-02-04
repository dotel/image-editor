import { DEFAULT_RECTANGLE, TOOLS } from './constants.js';
import ImageObject from './imageobject.js';
import Rectangle from './rectangleobject.js';
import Layers from './layers.js';

function handleEvents(canvas, ctx, layers, image) {
  const undoTool = document.getElementById('undoTool');
  const redoTool = document.getElementById('redoTool');
  const deleteTool = document.getElementById('deleteTool');
  const resetTool = document.getElementById('resetTool');
  const sendLayerBackwardTool = document.getElementById('sendLayerBackwardTool');
  const bringLayerForwardTool = document.getElementById('bringLayerForwardTool');
  const drawTool = document.getElementById('drawTool');
  const cropTool = document.getElementById('cropTool');
  const shapeTool = document.getElementById('shapeTool');
  const resizeTool = document.getElementById('resizeTool');
  const textTool = document.getElementById('textTool');
  const framesTool = document.getElementById('framesTool');
  const rotateTool = document.getElementById('rotateTool');
  const stickersTool = document.getElementById('stickersTool');
  const maskTool = document.getElementById('maskTool');
  const tools = document.querySelectorAll('.tool');
  const toolContent = document.querySelectorAll('[data-tab-content]');
  const newImageForEdit = document.getElementById('file-selector');
  const maskImageSelector = document.getElementById('maskImageSelector');
  const loadedMaskImage = document.getElementById('loadedMaskImage');
  const maskImage = document.getElementById('maskImage');
  const resizeValueX = document.getElementById('resizeValueX');
  const resizeValueY = document.getElementById('resizeValueY');
  const preserveAspectRatio = document.getElementById('preserveAspectRatio');
  const currentCanvasX = document.getElementById('currentCanvasX');
  const currentCanvasY = document.getElementById('currentCanvasY');
  const originalCanvasX = document.getElementById('originalCanvasX');
  const originalCanvasY = document.getElementById('originalCanvasY');
  const applyCrop = document.getElementById('applyCrop');
  const stickers = document.querySelectorAll('.stickers img');
  const fontSelect = document.getElementById('fontSelect');
  const textPreview = document.getElementById('textPreview');
  const inputText = document.getElementById('inputText');
  const inputTextFontSize = document.getElementById('inputTextFontSize');
  const inputTextColorPicked = document.getElementById('inputTextColorPicked');
  const rotateLeft = document.getElementById('rotateLeft');
  const rotateRight = document.getElementById('rotateRight');
  const frames = document.querySelectorAll('#frames img');
  const undoToolInfo = document.querySelector('#undoTool span');
  const redoToolInfo = document.querySelector('#redoTool span');
  const deleteToolInfo = document.querySelector('#deleteTool span');
  const sendLayerBackwardToolInfo = document.querySelector('#sendLayerBackwardTool span');
  const bringLayerForwardToolInfo = document.querySelector('#bringLayerForwardTool span');
  const newRectangle = document.getElementById('newRectangle');
  const newText = document.getElementById('newText');
  const newImage = document.getElementById('newImage');
  const newCircle = document.getElementById('newCircle');
  const newShape = document.getElementById('newShape');
  const shapeColorPicked = document.getElementById('shapeColorPicked');

  let brushColor;
  let brushSize;

  let cropBox = {};
  let maskImageObject;

  stickers.forEach((stickerElement) => {
    stickerElement.addEventListener('click', () => {
      layers.addImage(stickerElement, 'sticker');
    });
  });

  frames.forEach((frameElement) => {
    frameElement.addEventListener('click', () => {
      layers.addImage(frameElement, 'frame');
    });
  });

  // Sets up tabs
  tools.forEach((tool) => {
    tool.addEventListener('click', () => {
      if (tool.dataset.tabTarget) {
        const activeTab = document.querySelector(tool.dataset.tabTarget);
        toolContent.forEach((tabContent) => {
          tabContent.classList.remove('active');
        });
        activeTab.classList.add('active');
      }
      tools.forEach((tool) => {
        tool.classList.remove('active');
      });
      tool.classList.add('active');
    });
  });

  // Load new image for editing
  newImageForEdit.addEventListener('change', () => {
    // layers.reset();
    const file = newImageForEdit.files[0];
    const fr = new FileReader();
    function createImage() {
      image.src = fr.result;
    }
    fr.onload = createImage;
    fr.readAsDataURL(file);
    layers = new Layers();
    layers.initializeLayers(ctx, canvas, image);
  });

  // Load a new mask image
  maskImageSelector.onchange = () => {
    const file = maskImageSelector.files[0];
    const fr = new FileReader();
    function createImage() {
      maskImageObject = new ImageObject(layers, 100, 100, 100, 100);
      maskImageObject.image.src = fr.result;
      layers.objects.push(maskImageObject);
      loadedMaskImage.innerHTML = `<img src = ${fr.result}>`;
    }
    fr.onload = createImage;
    fr.readAsDataURL(file);
  };

  // Maks the image
  maskImage.addEventListener('submit', (e) => {
    loadedMaskImage.innerHTML = '';
    e.preventDefault();
    layers.mask(maskImageObject);
  });

  // Download edited photo
  function download() {
    const tempImage = canvas.toDataURL('image/jpeg', 0.9);
    const link = document.createElement('a');
    link.href = tempImage;
    link.download = 'edited_image.jpg';
    link.click();
  }

  function setCursorToAuto() {
    layers.canvas.style.cursor = 'auto';
  }

  /**
     * Sets current tool to given tool
     * @param {number} tool
     */
  function setTool(tool) {
    if (layers.objects.length > 0
        && layers.objects[layers.objects.length - 1].isCropTool) {
      layers.objects.pop();
      layers.redrawEverything();
    }

    layers.toolSelected = tool;
    setCursorToAuto();
  }

  // Handles creation of new layers
  window.onresize = layers.setRatio.bind(layers);

  newRectangle.addEventListener('click', () => {
    layers.addRectangle(
      DEFAULT_RECTANGLE.x,
      DEFAULT_RECTANGLE.y,
      DEFAULT_RECTANGLE.height,
      DEFAULT_RECTANGLE.width,
      shapeColorPicked.value,
    );
  });

  newText.addEventListener('submit', (e) => {
    layers.addText.bind(layers)(e);
  });

  newImage.addEventListener('change', (e) => {
    layers.addImageFromFile.bind(layers)(newImage, e);
  });

  newCircle.addEventListener('click', (e) => {
    layers.addCircle.bind(layers)(e, shapeColorPicked.value);
  });

  newShape.addEventListener('input', (e) => {
    const { selectedObject } = layers;
    if (selectedObject.isShape == true) {
      if (selectedObject.type == 'rectangle') {
        selectedObject.fill = e.target.value;
        layers.redrawEverything();
      } else if (selectedObject.type == 'circle') {
        document.getElementById('shapeFillInfo').innerHTML = 'Not supported';
      }
    }
  });

  document.getElementById('downloadBtn').addEventListener('click', download);

  undoTool.addEventListener('click', () => {
    layers.undo();
    setTool(TOOLS.UNDO);
  });

  undoTool.addEventListener('pointerover', () => {
    undoToolInfo.innerHTML = layers.currentState === 0 ? 'Nothing to undo' : 'Undo';
  });

  redoTool.addEventListener('click', () => {
    layers.redo();
    setTool(TOOLS.REDO);
  });

  redoTool.addEventListener('pointerover', () => {
    redoToolInfo.innerHTML = (layers.currentState === layers.changes.length - 1) ? 'Nothing to redo' : 'Redo';
  });

  deleteTool.addEventListener('click', () => {
    layers.delete();
    setTool(TOOLS.DELETE);
  });

  deleteTool.addEventListener('mouseover', () => {
    if (layers.selectedObject.isCropTool || layers.selectedObject === -1) {
      deleteToolInfo.innerHTML = 'No layer selected';
      deleteTool.disabled = true;
    } else {
      deleteToolInfo.innerHTML = 'Delete';
    }
  });

  resetTool.addEventListener('click', () => {
    layers.reset();
    setTool(TOOLS.RESET);
  });

  sendLayerBackwardTool.addEventListener('click', () => {
    layers.sendSelectedLayerBackward();
    setTool(TOOLS.SEND_BACKWARD);
  });

  sendLayerBackwardTool.addEventListener('mouseover', () => {
    sendLayerBackwardToolInfo.innerHTML = layers.selectedObject === -1 ? 'No object selected' : 'Send backward';
  });

  bringLayerForwardTool.addEventListener('mouseover', () => {
    bringLayerForwardToolInfo.innerHTML = layers.selectedObject === -1 ? 'No Object selected' : 'Bring forward';
  });

  bringLayerForwardTool.addEventListener('click', () => {
    layers.sendSelectedLayerForward();
    setTool(TOOLS.BRING_FORWARD);
  });

  rotateTool.addEventListener('click', () => {
    setTool(TOOLS.ROTATE);
  });

  stickersTool.addEventListener('click', () => {
    setTool(TOOLS.STICKERS);
  });

  maskTool.addEventListener('click', () => {
    setTool(TOOLS.MASK);
  });

  shapeTool.addEventListener('click', () => {
    setTool(TOOLS.SHAPES);
  });

  resizeTool.addEventListener('click', () => {
    setTool(TOOLS.RESIZE);
  });

  textTool.addEventListener('click', () => {
    setTool(TOOLS.textTool);
  });
  framesTool.addEventListener('click', () => {
    setTool(TOOLS.FRAMES);
  });

  function beginDraw() {
    setTool(TOOLS.DRAW);
    layers.draw(brushColor, brushSize);
    layers.canvas.style.cursor = 'crosshair';
  }

  drawTool.addEventListener('click', beginDraw);

  drawTool.addEventListener('change', () => {
    setTool(-1);
  });

  document.getElementById('imgResizeValue').addEventListener('submit', (e) => {
    layers.resize(e);
  });

  // Maintains aspect ratio when image is being resized
  document.getElementById('resizeValueX').addEventListener('change', (e) => {
    if (preserveAspectRatio.checked) {
      e.preventDefault();
      const xFactor = e.target.value / layers.image.width;
      resizeValueY.value = parseInt(`${xFactor * layers.image.height}`, 10);
    }
  });

  // Maintains aspect ratio when image is being resized
  document.getElementById('resizeValueY').addEventListener('change', (e) => {
    if (preserveAspectRatio.checked) {
      const yFactor = e.target.value / layers.image.height;
      resizeValueX.value = parseInt(`${yFactor * layers.image.width}`, 10);
    }
  });

  // Handle rotations
  rotateLeft.addEventListener('click', () => {
    layers.rotateLeft();
  });

  rotateRight.addEventListener('click', () => {
    layers.rotateRight();
  });

  // Displays current canvas size at the bottom right side
  setInterval(() => {
    currentCanvasX.innerText = layers.canvas.width;
    currentCanvasY.innerText = layers.canvas.height;
    originalCanvasX.innerText = layers.originalImage.width;
    originalCanvasY.innerText = layers.originalImage.height;
  }, 200);

  function newCropBox(e) {
    e.preventDefault();
    const cropBoxSize = { x: layers.width / 2, y: layers.height / 2 };
    cropBox = new Rectangle(
      layers,
      layers.width / 2 - cropBoxSize.x / 2,
      layers.height / 2 - cropBoxSize.y / 2,
      cropBoxSize.x,
      cropBoxSize.y,
      'transparent',
      'black',
      'true',
    );
    layers.objects.push(cropBox);
    layers.redraw.status = true;
  }

  cropTool.addEventListener('click', (e) => {
    const lastObject = layers.objects[layers.objects.length - 1];
    if (lastObject && lastObject.isCropTool) return;
    setTool(TOOLS.CROP);
    newCropBox(e);
    layers.redrawEverything();
  });

  applyCrop.addEventListener('submit', (e) => {
    e.preventDefault();
    if (layers.toolSelected === TOOLS.CROP) {
      layers.crop(cropBox);
      layers.toolSelected = -1;
    }
  });

  applyCrop.addEventListener('reset', (e) => {
    e.preventDefault();
    layers.objects.pop();
    layers.redrawEverything();
  });

  const fonts = ['Montez', 'Lobster', 'Josefin Sans', 'Shadows Into Light', 'Pacifico', 'Amatic SC', 'Orbitron', 'Rokkitt', 'Righteous', 'Dancing Script', 'Bangers', 'Chewy', 'Sigmar One', 'Architects Daughter', 'Abril Fatface', 'Covered By Your Grace', 'Kaushan Script', 'Gloria Hallelujah', 'Satisfy', 'Lobster Two', 'Comfortaa', 'Cinzel', 'Courgette'];
  for (let a = 0; a < fonts.length; a += 1) {
    const opt = document.createElement('option');
    opt.value = fonts[a];
    opt.innerHTML = fonts[a];
    opt.style.fontFamily = fonts[a];
    fontSelect.add(opt);
  }

  inputText.addEventListener('input', (e) => {
    textPreview.innerText = e.target.value;
  });

  inputTextFontSize.addEventListener('input', (e) => {
    textPreview.style.fontSize = `${e.target.value}px`;
  });

  inputTextColorPicked.addEventListener('input', (e) => {
    textPreview.style.color = e.target.value;
  });

  fontSelect.addEventListener('input', (e) => {
    textPreview.style.fontFamily = e.target.value;
  });

  window.onkeypress = (e) => {
    switch (e.key) {
      case 'Delete':
        if (layers.selectedObject !== -1) {
          layers.delete();
        }
        break;
      case 'z':
        if (e.ctrlKey) {
          layers.undo();
        }
        break;
      case 'y':
        if (e.ctrlKey) {
          layers.redo();
        }
        break;
      case 'Enter':
        if (layers.toolSelected === TOOLS.CROP) {
          layers.crop(cropBox);
          layers.toolSelected = -1;
        }
        break;
      default:
        break;
    }
  };

  canvas.addEventListener('mouseout', () => {
    if (layers.isDrag || layers.isResizeDrag) {
      layers.isResizeDrag = false;
      layers.isDrag = false;
      layers.selectedObject = -1;
      canvas.style.cursor = 'auto';
      layers.redrawEverything();
    }
  });
}

export { handleEvents };
