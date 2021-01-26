import Layer from './layer.js'
let canvas = document.getElementById('drawScreen');

let ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let layers = [];

function addNewLayer(layers, x, y) {
  var layer = new Layer(canvas, x, y);
  layers.push(layer);
  return layer;
}

let newLayer = addNewLayer(layers, 0, 0);
newLayer.draw()

// newLayer = addNewLayer(layers, 100, 100);
// newLayer.draw()




let image = new Image();

image.src = '../test.jpg';




function drawImage(){

  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  

  for(var i = 0; i < layers.length; i++ ) {
    ctx.drawImage(layers[i].canvas, 0, 0, canvas.width, canvas.height);
  }
  requestAnimationFrame(drawImage)
}

image.onload = drawImage;

const tabs = document.querySelectorAll('[data-tab-target]');
const tabContents = document.querySelectorAll('[data-tab-content]');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const activeTab = document.querySelector(tab.dataset.tabTarget);
    tabContents.forEach(tabContent => {
      tabContent.classList.remove('active');
    });
    tabs.forEach(tab => {
      tab.classList.remove('active');
    });
    tab.classList.add('active');
    activeTab.classList.add('active');
  });
});


var input = document.getElementById('file-selector');

input.onchange = function(){
  var file = input.files[0];
  var fr = new FileReader();
  fr.onload = createImage;
  fr.readAsDataURL(file); 
  
  function createImage() {
    image.src = fr.result;
    image.onload = drawImage;
  }
};


function download(){		
  const image = canvas.toDataURL('image/jpeg', 0.9);
  const link = document.createElement('a');
  link.href = image;
  link.download = 'edited_image.jpg';
  link.click();
}

document.getElementById('downloadBtn').addEventListener('click', download);


