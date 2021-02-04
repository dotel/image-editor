import { RESIZING_BOX_COLOR } from './constants.js';

/**
 * This method positions the resize handles correctly
 * when layer is being resized
 * @param {context} ctx Canvas Context
 * @param {object} selectedObject Selected layer object
 * @param {object} selectionHandles Selected layer handle
 */
function positionResizeHandlers(layers, selectedObject, selectionHandles) {
  const { ctx } = layers;
  if (selectedObject === this) {
    // Resize handles numbering
    // 0  1  2
    // 3     4
    // 5  6  7
    const half = layers.selectionHandleBoxSize / 2;

    selectionHandles[0].x = this.x - half;
    selectionHandles[0].y = this.y - half;

    selectionHandles[1].x = this.x + this.width / 2 - half;
    selectionHandles[1].y = this.y - half;

    selectionHandles[2].x = this.x + this.width - half;
    selectionHandles[2].y = this.y - half;

    selectionHandles[3].x = this.x - half;
    selectionHandles[3].y = this.y + this.height / 2 - half;

    selectionHandles[4].x = this.x + this.width - half;
    selectionHandles[4].y = this.y + this.height / 2 - half;

    selectionHandles[6].x = this.x + this.width / 2 - half;
    selectionHandles[6].y = this.y + this.height - half;

    selectionHandles[5].x = this.x - half;
    selectionHandles[5].y = this.y + this.height - half;

    selectionHandles[7].x = this.x + this.width - half;
    selectionHandles[7].y = this.y + this.height - half;


    ctx.fillStyle = RESIZING_BOX_COLOR;
    for (let i = 0; i < 8; i += 1) {
      const selectionHandle = selectionHandles[i];

      ctx.fillRect(selectionHandle.x, selectionHandle.y, layers.selectionHandleBoxSize,
        layers.selectionHandleBoxSize);
    }
  }
}

export { positionResizeHandlers };
