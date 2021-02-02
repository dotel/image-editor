import { TOOLS } from './constants.js';
import ImageObject from './imageobject.js';
import Layers from './layers.js';
import Rectangle from './rectangleObject.js';

const canvas = document.getElementById('drawScreen');
const ctx = canvas.getContext('2d');

const undoTool = document.getElementById('undoTool')
const redoTool = document.getElementById('redoTool')
const deleteTool = document.getElementById('deleteTool')
const resetTool = document.getElementById('resetTool')
const sendLayerBackwardTool = document.getElementById('sendLayerBackwardTool')
const sendLayerForwardTool = document.getElementById('sendLayerForwardTool')
const drawTool = document.getElementById('drawTool')
const cropTool = document.getElementById('cropTool')
const shapeTool = document.getElementById('shapeTool')
const resizeTool = document.getElementById('resizeTool')
const textTool = document.getElementById('textTool')
const framesTool = document.getElementById('framesTool')
const rotateTool = document.getElementById('rotateTool')
const stickersTool = document.getElementById('stickersTool')
const maskTool = document.getElementById('maskTool')

const tools = document.querySelectorAll('[data-tab-target]');
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
const crop = document.getElementById('crop');
const applyCrop = document.getElementById('applyCrop');
const stickers = document.querySelectorAll('.stickers img')
const fontSelect = document.getElementById('fontSelect')
const textPreview = document.getElementById('textPreview')
const inputText = document.getElementById('inputText')
const inputTextFontSize = document.getElementById('inputTextFontSize')
const inputTextColorPicked = document.getElementById('inputTextColorPicked')
const rotateLeft = document.getElementById('rotateLeft')
const rotateRight = document.getElementById('rotateRight')
const drawProperties = document.getElementById('drawProperties')
let brushColor;
let brushSize;


let cropBox = {};

const image = new Image();
let maskImageObject;


// default background image of a cat
image.src = './images/test.jpg';

let layers = new Layers();

layers.initializeLayers(ctx, canvas, image);


stickers.forEach(stickerElement => {
  stickerElement.addEventListener('click', () => {
    layers.addImage(stickerElement)
  })
})

tools.forEach((tool) => {
  tool.addEventListener('click', () => {
    const activeTab = document.querySelector(tool.dataset.tabTarget);
    toolContent.forEach((tabContent) => {
      tabContent.classList.remove('active');

    });
    tools.forEach((tool) => {
      tool.classList.remove('active');
    });
    tool.classList.add('active');
    activeTab.classList.add('active');
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
  setToolToDefault();
});

function setToolToDefault(){
  
}



// Load a new mask image
maskImageSelector.onchange = () => {
  const file = maskImageSelector.files[0];
  const fr = new FileReader();
  function createImage() {
    maskImageObject = new ImageObject(layers, 100, 100);
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

document.getElementById('downloadBtn').addEventListener('click', download);

undoTool.addEventListener('click', () => {
  layers.undo();
  setTool(TOOLS.UNDO);
});

redoTool.addEventListener('click', () => {
  layers.redo();
  setTool(TOOLS.REDO);
});

deleteTool.addEventListener('click', () => {
  layers.delete();
  setTool(TOOLS.DELETE);
});

resetTool.addEventListener('click', () => {
  layers.reset();
  setTool(TOOLS.RESET);
});

sendLayerBackwardTool.addEventListener('click', () => {
  layers.sendSelectedLayerBackward();
  setTool(TOOLS.SEND_BACKWARD);
});

sendLayerForwardTool.addEventListener('click', () => {
  layers.sendSelectedLayerForward();
  setTool(TOOLS.BRING_FORWARD);
});

rotateTool.addEventListener('click', (e) =>{
  setTool(TOOLS.ROTATE);
})

stickersTool.addEventListener('click', ()=>{
  setTool(TOOLS.STICKERS);
})

maskTool.addEventListener('click', () => {
  setTool(TOOLS.MASK);
})

shapeTool.addEventListener('click', ()=>{
  setTool(TOOLS.SHAPES);
})

resizeTool.addEventListener('click', ()=>{
  setTool(TOOLS.RESIZE);
})

textTool.addEventListener('click', ()=>{
  setTool(TOOLS.textTool);
})
framesTool.addEventListener('click', () =>{
  setTool(TOOLS.FRAMES);
})

drawTool.addEventListener('click', beginDrawCallBack);

function beginDrawCallBack(){
  setTool(TOOLS.DRAW);
  layers.canvas.style.cursor = 'crosshair';
  beginDraw();
}



drawTool.addEventListener('change', ()=>{
  setTool(-1);
})



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
rotateLeft.addEventListener('click', ()=>{
  layers.rotateLeft();
})


function beginDraw() {
  
  layers.draw(brushColor, brushSize);
  layers.canvas.style.cursor = 'crosshair';
}

// Displays current canvas size at the bottom right side
setInterval(() => {
  currentCanvasX.innerText = layers.canvas.width;
  currentCanvasY.innerText = layers.canvas.height;
}, 200);

function newCropBox(e) {
  e.preventDefault();
  const cropBoxSize = { x: layers.width / 2, y: layers.height / 2 };
  cropBox = new Rectangle(
    layers,
    layers.width/2 - cropBoxSize.x/2,
    layers.height/2 - cropBoxSize.y /2,
    cropBoxSize.x,
    cropBoxSize.y,
    'transparent',
    'black',
    'true',
  );
  layers.objects.push(cropBox);
  layers.redraw.status = true;
}

cropTool.addEventListener('click', (e)=>{
  let lastObject = layers.objects[layers.objects.length -1]; 
  if(lastObject && lastObject.isCropTool)
    return;
  setTool(TOOLS.CROP);
  newCropBox(e);
  layers.redrawEverything();
});

applyCrop.addEventListener('submit', (e) => {
  e.preventDefault();
  if(layers.toolSelected === TOOLS.CROP){
    layers.crop(cropBox);
    layers.toolSelected = -1;
  }
});

applyCrop.addEventListener('reset', (e) => {
  e.preventDefault();
  layers.objects.pop();
  layers.redrawEverything();
});

let fonts = ["Montez","Lobster","Josefin Sans","Shadows Into Light","Pacifico","Amatic SC", "Orbitron", "Rokkitt","Righteous","Dancing Script","Bangers","Chewy","Sigmar One","Architects Daughter","Abril Fatface","Covered By Your Grace","Kaushan Script","Gloria Hallelujah","Satisfy","Lobster Two","Comfortaa","Cinzel","Courgette"];
for(let a = 0; a < fonts.length ; a++){
	let opt = document.createElement('option');
	opt.value = opt.innerHTML = fonts[a];
	opt.style.fontFamily = fonts[a];
	fontSelect.add(opt);
}

inputText.addEventListener('input', (e) => {
  textPreview.innerText = e.target.value;
})

inputTextFontSize.addEventListener('input', (e)=>{
  textPreview.style.fontSize = e.target.value + 'px';
})

inputTextColorPicked.addEventListener('input', (e) => {
  textPreview.style.color = e.target.value;
})

fontSelect.addEventListener('input', (e) =>{
  textPreview.style.fontFamily = e.target.value;
})



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
      if(layers.toolSelected === TOOLS.CROP){
        layers.crop(cropBox);
        layers.toolSelected = -1;
      }
    default:
      break;
  }
};

canvas.addEventListener('mouseout', ()=>{
  layers.selectedObject = -1;
  // layers.isDrag = -1;
});


function setCursorToAuto(){
  layers.canvas.style.cursor = "auto";
}
/**
 * Sets current tool to given tool
 * @param {number} tool
 */
function setTool(tool){
  layers.toolSelected = tool;
  setCursorToAuto();
  layers.selectedObject = -1;
}