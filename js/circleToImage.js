import ImageObject from "./imageobject.js";
import { randomColor } from "./utilities.js";

function createCircleImage(x, y, radius, layers, fill){
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.height = 2* radius;
        tempCanvas.width = 2 * radius;
        tempCtx.beginPath();
        tempCtx.arc(x - radius, y - radius, radius, 0, 2 * Math.PI);
        tempCtx.fillStyle = fill;
        tempCtx.fill();
        const imageObject = new ImageObject(layers, x - radius, y - radius, tempCanvas.width, tempCanvas.height)
        imageObject.image.src = tempCanvas.toDataURL()
        imageObject.isShape = true;
        imageObject.type = 'circle'
        return imageObject;
        
}
export {createCircleImage}