import ImageObject from './imageobject.js';
import Layers from './layers.js';
import Rectangle from './rectangleObject.js';

const canvas = document.getElementById('drawScreen');
const ctx = canvas.getContext('2d');
let cropBox = {};

const image = new Image();
let maskImageObject;


// default background image of a cat
image.src = './images/test.jpg';

let layers = new Layers();

layers.initializeLayers(ctx, canvas, image);

const tools = document.querySelectorAll('[data-tab-target]');
const toolContent = document.querySelectorAll('[data-tab-content]');
const input = document.getElementById('file-selector');
const maskImageSelector = document.getElementById('maskImageSelector');
const loadedMaskImage = document.getElementById('loadedMaskImage');
const maskImage = document.getElementById('maskImage');
const resizeValueX = document.getElementById('resizeValueX');
const resizeValueY = document.getElementById('resizeValueY');
const preserveAspectRatio = document.getElementById('preserveAspectRatio');
const defaultDraw = document.getElementById('defaultDraw');
const drawElement = document.getElementById('draw');
const currentCanvasX = document.getElementById('currentCanvasX');
const currentCanvasY = document.getElementById('currentCanvasY');
const crop = document.getElementById('crop');
const applyCrop = document.getElementById('applyCrop');

tools.forEach((tab) => {
  tab.addEventListener('click', () => {
    const activeTab = document.querySelector(tab.dataset.tabTarget);
    toolContent.forEach((tabContent) => {
      tabContent.classList.remove('active');
    });
    tools.forEach((tool) => {
      tool.classList.remove('active');
    });
    tab.classList.add('active');
    activeTab.classList.add('active');
  });
});

// Load new image for editing
input.onchange = () => {
  const file = input.files[0];
  const fr = new FileReader();
  function createImage() {
    image.src = fr.result;
  }

  fr.onload = createImage;
  fr.readAsDataURL(file);

  layers = new Layers();
  layers.initializeLayers(ctx, canvas, image);
};

// Load a new mask image
maskImageSelector.onchange = () => {
  const file = maskImageSelector.files[0];
  const fr = new FileReader();
  function createImage() {
    maskImageObject = new ImageObject(layers.redraw, 100, 100);
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

document.getElementById('undo').addEventListener('click', () => {
  layers.undo();
});

document.getElementById('redo').addEventListener('click', () => {
  layers.redo();
});

document.getElementById('delete').addEventListener('click', () => {
  layers.delete();
});

document.getElementById('reset').addEventListener('click', () => {
  layers.reset();
});

document.getElementById('sendLayerBackward').addEventListener('click', () => {
  layers.sendSelectedLayerBackward();
});

document.getElementById('sendLayerForward').addEventListener('click', () => {
  layers.sendSelectedLayerForward();
});

document.getElementById('imgResizeValue').addEventListener('submit', (e) => {
  layers.resize(e);
});

// Maintains aspect ratio when image is being resized
document.getElementById('resizeValueX').addEventListener('change', (e) => {
  if (preserveAspectRatio.checked) {
    const xFactor = e.target.value / layers.img.width;
    resizeValueY.value = parseInt(`${xFactor * layers.img.height}`, 10);
  }
});

// Maintains aspect ratio when image is being resized
document.getElementById('resizeValueY').addEventListener('change', (e) => {
  if (preserveAspectRatio.checked) {
    const yFactor = e.target.value / layers.img.height;
    resizeValueX.value = parseInt(`${yFactor * layers.img.width}`, 10);
  }
});

function beginDraw() {
  const data = new FormData(drawElement);
  const drawOptions = {};
  for (const [name, value] of data) {
    drawOptions[name] = value;
  }
  layers.draw(drawOptions.color, drawOptions.size);
}

drawElement.addEventListener('change', beginDraw);

defaultDraw.addEventListener('click', beginDraw, true);

function removeDefaultDraw() {
  defaultDraw.removeEventListener('click', beginDraw, true);
}

drawElement.addEventListener('change', removeDefaultDraw);


// Displays current canvas size at the bottom right side
setInterval(() => {
  currentCanvasX.innerText = layers.canvas.width;
  currentCanvasY.innerText = layers.canvas.height;
}, 200);

function newCropBox(e) {
  e.preventDefault();
  const cropBoxSize = { x: layers.width / 2, y: layers.height / 2 };
  cropBox = new Rectangle(
    0,
    0,
    cropBoxSize.x,
    cropBoxSize.y,
    'transparent',
    'white',
    'true',
  );
  layers.objects.push(cropBox);
  layers.redraw.status = true;
}

crop.addEventListener('click', newCropBox, { once: true });

applyCrop.addEventListener('submit', (e) => {
  e.preventDefault();
  crop.addEventListener('click', newCropBox, { once: true });
  layers.crop(cropBox);
});

applyCrop.addEventListener('reset', (e) => {
  crop.addEventListener('click', newCropBox, { once: true });
  e.preventDefault();
  layers.changes = [];
  layers.objects = [];
  layers.redrawEverything();
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
    default:
      break;
  }
};
