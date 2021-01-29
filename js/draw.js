var isDrawing = false;
var drawColor = "red"
function startDrawing(event){
    isDrawing = true;
}
function continueDrawing(context){
    if(isDrawing){
        // context.lineTo(mx, my);
        context.strokeStyle = drawColor;
        context.lineWidth = 4;
        context.lineCap = "round";
        context.lineJoin = "round";
        context.stroke();
    }
}

function stopDrawing(){

}

export {startDrawing, stopDrawing, continueDrawing}