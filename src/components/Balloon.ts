import { Container, Graphics, type ContainerOptions, type DestroyOptions } from 'pixi.js';

export class Balloon extends Container {
  private graphics: Graphics;

  constructor(options: ContainerOptions) {
    super({
      label: 'balloon',
      ...options,
    });

    const radius = 20;
    const color = Math.floor(Math.random() * 0xffffff);

    this.graphics = new Graphics();
    this.graphics.circle(0, 0, radius);
    this.graphics.fill(color);
    // Add a little shine/reflection
    this.graphics.circle(-radius * 0.3, -radius * 0.3, radius * 0.2);
    this.graphics.fill({ color: 0xffffff, alpha: 0.3 });
    // Add a string
    this.graphics.moveTo(0, radius);
    this.graphics.lineTo(0, radius + 20);
    this.graphics.stroke({ width: 2, color: 0xffffff });

    this.addChild(this.graphics);
  }
}
