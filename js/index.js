
import Layers from './layers.js';
import {handleEvents} from './eventHandler.js'

const canvas = document.getElementById('drawScreen');
const ctx = canvas.getContext('2d');
const image = new Image();
// default background image of a cat
image.src = './images/test.jpg';

let layers = new Layers();

layers.initializeLayers(ctx, canvas, image);

handleEvents(canvas, ctx, layers, image);
