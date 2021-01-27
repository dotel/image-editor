import { initializeLayers } from "./layers.js";

let canvas = document.getElementById("drawScreen");
let ctx = canvas.getContext("2d");

let image = new Image();

image.src = "../images/horizontal.jpg";

initializeLayers(ctx, canvas, image);

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

var input = document.getElementById("file-selector");

input.onchange = function () {
  var file = input.files[0];
  var fr = new FileReader();
  fr.onload = createImage;
  fr.readAsDataURL(file);
  function createImage() {
    image.src = fr.result;
  }
};

function download() {
  const image = canvas.toDataURL("image/jpeg", 0.9);
  const link = document.createElement("a");
  link.href = image;
  link.download = "edited_image.jpg";
  link.click();
}

document.getElementById("downloadBtn").addEventListener("click", download);
