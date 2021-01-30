import Layers from "./layers.js";

let canvas = document.getElementById("drawScreen");
let ctx = canvas.getContext("2d");

let image = new Image();

image.src = "./images/horizontal.jpg";

let layers = new Layers();
layers.initializeLayers(ctx, canvas, image);

const tabs = document.querySelectorAll("[data-tab-target]");
const tabContents = document.querySelectorAll("[data-tab-content]");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const activeTab = document.querySelector(tab.dataset.tabTarget);
    tabContents.forEach((tabContent) => {
      tabContent.classList.remove("active");
    });
    tabs.forEach((tab) => {
      tab.classList.remove("active");
    });
    tab.classList.add("active");
    activeTab.classList.add("active");
  });
});

// when new image is loaded for editing
var input = document.getElementById("file-selector");

input.onchange = function () {
  var file = input.files[0];
  var fr = new FileReader();
  fr.onload = createImage;
  fr.readAsDataURL(file);
  function createImage() {
    image.src = fr.result;
  }
  layers = new Layers();
};

function download() {
  const image = canvas.toDataURL("image/jpeg", 0.9);
  const link = document.createElement("a");
  link.href = image;
  link.download = "edited_image.jpg";
  link.click();
}

document.getElementById("downloadBtn").addEventListener("click", download);

document.getElementById('undo').addEventListener('click', ()=>{
  layers.undo();
})

document.getElementById('redo').addEventListener('click', ()=>{
  layers.redo();
})

document.getElementById('delete').addEventListener('click', ()=>{
  layers.delete();
})

window.onkeypress = (e) =>{
  if(e.key == 'Delete'){
    if(layers.selectedObject != -1){
      layers.delete();
    }
  }
}