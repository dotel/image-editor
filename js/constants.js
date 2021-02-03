// Main draw drawing interval
const INTERVAL = 20;

// Size of resizing handles
const BOX_COLOR = 'white';

// Keeps track of current selected tool
const TOOLS = {
  DRAW: 1,
  UNDO: 2,
  REDO: 3,
  RESET: 4,
  CROP: 5,
  RESIZE: 6,
  ROTATE: 7,
  SHAPES: 9,
  STICKERS: 10,
  TEXT: 11,
  MASK: 12,
  FRAMES: 13,
  SEND_BACKWARD: 14,
  BRING_FORWARD: 15,
  DELETE: 16,
};

const DEFAULT_IMAGE = {x: 100, y: 100, width: 200, height: 200};
const DEFAULT_RECTANGLE = { x: 100, y: 100, width: 200, height: 200};
const DEFAULT_STICKER = { x: 100, y: 100, width: 100, height: 100 };
const DEFAULT_CIRCLE = { x: 200, y: 200, radius: 100, fill: "yellow" };

export {
  INTERVAL, BOX_COLOR, TOOLS,
  DEFAULT_IMAGE, DEFAULT_RECTANGLE, DEFAULT_STICKER, DEFAULT_CIRCLE,
};
