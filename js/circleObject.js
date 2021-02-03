import ImageObject from "./imageobject.js";
import { randomColor } from "./utilities.js";
import {positionResizeHandlers} from './handleresizer.js'

export default class Circle{
    constructor(x, y, size, layers, fill){
        this.x = x;
        this.y = y; 
        this.height = size;
        this.width = size;
        this.layers = layers;
        this.fill = fill;
        this.type = 'circle'
    }
    draw(ctx, selectedObject, selectionHandles){
        ctx.arc(this.x, this.y, this.height/2, 0, 2 * Math.PI);
        ctx.fillStyle = this.fill;
        ctx.fill();
        positionResizeHandlers.bind(this)(this.layers, selectedObject, selectionHandles);
    }
}