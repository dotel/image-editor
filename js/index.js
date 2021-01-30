import Layers from "./layers.js";

let canvas = document.getElementById("drawScreen");
let ctx = canvas.getContext("2d");

let image = new Image();

image.src = "./images/test.jpg";

let layers = new Layers();
layers.initializeLayers(ctx, canvas, image);

const tools = document.querySelectorAll("[data-tab-target]");
const toolContent = document.querySelectorAll("[data-tab-content]");


tools.forEach((tab) => {
  tab.addEventListener("click", () => {
    const activeTab = document.querySelector(tab.dataset.tabTarget);
    toolContent.forEach((tabContent) => {
      tabContent.classList.remove("active");
    });
    tools.forEach((tab) => {
      tab.classList.remove("active");
    });
    tab.classList.add("active");
    activeTab.classList.add("active");
  });
});

// load new image for editing
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
  layers.initializeLayers(ctx, canvas, image);
};

function download() {
  const image = canvas.toDataURL("image/jpeg", 0.9);
  const link = document.createElement("a");
  link.href = image;
  link.download = "edited_image.jpg";
  link.click();
}

document.getElementById("downloadBtn").addEventListener("click", download);

document.getElementById("undo").addEventListener("click", () => {
  layers.undo();
});

document.getElementById("redo").addEventListener("click", () => {
  layers.redo();
});

document.getElementById("delete").addEventListener("click", () => {
  layers.delete();
});

document.getElementById("reset").addEventListener("click", () => {
  layers.reset();
});

document.getElementById("reset").addEventListener("click", () => {
  layers.reset();
});

document.getElementById("sendLayerBackward").addEventListener("click", () => {
  layers.sendSelectedLayerBackward();
});

document.getElementById("sendLayerForward").addEventListener("click", () => {
  layers.sendSelectedLayerForward();
});

document.getElementById("imgResizeValue").addEventListener("submit", (e) =>{
  layers.resize(e);
})

let canvasX = document.getElementById("currentCanvasX")
let canvasY = document.getElementById("currentCanvasY")

setInterval(() => {
  canvasX.innerText = layers.canvas.width;
  canvasY.innerText = layers.canvas.height;
}, 200)


window.onkeypress = (e) => {
  if (e.key == "Delete") {
    if (layers.selectedObject != -1) {
      layers.delete();
    }
  }
};
