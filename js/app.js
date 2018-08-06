function clamp(value, min, max) {
  if (value < min) value = min;
  if (value > max) value = max;
  return value;
}

class App {
  constructor() {
    
    this.map = [
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 1, 1, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 1, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0
    ];
    
    this.width = 8;
    this.height = 8;
    this.size = 32;
    
    this.player = {};
    this.player.x = 0;
    this.player.y = 0;
    
    this.overx = 0;
    this.overy = 0;
    
    this.mouse = {};
    
    this.currentState = this.stateDefault;

    this.createElements();
}
  
  createElements() {
    this.app = document.getElementById('app');
    document.body.appendChild(this.app);
    
    this.canvas = document.createElement('canvas');
    this.canvas.width = 256;
    this.canvas.height = 256;
    this.app.appendChild(this.canvas);
    
    window.addEventListener('mousedown', this);
    window.addEventListener('mouseup', this);
    window.addEventListener('mousemove', this);
  }
  
  start() {
    this.frameId = requestAnimationFrame(this.step.bind(this));
  }
  
  pause() {
    
  }
  
  resume() {
    
  }
  
  step() {
    this.frameId = requestAnimationFrame(this.step.bind(this));
    this.update();
    this.draw();
  }
  
  stateDefault() {
    if (this.mouse.button0) {
      if (!this.grabbed) {
        let gx = (this.mouse.x / this.size) >> 0;
        let gy = (this.mouse.y / this.size) >> 0;
        let px = Math.round(this.player.x);
        let py = Math.round(this.player.y);
        if (gx == px && gy == py) {
          this.grabbed = true;
        }
      }
      else {            
        let dx = this.mouse.x - this.mouse.downx;
        let dy = this.mouse.y - this.mouse.downy;

        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          if (Math.abs(dx) >= Math.abs(dy)) {
            this.dragdirection = 'horizontal';
            // this.overx += (dx / this.size);
            // this.moveX(dx / this.size);
          }
          else {
            this.dragdirection = 'vertical';
            // this.moveY(dy / this.size);
          }
          this.currentState = this.stateDrag;
        }
      }
    }
  }
  
  moveX(dx) {
    // if ((dx < 0 && this.player.x == 0) || (dx > 0 && this.player.x == this.width - 1)) return;
    // 
    // this.overx += dx;
    // 
    // if (Math.abs(this.overx) >= 1) {
    //   let max = Math.abs(this.overx >> 0);
    //   let sign = Math.sign(this.overx >> 0);
    //   let mx = this.player.x;
    //   for (var i = 0; i < max; i++) {
    //     let x = this.player.x + ((i + 1) * sign);
    //     if (x < 0 || x > this.width - 1 || this.map[this.player.y * this.width + x] !== 0) {
    //       break;
    //     }
    //     mx = x;
    //   }
    //   this.player.x = mx;
    // 
    //   this.overx = this.overx - (this.overx >> 0);
    // }
    // this.player.x = clamp(mx, 0, this.width - 1);
    
    this.player.x += dx;
  }
  
  moveY(dy) {
  }
    
  stateDrag() {
    if (this.mouse.button0) {
      if (this.mouse.deltax || this.mouse.deltay) {
        if (this.dragdirection == 'horizontal') {
          if (this.mouse.deltax) {
            this.moveX(this.mouse.deltax / this.size);
          }
        }
        else if (this.dragdirection == 'vertical') {
        }
      }
    }
    else {
      this.dragdirection = null;
      // this.player.x = clamp(Math.round(this.player.x + this.overx), 0, this.width - 1);
      // this.player.y = clamp(Math.round(this.player.y + this.overy), 0, this.height - 1);
      this.overx = 0;
      this.overy = 0;
      this.grabbed = false;
      this.currentState = this.stateDefault;
    }
  }
  
  update() {
    this.currentState();
    this.mouse.deltax = 0;
    this.mouse.deltay = 0;
  }
  
  draw() {
    let ctx = this.canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    for (var j = 0; j < this.height; j++) {
      for (var i = 0; i < this.width; i++) {
        let index = j * this.width + i;
        
        if (this.map[index] == 1) {
          ctx.fillStyle = 'black';  
        }
        else {
          ctx.fillStyle = 'lightgray';
        }
        
        ctx.fillRect(i * this.size, j * this.size, this.size, this.size);
      }
    }
    
    ctx.fillStyle = 'red';
    ctx.fillRect((this.player.x + this.overx) * this.size, this.player.y * this.size, this.size, this.size);

    let px = Math.round(this.player.x);
    let py = Math.round(this.player.y);

    ctx.strokeStyle = 'cyan';
    ctx.beginPath();
    ctx.rect(px * this.size + 0.5, py * this.size + 0.5, this.size-1, this.size-1);
    ctx.stroke();
    
    ctx.font = '12px sans-serif';
    ctx.fillText(this.currentState, 10, this.height * this.size - 12);
    ctx.fillText(this.overx, 10, this.height * this.size - 24);
  }
  
  onMouseDown(event) {
    this.mouse.downx = event.pageX - this.canvas.offsetLeft;
    this.mouse.downy = event.pageY - this.canvas.offsetTop;

    this.mouse.button0 = true;
  }

  onMouseUp(event) {
    this.mouse.button0 = false;
  }

  onMouseMove(event) {
    this.mouse.x = event.pageX - this.canvas.offsetLeft;
    this.mouse.y = event.pageY - this.canvas.offsetTop;
    
    this.mouse.deltax = this.mouse.x - this.mouse.lastx;
    this.mouse.deltay = this.mouse.y - this.mouse.lasty;
    
    this.mouse.lastx = this.mouse.x;
    this.mouse.lasty = this.mouse.y;
  }

  handleEvent(event) {
    if (event.type == 'mousedown') {
      this.onMouseDown(event);
    }
    else if (event.type == 'mouseup') {
      this.onMouseUp(event);
    }
    else if (event.type == 'mousemove') {
      this.onMouseMove(event);
    }
  }  
}

