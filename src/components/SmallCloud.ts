import { Container, type DestroyOptions, Graphics, type ContainerOptions } from 'pixi.js';

const circles = [
  {
    radius: 10,
    x: -30,
    y: 0,
  },
  {
    radius: 10,
    x: -15,
    y: -10,
  },
  {
    radius: 20,
    x: 0,
    y: 0,
  },
  {
    radius: 14,
    x: 8,
    y: -20,
  },
  {
    radius: 14,
    x: 30,
    y: -5,
  },
];

export class SmallCloud extends Container {
  private shape!: Graphics;

  _recoverTimer?: ReturnType<typeof setTimeout>;

  constructor(options: ContainerOptions) {
    super(options);
    this.init();
  }

  init() {
    this.shape = new Graphics();
    this.addChild(this.shape);

    for (const circle of circles) {
      this.shape.circle(circle.x, circle.y, circle.radius);
    }
    this.shape.fill(0xffffff);
  }

  onHit() {
    this.tint = 0xcccccc;
    if (this._recoverTimer) {
      clearTimeout(this._recoverTimer);
    }
    this._recoverTimer = setTimeout(() => {
      this.tint = 0xffffff;
    }, 100);
  }

  destroy(options: DestroyOptions) {
    super.destroy(options);
    if (this._recoverTimer) {
      clearTimeout(this._recoverTimer);
    }
  }
}
