import { Container, Graphics } from 'pixi.js';
import gsap from 'gsap';

export class PlayButton extends Container {
  private triangle: Graphics;

  constructor() {
    super();

    const bg = new Graphics();
    bg.roundRect(0, 0, 100, 100, 10);
    bg.fill({
      color: 0x000000,
      alpha: 0.5,
    });
    bg.stroke({ width: 2, color: 0xffffff });
    this.addChild(bg);

    this.triangle = new Graphics();
    this.triangle.moveTo(35, 30);
    this.triangle.lineTo(75, 50);
    this.triangle.lineTo(35, 70);
    this.triangle.closePath();
    this.triangle.fill(0xffffff);
    this.addChild(this.triangle);

    this.pivot.set(50, 50);
  }

  show() {
    this.visible = true;
    this.alpha = 1;
  }

  hide() {
    if (!this.visible) return;

    gsap.to(this, {
      duration: 0.3,
      alpha: 0,
      ease: 'power2.inOut',
      onComplete: () => {
        this.visible = false;
      },
    });
  }
}
