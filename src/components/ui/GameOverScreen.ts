import { Container, Graphics, Text, type FederatedPointerEvent } from 'pixi.js';

export class GameOverScreen extends Container {
  private background: Graphics;
  private titleText: Text;
  private scoreText: Text;
  private restartButton: Container;

  constructor() {
    super();

    // Create background
    this.background = new Graphics();
    this.addChild(this.background);

    // Create Title
    this.titleText = new Text({
      text: 'Game Over',
      style: {
        fontFamily: 'Arial',
        fontSize: 48,
        fontWeight: 'bold',
        fill: 0xffffff,
        stroke: { color: 0x000000, width: 6 },
        dropShadow: {
          color: 0x000000,
          blur: 4,
          angle: Math.PI / 6,
          distance: 6,
        },
      },
      resolution: window.devicePixelRatio,
    });
    this.titleText.anchor.set(0.5);
    this.addChild(this.titleText);

    // Create Score Text
    this.scoreText = new Text({
      text: 'Score: 0',
      resolution: window.devicePixelRatio,
      style: {
        fontFamily: 'Arial',
        fontSize: 32,
        fontWeight: 'bold',
        fill: 0xffd700, // Gold color
        stroke: { color: 0x000000, width: 4 },
      },
    });
    this.scoreText.anchor.set(0.5);
    this.addChild(this.scoreText);

    // Create Restart Button
    this.restartButton = this.createRestartButton();
    this.addChild(this.restartButton);

    this.visible = false;
  }

  private createRestartButton(): Container {
    const btn = new Container();
    btn.label = 'restart-button';

    const bg = new Graphics();
    bg.roundRect(0, 0, 200, 60, 15);
    bg.fill(0xffffff);
    bg.stroke({ width: 4, color: 0x000000 });

    const text = new Text({
      text: 'Try Again',
      resolution: window.devicePixelRatio,
      style: {
        fontFamily: 'Arial',
        fontSize: 24,
        fontWeight: 'bold',
        fill: 0x000000,
      },
    });
    text.anchor.set(0.5);
    text.position.set(100, 30);

    btn.addChild(bg, text);
    btn.pivot.set(100, 30);

    // Make interactive
    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    // Add hover effects
    btn.on('pointerover', () => {
      bg.tint = 0xeeeeee;
      btn.scale.set(1.05);
    });
    btn.on('pointerout', () => {
      bg.tint = 0xffffff;
      btn.scale.set(1);
    });

    btn.on('pointerdown', (e: FederatedPointerEvent) => {
      e.stopPropagation();
      this.emit('restart');
    });

    return btn;
  }

  public setInfo(info: { score: number }) {
    this.scoreText.text = `Final Score: ${info.score.toFixed(2)}`;
  }

  public resize(width: number, height: number) {
    // Resize background to cover full screen
    this.background.clear();
    this.background.rect(0, 0, width, height);
    this.background.fill({ color: 0x000000, alpha: 0.7 });

    // Center elements
    const centerX = width / 2;
    const centerY = height / 2;

    this.titleText.position.set(centerX, centerY - 100);
    this.scoreText.position.set(centerX, centerY);
    this.restartButton.position.set(centerX, centerY + 100);
  }
}
