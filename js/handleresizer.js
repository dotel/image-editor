import { BOX_SIZE, BOX_COLOR } from "./constants.js";
function resizer(ctx, selectedObj, selectionHandles) {
  if (selectedObj === this) {
    // 0  1  2
    // 3     4
    // 5  6  7
    ctx.strokeStyle = "transparent";

    ctx.strokeRect(this.x, this.y, this.w, this.h);

    var half = BOX_SIZE / 2;

    selectionHandles[0].x = this.x - half;
    selectionHandles[0].y = this.y - half;

    selectionHandles[1].x = this.x + this.w / 2 - half;
    selectionHandles[1].y = this.y - half;

    selectionHandles[2].x = this.x + this.w - half;
    selectionHandles[2].y = this.y - half;

    selectionHandles[3].x = this.x - half;
    selectionHandles[3].y = this.y + this.h / 2 - half;

    selectionHandles[4].x = this.x + this.w - half;
    selectionHandles[4].y = this.y + this.h / 2 - half;

    selectionHandles[6].x = this.x + this.w / 2 - half;
    selectionHandles[6].y = this.y + this.h - half;

    selectionHandles[5].x = this.x - half;
    selectionHandles[5].y = this.y + this.h - half;

    selectionHandles[7].x = this.x + this.w - half;
    selectionHandles[7].y = this.y + this.h - half;

    ctx.fillStyle = BOX_COLOR;
    for (var i = 0; i < 8; i++) {
      var cur = selectionHandles[i];

      ctx.fillRect(cur.x, cur.y, BOX_SIZE, BOX_SIZE);
    }
  }
}

export { resizer };
