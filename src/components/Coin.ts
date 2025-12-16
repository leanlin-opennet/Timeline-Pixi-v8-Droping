import { Container, Text, type ContainerOptions, type DestroyOptions } from 'pixi.js';
import { gsap } from 'gsap';
import { Spine } from '@esotericsoftware/spine-pixi-v8';

const CoinData = [
  {
    id: 1,
    value: 20,
    weight: 1,
  },
  {
    id: 2,
    value: 15,
    weight: 2,
  },
  {
    id: 3,
    value: 12.5,
    weight: 3,
  },
  {
    id: 4,
    value: 10,
    weight: 4,
  },
  {
    id: 5,
    value: 5,
    weight: 10,
  },
];

export class Coin extends Container {
  private spine: Spine;
  public isCollected = false;
  value = 10;
  valueText: Text;
  id = 1;

  constructor(
    options: ContainerOptions & {
      variant: number;
    },
  ) {
    super({
      label: 'coin',
      ...options,
    });

    const variant = (options.variant ?? 1) - 1;
    const randomCoin = CoinData[variant];
    this.id = randomCoin.id;
    this.value = randomCoin.value;

    // this.graphics = new Graphics();
    // this.graphics.circle(0, 0, 15);
    // this.graphics.fill(0xffd700); // Gold color
    // this.graphics.stroke({ width: 2, color: 0xdaa520 }); // Darker gold outline

    this.spine = Spine.from({
      skeleton: 'candy-data',
      atlas: 'candy-atlas',
      autoUpdate: false,
      scale: 0.2,
    });
    this.spine.state.setAnimation(0, `symbol_${this.id}`, false);
    this.spine.update(0.0016);

    this.valueText = new Text({
      text: this.value.toString(),
      anchor: { x: 0.5, y: 0.5 },
      resolution: 3,
      style: {
        fontSize: 16,
        fill: 0xffffff,
        stroke: {
          color: 0x000000,
          width: 2,
        },
      },
    });
    this.addChild(this.spine, this.valueText);

    // Animate the coin
    this.animate();
  }

  animate() {
    // gsap.to(this.scale, {
    //   x: 0.8,
    //   duration: 0.5,
    //   yoyo: true,
    //   repeat: -1,
    //   ease: 'sine.inOut',
    // });
  }

  collect() {
    if (this.isCollected) return;
    this.isCollected = true;

    this.spine.autoUpdate = true;
    this.spine.state.setAnimation(0, `symbol_${this.id}`, false);

    // Visual feedback
    gsap.to(this, {
      alpha: 0,
      scale: 1.5,
      duration: 0.2,
      delay: 0.5,
      onComplete: () => {
        this.destroy();
      },
    });
  }

  destroy(options?: DestroyOptions) {
    super.destroy(options);
  }
}
