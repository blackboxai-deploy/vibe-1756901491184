import { Bird, Pipe, Background } from './gameObjects';

export enum GameState {
  WAITING = 'WAITING',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export interface GameConfig {
  width: number;
  height: number;
  pipeSpacing: number;
  pipeSpeed: number;
}

export class GameEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  bird: Bird;
  pipes: Pipe[];
  background: Background;
  gameState: GameState;
  score: number;
  highScore: number;
  config: GameConfig;
  animationId: number | null;
  lastTime: number;
  pipeTimer: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    
    this.config = {
      width: canvas.width,
      height: canvas.height,
      pipeSpacing: 200,
      pipeSpeed: -2
    };

    this.bird = new Bird(100, this.config.height / 2);
    this.pipes = [];
    this.background = new Background();
    this.gameState = GameState.WAITING;
    this.score = 0;
    this.highScore = this.loadHighScore();
    this.animationId = null;
    this.lastTime = 0;
    this.pipeTimer = 0;

    this.setupControls();
  }

  private setupControls(): void {
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.handleInput();
      }
    });

    // Mouse controls
    this.canvas.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleInput();
    });

    // Touch controls
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.handleInput();
    });
  }

  private handleInput(): void {
    switch (this.gameState) {
      case GameState.WAITING:
        this.startGame();
        break;
      case GameState.PLAYING:
        this.bird.flap();
        break;
      case GameState.GAME_OVER:
        this.resetGame();
        break;
    }
  }

  private startGame(): void {
    this.gameState = GameState.PLAYING;
    this.bird.flap();
  }

  public resetGame(): void {
    this.bird = new Bird(100, this.config.height / 2);
    this.pipes = [];
    this.score = 0;
    this.pipeTimer = 0;
    this.gameState = GameState.WAITING;
  }

  private gameOver(): void {
    this.gameState = GameState.GAME_OVER;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
  }

  private loadHighScore(): number {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('flappyBirdHighScore');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  }

  private saveHighScore(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('flappyBirdHighScore', this.highScore.toString());
    }
  }

  private spawnPipe(): void {
    const pipe = new Pipe(this.config.width, this.config.height);
    this.pipes.push(pipe);
  }

  private updatePipes(): void {
    // Remove off-screen pipes
    this.pipes = this.pipes.filter(pipe => !pipe.isOffScreen());

    // Update existing pipes
    this.pipes.forEach(pipe => {
      pipe.update();
      
      // Check for scoring
      if (pipe.hasPassedBird(this.bird.position.x)) {
        pipe.passed = true;
        this.score++;
      }
    });

    // Spawn new pipes
    this.pipeTimer++;
    if (this.pipeTimer >= this.config.pipeSpacing) {
      this.spawnPipe();
      this.pipeTimer = 0;
    }
  }

  private checkCollisions(): boolean {
    const birdBounds = this.bird.getBounds();

    // Check ground collision
    if (birdBounds.y + birdBounds.height >= this.config.height - 50) {
      return true;
    }

    // Check ceiling collision
    if (birdBounds.y <= 0) {
      return true;
    }

    // Check pipe collisions
    for (const pipe of this.pipes) {
      const topBounds = pipe.getTopBounds();
      const bottomBounds = pipe.getBottomBounds(this.config.height);

      if (this.isColliding(birdBounds, topBounds) || this.isColliding(birdBounds, bottomBounds)) {
        return true;
      }
    }

    return false;
  }

  private isColliding(rect1: any, rect2: any): boolean {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }

  public update(currentTime: number): void {
    this.lastTime = currentTime;

    // Always update background
    this.background.update();

    if (this.gameState === GameState.PLAYING) {
      // Update game objects
      this.bird.update();
      this.updatePipes();

      // Check for collisions
      if (this.checkCollisions()) {
        this.gameOver();
      }
    }
  }

  public render(): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.config.width, this.config.height);

    // Draw background
    this.background.draw(this.ctx, this.config.width, this.config.height);

    // Draw pipes
    this.pipes.forEach(pipe => {
      pipe.draw(this.ctx, this.config.height);
    });

    // Draw bird
    this.bird.draw(this.ctx);

    // Draw UI
    this.drawUI();
  }

  private drawUI(): void {
    // Score
    if (this.gameState === GameState.PLAYING || this.gameState === GameState.GAME_OVER) {
      this.ctx.fillStyle = '#FFF';
      this.ctx.font = 'bold 36px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(this.score.toString(), this.config.width / 2, 60);
      
      // Add shadow
      this.ctx.fillStyle = '#000';
      this.ctx.fillText(this.score.toString(), this.config.width / 2 + 2, 62);
      this.ctx.fillStyle = '#FFF';
      this.ctx.fillText(this.score.toString(), this.config.width / 2, 60);
    }

    // Game state messages
    this.ctx.textAlign = 'center';
    
    if (this.gameState === GameState.WAITING) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.config.width, this.config.height);
      
      this.ctx.fillStyle = '#FFF';
      this.ctx.font = 'bold 48px Arial';
      this.ctx.fillText('Flappy Bird', this.config.width / 2, this.config.height / 2 - 50);
      
      this.ctx.font = 'bold 24px Arial';
      this.ctx.fillText('Click, Touch, or Press SPACE to start', this.config.width / 2, this.config.height / 2 + 20);
      
      this.ctx.font = '20px Arial';
      this.ctx.fillText(`High Score: ${this.highScore}`, this.config.width / 2, this.config.height / 2 + 60);
    }

    if (this.gameState === GameState.GAME_OVER) {
      this.ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.config.width, this.config.height);
      
      this.ctx.fillStyle = '#FFF';
      this.ctx.font = 'bold 48px Arial';
      this.ctx.fillText('Game Over', this.config.width / 2, this.config.height / 2 - 50);
      
      this.ctx.font = 'bold 32px Arial';
      this.ctx.fillText(`Score: ${this.score}`, this.config.width / 2, this.config.height / 2 + 10);
      
      this.ctx.font = 'bold 24px Arial';
      this.ctx.fillText(`Best: ${this.highScore}`, this.config.width / 2, this.config.height / 2 + 50);
      
      this.ctx.font = '20px Arial';
      this.ctx.fillText('Click, Touch, or Press SPACE to restart', this.config.width / 2, this.config.height / 2 + 90);
    }
  }

  public start(): void {
    if (this.animationId) return;

    const gameLoop = (currentTime: number) => {
      this.update(currentTime);
      this.render();
      this.animationId = requestAnimationFrame(gameLoop);
    };

    this.animationId = requestAnimationFrame(gameLoop);
  }

  public stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this.config.width = width;
    this.config.height = height;
  }
}