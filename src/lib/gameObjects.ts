export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export class Bird {
  position: Position;
  velocity: Velocity;
  width: number;
  height: number;
  rotation: number;
  flapStrength: number;
  gravity: number;

  constructor(x: number, y: number) {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.width = 34;
    this.height = 24;
    this.rotation = 0;
    this.flapStrength = -6;
    this.gravity = 0.4;
  }

  flap(): void {
    this.velocity.y = this.flapStrength;
  }

  update(): void {
    // Apply gravity
    this.velocity.y += this.gravity;
    
    // Update position
    this.position.y += this.velocity.y;

    // Calculate rotation based on velocity
    this.rotation = Math.min(Math.max(this.velocity.y * 0.1, -0.5), 1.5);

    // Terminal velocity
    if (this.velocity.y > 10) {
      this.velocity.y = 10;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);
    ctx.rotate(this.rotation);

    // Draw bird body
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw bird eye
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.ellipse(8, -4, 6, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(10, -4, 3, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw beak
    ctx.fillStyle = '#FF6B35';
    ctx.beginPath();
    ctx.moveTo(this.width / 2 - 5, -2);
    ctx.lineTo(this.width / 2 + 5, 0);
    ctx.lineTo(this.width / 2 - 5, 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  getBounds() {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height
    };
  }
}

export class Pipe {
  position: Position;
  width: number;
  gapHeight: number;
  topHeight: number;
  speed: number;
  passed: boolean;

  constructor(x: number, canvasHeight: number, gapHeight = 140) {
    this.position = { x, y: 0 };
    this.width = 52;
    this.gapHeight = gapHeight;
    this.speed = -2;
    this.passed = false;

    // Random gap position
    const minGapY = 50;
    const maxGapY = canvasHeight - gapHeight - 50;
    const gapY = Math.random() * (maxGapY - minGapY) + minGapY;
    
    this.topHeight = gapY;
  }

  update(): void {
    this.position.x += this.speed;
  }

  draw(ctx: CanvasRenderingContext2D, canvasHeight: number): void {
    const gradient = ctx.createLinearGradient(this.position.x, 0, this.position.x + this.width, 0);
    gradient.addColorStop(0, '#4CAF50');
    gradient.addColorStop(0.5, '#45A049');
    gradient.addColorStop(1, '#3E8E41');

    // Top pipe
    ctx.fillStyle = gradient;
    ctx.fillRect(this.position.x, 0, this.width, this.topHeight);

    // Top pipe cap
    ctx.fillRect(this.position.x - 4, this.topHeight - 20, this.width + 8, 20);

    // Bottom pipe
    const bottomPipeY = this.topHeight + this.gapHeight;
    ctx.fillRect(this.position.x, bottomPipeY, this.width, canvasHeight - bottomPipeY);

    // Bottom pipe cap
    ctx.fillRect(this.position.x - 4, bottomPipeY, this.width + 8, 20);

    // Pipe highlights
    ctx.fillStyle = '#66BB6A';
    ctx.fillRect(this.position.x + 4, 0, 4, this.topHeight);
    ctx.fillRect(this.position.x + 4, bottomPipeY, 4, canvasHeight - bottomPipeY);
  }

  getTopBounds() {
    return {
      x: this.position.x,
      y: 0,
      width: this.width,
      height: this.topHeight
    };
  }

  getBottomBounds(canvasHeight: number) {
    const bottomPipeY = this.topHeight + this.gapHeight;
    return {
      x: this.position.x,
      y: bottomPipeY,
      width: this.width,
      height: canvasHeight - bottomPipeY
    };
  }

  isOffScreen(): boolean {
    return this.position.x + this.width < 0;
  }

  hasPassedBird(birdX: number): boolean {
    return !this.passed && this.position.x + this.width < birdX;
  }
}

export class Background {
  position: Position;
  speed: number;

  constructor() {
    this.position = { x: 0, y: 0 };
    this.speed = -0.5;
  }

  update(): void {
    this.position.x += this.speed;
    if (this.position.x <= -100) {
      this.position.x = 0;
    }
  }

  draw(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.8, '#98D8E8');
    gradient.addColorStop(1, '#B0E0E6');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 3; i++) {
      const cloudX = (this.position.x + i * 200) % (width + 100);
      const cloudY = 50 + i * 30;
      
      // Simple cloud shapes
      ctx.beginPath();
      ctx.ellipse(cloudX, cloudY, 30, 15, 0, 0, Math.PI * 2);
      ctx.ellipse(cloudX + 25, cloudY, 35, 20, 0, 0, Math.PI * 2);
      ctx.ellipse(cloudX + 50, cloudY, 30, 15, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, height - 50, width, 50);
    
    // Grass
    ctx.fillStyle = '#32CD32';
    ctx.fillRect(0, height - 50, width, 10);
  }
}