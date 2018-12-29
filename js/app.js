function clamp(value, min, max) {
  if (value < min) value = min;
  if (value > max) value = max;
  return value;
}

class App {
  constructor() {
    console.log('App.constructor');

    this.map = [
      0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0,
      0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
      0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0,
      1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
    ];

    // this.items.push({ x:6, y:1 }, { x:1, y:7 }, { x:4, y:4 });
    this.items = new Array(this.map.length);

    this.switches = 0;

    this.particles = [];

    this.width = 16;
    this.height = 8;
    this.size = 32;

    this.playerX = 0;
    this.playerY = 0;

    this.nudgeX = 0;
    this.nudgeY = 0;

    // this.segments = [[0, 0],[0, 1],[0, 2]];
    this.segments = [[0, 0]];

    this.targetX = 0;
    this.targetY = 0;

    this.velocity = 0;

    this.mouse = {};
    this.keys = {};
    this.pressed = {};

    this.states = {};

    // this.stateStack = [];

    this.addState('default', this.stateDefault);
    this.addState('win', this.stateWin);
    this.addState('edit', this.stateEdit);

    this.setState('default');

    this.createElements();
    this.start();
  }

  createElements() {
    this.app = document.getElementById('app');
    document.body.appendChild(this.app);

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.size * this.width;
    this.canvas.height = this.size * this.height;
    this.app.appendChild(this.canvas);

    // this.app.style.tabIndex = 1;

    window.addEventListener('mousedown', this);
    window.addEventListener('mouseup', this);
    window.addEventListener('mousemove', this);
    window.addEventListener('keydown', this);
    window.addEventListener('keyup', this);
    window.addEventListener('focus', this);
    window.addEventListener('blur', this);
    // window.addEventListener('load', () => {
      // console.log('loadss');
      // this.app.focus();
    // });
  }

  spawnParticleEffect(x, y, type=0) {
    this.particles.push({ x: x, y: y, type: type, life: 30 });
  }

  addState(stateName, fn) {
    this.states[stateName] = fn;
  }

  setState(stateName) {
    console.log('setState', stateName);
    this.currentState = this.states[stateName];
    this.currentStateName = stateName;
  }

  getState() {
    return { name: this.currentStateName, fn: this.currentState };
  }

  stateDefault() {
    if (this.mouse.pressed0) {
      let dx = this.mouse.downX;
      let dy = this.mouse.downY;

      if (dx >= 0 && dy >= 0 && dx < this.width * this.size && dy < this.height * this.size) {
        let gx = (dx / this.size) >> 0;
        let gy = (dy / this.size) >> 0;

        if (gy == this.playerY) {
          this.shiftX(gx);
        }
        else if (gx == this.playerX) {
          this.shiftY(gy);
        }
        else {
          if (Math.abs(gx - this.playerX) > Math.abs(gy - this.playerY)) {
            this.shiftX(gx);
          }
          else {
            this.shiftY(gy);
          }
        }
      }

    }

    this.updatePosition();

    if (this.mouse.button0) {
    }

  }

  stateWin() {

  }

  setItem(x, y, type=1) {
    // let item = this.items.find((element) => element.x == x && element.y == y);
    let index = y * this.width + x;
    // let item = this.items[index];
    // if (item) {
      // this.items[index] = null;
      // console.log('fonud!');
    // } else {
      // console.log('put!');
      // this.items.push({x: x, y: y});
    // }
    this.items[index] = type;

  }

  setTile(x, y, value) {
    if (x >= 0 && y >= 0 && x < this.width && y < this.height) {
      this.map[y * this.width + x] = value;
    }
  }

  stateEdit() {
    let mx = this.mouse.x;
    let my = this.mouse.y;

    if (mx >= 0 && my >= 0 && mx < this.width * this.size && my < this.height * this.size) {
      let gx = (mx / this.size) >> 0;
      let gy = (my / this.size) >> 0;
      let index = gy * this.width + gx;

      if (this.keys['1']) {
        this.setTile(gx, gy, 1);
      }
      else if (this.keys['2']) {
        this.setTile(gx, gy, 2);
      }
      else if (this.pressed['i']) {
        this.setItem(gx, gy);
      }
      else if (this.pressed['o']) {
        this.setItem(gx, gy, 2);
      }
      else if (this.keys['x']) {
        if (this.items[index]) {
          this.items[index] = 0;
        } else {
          this.setTile(gx, gy, 0);
        }
      }
    }
  }

  testWin() {
    let total = this.map.reduce((accumulator, value) => value == 2 ? accumulator + 1 : accumulator);
    if (this.switches == total) {
      console.log('win');
      // this.setState('win');
    }
  }

  isValidMove(x, y) {
    if (x >= 0 && x <= this.width - 1 && y >= 0 && y <= this.height - 1) {
      if (this.map[y * this.width + x] !== 1) {
        for (var i = 0; i < this.segments.length; i++) {
          let seg = this.segments[i];
          if (x == seg[0] && y == seg[1]) {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  }

  moveTo(x, y) {
    if (this.isValidMove(x, y)) {
      this.switches = 0;

      for (var i = this.segments.length - 1; i >= 0; i--) {
        if (i > 0) {
          this.segments[i][0] = this.segments[i-1][0];
          this.segments[i][1] = this.segments[i-1][1];
        }
        else {
          this.segments[0][0] = x;
          this.segments[0][1] = y;
        }
        let index = this.segments[i][1] * this.width + this.segments[i][0];
        if (this.map[index] == 2) {
          this.switches++;
        }
      }

      // console.log(this.switches);

      this.playerX = this.segments[0][0];
      this.playerY = this.segments[0][1];

      let index = this.playerY * this.width + this.playerX;

      // let item = this.items.find((element) => element.x == this.playerX && element.y == this.playerY);
      let item = this.items[index];
      if (item) {
        if (item == 1) {
          let tail = this.segments[this.segments.length - 1];
          this.segments.push([tail[0], tail[1]]);
          // this.items = this.items.filter((element) => element !== item);
        }
        else if (item == 2) {
          if (this.segments.length > 1) {
            this.segments.pop();
          }
        }
        this.items[index] = null;
        this.spawnParticleEffect(this.playerX, this.playerY, item);
      }

      return true;
    }
    return false;
  }

  shiftX(x) {
    this.nudgeX = 0;
    this.targetX = x - this.playerX;
    this.targetY = 0;
  }

  shiftY(y) {
    this.nudgeY = 0;
    this.targetX = 0;
    this.targetY = y - this.playerY;
  }

  updatePosition() {
    if (this.targetX) {
      let sign = Math.sign(this.targetX);
      this.nudgeX += 0.5;
      if (this.nudgeX >= 1) {
        let gx = sign > 0 ? Math.ceil(this.playerX + sign) : Math.floor(this.playerX + sign);
        if (this.moveTo(gx, this.playerY)) {
          this.targetX -= sign;
        }
        else {
          this.targetX = 0;
        }
        this.nudgeX--;
      }
      if (this.targetX == 0) this.testWin();
    }
    else if (this.targetY) {
      let sign = Math.sign(this.targetY);
      this.nudgeY += 0.5;
      if (this.nudgeY >= 1) {
        let gy = sign > 0 ? Math.ceil(this.playerY + sign) : Math.floor(this.playerY + sign);
        if (this.moveTo(this.playerX, gy))
          this.targetY -= sign;
        else {
          this.targetY = 0;
        }
        this.nudgeY--;
      }
      if (this.targetY == 0) this.testWin();
    }

  }

  updateParticles() {
    for (var i = 0; i < this.particles.length; i++) {
      let particle = this.particles[i];
      if (particle.life > 0) {
        particle.life--;
      }
    }
  }

  update() {
    this.currentState();
    this.updateParticles();
    this.postUpdate();
  }

  postUpdate() {
    this.mouse.pressed0 = false;
    this.mouse.deltaX = 0;
    this.mouse.deltaY = 0;
    this.mouse.lastX = this.mouse.x;
    this.mouse.lastY = this.mouse.y;
    this.pressed = {};
  }

  drawBase() {
    let ctx = this.canvas.getContext('2d');

    for (var j = 0; j < this.height; j++) {
      for (var i = 0, odd = j % 2; i < this.width; i++, odd = !odd) {
        let index = j * this.width + i;
        let x = i * this.size;
        let y = j * this.size;

        ctx.fillStyle = (odd) ? 'rgb(180,180,180)' : 'rgb(200, 200, 200)';
        ctx.fillRect(x, y, this.size, this.size);

        if (this.map[index] == 1) {
          ctx.fillStyle = 'black';
          ctx.fillRect(x, y, this.size, this.size);
        }
        else if (this.map[index] == 2) {
          ctx.fillStyle = 'gray';
          ctx.strokeStyle = 'black';
          ctx.beginPath();
          ctx.arc(x + this.size / 2, y + this.size / 2, this.size / 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  drawItems() {
    let ctx = this.canvas.getContext('2d');

    for (var i = 0; i < this.items.length; i++) {
      let item = this.items[i];
      if (item) {
        let x = i % this.width;
        let y = (i / this.width) >> 0;
        if (item == 1)
          ctx.fillStyle = 'green';
        else if (item == 2)
          ctx.fillStyle = 'blue';
        ctx.fillRect(x * this.size + this.size / 4,
          y * this.size + this.size / 4, this.size / 2, this.size / 2);
      }
    }
  }

  drawPlayer() {
    let ctx = this.canvas.getContext('2d');

    // let dirX = Math.sign(this.segments[0][0] - this.segments[1][0]);
    // let dirY = Math.sign(this.segments[0][1] - this.segments[1][1]);

    for (var i = 0; i < this.segments.length; i++) {
      if (i > 0) {
        // dirX = Math.sign(this.segments[i - 1][0] - this.segments[i][0]);
        // dirY = Math.sign(this.segments[i - 1][1] - this.segments[i][1]);
      }
      let seg = this.segments[i];
      let x = seg[0];
      let y = seg[1];
      ctx.fillStyle = 'red';
      ctx.fillRect(x * this.size, y * this.size, this.size, this.size);
    }

    ctx.fillStyle = 'yellow';
    ctx.fillRect(this.playerX * this.size + (this.size/2 - this.size/8),
      this.playerY * this.size + (this.size/2 - this.size/8), this.size/4, this.size/4);
  }

  drawParticles() {
    let ctx = this.canvas.getContext('2d');

    for (var i = 0; i < this.particles.length; i++) {
      let particle = this.particles[i];

      if (particle.life > 0) {

        if (particle.type == 0)
          ctx.fillStyle = 'yellow';
        else if (particle.type == 1)
          ctx.fillStyle = 'green';
        else if (particle.type == 2)
          ctx.fillStyle = 'blue';

        // ctx.beginPath();
        // ctx.rect(particle.x * this.size + (this.size/2 - this.size/8) + 0.5,
        //   particle.y * this.size + (this.size/2 - this.size/8) - (30 - particle.life) + 0.5,
        //   this.size/4, this.size/4);
        // ctx.fill();
        ctx.fillRect(particle.x * this.size + (this.size / 2 - this.size / 8),
          particle.y * this.size + (this.size / 2 - this.size / 8) - (30 - particle.life),
          this.size / 4, this.size / 4);
      }
    }
  }

  drawExtras() {
    let ctx = this.canvas.getContext('2d');

    let state = this.getState();

    if (state.name == 'win') {
      ctx.fillStyle = 'blue';
      ctx.font = '96px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('WIN', this.canvas.width * 0.5, this.canvas.height * 0.5);
    }

    if (state.name == 'edit') {
      ctx.fillStyle = 'blue';
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText('EDIT', this.canvas.width, this.canvas.height);
    }

    ctx.lineWidth = 2;
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'white';
    let r = 200;
    let d = (this.time % r) / r;
    if (d !== 0) {
      let p = d >= 0.5 ? 1 - d : d;
      ctx.globalAlpha = p;
    }
    else {
      ctx.globalAlpha = 0;
    }

    for (var i = 0; i < this.segments.length; i++) {
      let index = this.segments[i][1] * this.width + this.segments[i][0];
      let x = index % this.width;
      let y = (index / this.width) >> 0;
      if (this.map[index] == 2) {
        ctx.fillRect(x * this.size, y * this.size, this.size, this.size);
        // ctx.beginPath();
        // ctx.arc((x * this.size + this.size / 2) + 0,
        //    (y * this.size + this.size / 2) + 0, this.size / 4, 0, Math.PI * 2);
        // ctx.stroke();
        // ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    let mx = this.mouse.x;
    let my = this.mouse.y;

    if (mx >= 0 && my >= 0 && mx < this.width * this.size && my < this.height * this.size) {
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = 'red';
      ctx.fillStyle = 'red';
      ctx.lineWidth = 1;

      let gx = (mx / this.size) >> 0;
      let gy = (my / this.size) >> 0;

      ctx.beginPath();
      ctx.rect(gx * this.size + 0.5, gy * this.size +0.5, this.size-1, this.size-1);
      ctx.fill();
      ctx.stroke();

      // ctx.beginPath();
      // ctx.arc((gx * this.size + this.size / 2) + 0,
         // (gy * this.size + this.size / 2) + 0, this.size / 4, 0, Math.PI * 2);
      // ctx.stroke();
      // ctx.fill();

      // if (this.isValidMove(gx, gy)) {
      //   ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
      //   ctx.fillRect(gx * this.size, gy * this.size, this.size, this.size);
      // }
    }

  }

  draw() {
    let ctx = this.canvas.getContext('2d');

    ctx.save();

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawBase();
    this.drawItems();
    this.drawPlayer();
    // this.drawCursor();

    // ctx.font = '12px sans-serif';
    // ctx.fillText(this.currentState.constructor, 10, this.height * this.size - 12);
    // ctx.fillText(this.deltaX, 10, this.height * this.size - 24);
    // ctx.fillText(this.frameNo, 10, this.height * this.size - 36);

    if (!this.active) {
      // ctx.globalAlpha = 0.5;
      // ctx.fillStyle = 'black';
      // ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      // ctx.globalAlpha = 1;
    }

    this.drawParticles();

    this.drawExtras();

    ctx.restore();
  }

  start() {
    this.frameNo = 0;

    this.physicalTime = Date.now();
    this.previousPhysicalTime = this.physicalTime;

    this.time = 0;
    this.previousTime = 0;

    this.draw();
    this.resume();
  }

  pause() {
    if (this.active) {
      console.log('pause', this.time);
      document.body.classList.add('frozen');
      this.active = false;
      cancelAnimationFrame(this.frameId);
      this.draw();
    }
  }

  resume() {
    if (!this.active) {
      console.log('resume', this.time);
      document.body.classList.remove('frozen');
      this.active = true;
      this.physicalTime = Date.now();
      this.previousPhysicalTime = this.physicalTime;
      this.frameId = requestAnimationFrame(this.step.bind(this));
    }
  }

  step() {
    if (this.active) {
      this.frameNo++;

      this.frameId = requestAnimationFrame(this.step.bind(this));

      this.physicalTime = Date.now();

      this.time += (this.physicalTime - this.previousPhysicalTime);

      // this.delta = this.time - this.previousTime;

      this.update();
      this.draw();

      this.previousTime = this.time;
      this.previousPhysicalTime = this.physicalTime;
    } else {
      console.log('step::not active');
    }
  }

  onMouseDown(event) {
    this.mouse.downX = event.pageX - this.canvas.offsetLeft;
    this.mouse.downY = event.pageY - this.canvas.offsetTop;

    this.mouse.button0 = true;
  }

  onMouseUp(event) {
    this.mouse.button0 = false;
    this.mouse.pressed0 = true;
  }

  onMouseMove(event) {
    this.mouse.x = event.pageX - this.canvas.offsetLeft;
    this.mouse.y = event.pageY - this.canvas.offsetTop;

    this.mouse.deltaX = this.mouse.x - this.mouse.lastX;
    this.mouse.deltaY = this.mouse.y - this.mouse.lastY;
  }

  editOn() {
    this.setState('edit');
    // this.pause();
  }

  editOff() {
    this.setState('default');
    // this.resume();
  }

  onKeyDown(event) {
    this.keys[event.key] = true;

  }

  onKeyUp(event) {
    this.keys[event.key] = false;
    this.pressed[event.key] = true;

    if (event.key == ' ') {
      let state = this.getState();
      if (state.name == 'edit') {
        this.editOff();
      }
      else if (state.name == 'default') {
        this.editOn();
      }
    }
  }

  onBlur() {
    this.pause();
  }

  onFocus() {
    this.resume();
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
    else if (event.type == 'keydown') {
      this.onKeyDown(event);
    }
    else if (event.type == 'keyup') {
      this.onKeyUp(event);
    }
    else if (event.type == 'blur') {
      this.onBlur(event);
    }
    else if (event.type == 'focus') {
      this.onFocus(event);
    }
  }
}
