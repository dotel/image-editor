
// Main draw drawing interval
const INTERVAL = 20;

// Size of resizing handles
const BOX_COLOR = 'white';


// Keeps track of current selected tool
const TOOLS = {DRAW: 1, UNDO: 2, REDO: 3, RESET: 4, CROP: 5, RESIZE: 6, 
    ROTATE: 7, DRAW: 8, SHAPES: 9, STICKERS: 10,
    TEXT: 11, MASK: 12, FRAMES: 13, SEND_BACKWARD: 14, BRING_FORWARD: 15, 
    DELETE: 16
}
  
export { INTERVAL, BOX_COLOR, TOOLS};
