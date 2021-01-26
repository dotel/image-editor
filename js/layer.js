export default class Layer{
    constructor(canvas, x, y){
        this.mainCanvas = canvas;
        this.canvas = document.createElement("canvas");
        
        this.ctx = this.canvas.getContext("2d");
        
        this.position = {
            x: x, 
            y: y
        }
        this.canvas.width = canvas.clientWidth;
        this.canvas.height = canvas.clientHeight;
        // console.log(this.canvas.height)
        this.lastX;
        this.lastY;
        this.dragging = false;

        this.mainCanvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
        this.mainCanvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
        this.mainCanvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
    }
 

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(this.position.x, this.position.y, 100, 100);   
    }

    handleMouseDown(e) {
        e.preventDefault();
        e.stopPropagation();
    
        this.lastX = parseInt(e.clientX);
        this.lastY = parseInt(e.clientY);
          
        this.dragging = true;
    }

    handleMouseUp(e) {
        e.preventDefault();
        e.stopPropagation();
        
        this.dragging = false;
    }
    
    handleMouseMove(e) {
        if (!this.dragging) {
            return;
        }
    
        e.preventDefault();
        e.stopPropagation();
    
        var mouseX = parseInt(e.pageX);

        var mouseY = parseInt(e.pageY);
        
        var shiftX = mouseX - this.lastX;
        var shiftY = mouseY - this.lastY;
    
        // console.log(dx, dy)
        this.lastX = mouseX;
        this.lastY = mouseY;
    
        this.position.x += shiftX;
        this.position.y += shiftY;
    
        this.draw();
    }
}