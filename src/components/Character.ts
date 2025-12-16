import {
  Container,
  Sprite,
  type ContainerOptions,
  type Texture,
  Text,
  type TextStyleOptions,
} from 'pixi.js';

import { gsap } from 'gsap';
import type { Viewport } from 'pixi-viewport';

export class Character extends Container {
  sprite: Sprite;
  private hints: FadeHints;

  rewards = new Set<string>();

  _score = 0;
  reward = 0;
  scoreText: Text;

  _flipCount = 0;
  _prevAngle = 0;
  _totalAngle = 0;
  _startY = 0;
  _totalY = 0;

  _camera?: Viewport;

  constructor(options: ContainerOptions, texture: Texture) {
    super({
      label: 'character',
      ...options,
    });
    this.sprite = new Sprite({
      texture,
      anchor: { x: 0.5, y: 0.5 },
    });
    this._prevAngle = this.sprite.rotation;
    this._startY = this.position.y;

    this.hints = new FadeHints();

    this.scoreText = new Text({
      text: '0',
      anchor: { x: 0.5, y: 0.5 },
      y: 30,
      style: {
        fontSize: 20,
        fill: 0xffffff,
        stroke: {
          color: 0x000000,
          width: 4,
        },
      },
    });

    this.addChild(this.sprite, this.scoreText, this.hints);
  }

  bindCamera(camera: Viewport | undefined) {
    this._camera = camera;
  }

  get score() {
    return this._score;
  }
  set score(value: number) {
    const amount = {
      value: this._score,
    };
    gsap.to(amount, {
      value: value,
      duration: 0.2,
      ease: 'power2.inOut',
      onUpdate: () => {
        this.scoreText.text = amount.value.toFixed(2);
      },
    });
    this._score = value;
  }
  triggerFlip(direction: 'left' | 'right') {
    this.hints.addHint(`Flip ${direction} !`);
    this._flipCount++;
  }
  // updateScore(score: number) {
  //   // const fallLength = Math.max(this._totalY - Score.y.min, 0);
  //   // this.score =
  //   //   this.reward +
  //   //   (fallLength / Score.y.step) * Score.y.amount +
  //   //   Score.angle.amount * this._flipCount;
  //   // this.score = score;
  // }
  collectReward(id: string, reward: number) {
    if (this.rewards.has(id)) {
      return;
    }
    this.rewards.add(id);
    this.reward += reward;
    this.hints.addHint(`+ $${reward}`, { stroke: { color: 0xdd9922, width: 4 } });
  }
}

class FadeHints extends Container {
  addHint(hint: string, style?: TextStyleOptions) {
    const text = new Text({
      text: hint,
      anchor: { x: 0.5, y: 0.5 },
      style: {
        fontSize: 20,
        fill: 0xffffff,
        stroke: {
          color: 0xdd3333,
          width: 4,
        },
        ...style,
      },
    });
    this.addChild(text);
    gsap.to(text, {
      y: -100,
      duration: 0.5,
    });
    gsap.to(text, {
      alpha: 0,
      delay: 0.2,
      duration: 0.5,
      ease: 'power2.inOut',
      onComplete: () => {
        this.removeChild(text);
      },
    });
  }
}
