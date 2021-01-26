function clearContext(ctx, height, width){
    ctx.clearRect(0, 0, height, width);
}

function randomColor() {
    return ('#' + Math.floor(Math.random() * 16777215).toString(16));
}

function grayScale(ctx){
    let pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for(let i = 0; i < pixelData.data.length; i += 4){
    var avg = (pixelData.data[i] + pixelData.data[i+1]  + pixelData.data[i + 2])/3;
    pixelData.data[i] = avg;
    pixelData.data[i + 1] = avg;
    pixelData.data[i + 2] = avg;
  }
  ctx.putImageData(pixelData, 0, 0);
}

export {clearContext, randomColor, grayScale}