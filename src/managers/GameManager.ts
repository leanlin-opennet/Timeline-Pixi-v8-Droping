import {
  type Application,
  Container,
  Graphics,
  Text,
  Assets,
  type Texture,
  type ContainerOptions,
  Ticker,
} from 'pixi.js';
import gsap from 'gsap';

import { Character } from '../components/Character';
import { Coin } from '../components/Coin';
import { Balloon } from '../components/Balloon';
import { SmallCloud } from '../components/SmallCloud';
import type { Camera } from '../components/Camera';
import { GameOverScreen } from '../components/ui/GameOverScreen';

import { assetsManager } from './AssetsManager';

import testingTimelineData from './timelineData.json';

export interface EntityStateData {
  id: string;
  label: string;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;

  collected?: boolean;
  flipped?: boolean;
  variant?: number;
}

export interface RecordData {
  entities: Partial<EntityStateData>[];
  score: number;
}

export class GameManager {
  private static _instance: GameManager;
  public app!: Application;
  public viewport!: Camera;
  public character?: Character;

  private mapWidth = 6000;
  private mapHeight = 8000;

  private entities: Container[] = [];
  private entityMap: Map<string, Container> = new Map();
  private bunnyTexture?: Texture;

  private gameOverScreen!: GameOverScreen;
  private startButton?: Container;

  private timelineData: RecordData[] = [];
  private setupData?: RecordData;

  preFrameTime = 1000 / 120;

  isPlaying = false;
  playFn?: (ticker: Ticker) => void;
  progress = 0;

  private constructor() {
    this.timelineData = testingTimelineData;
  }

  public static get instance(): GameManager {
    if (!GameManager._instance) {
      GameManager._instance = new GameManager();
    }
    return GameManager._instance;
  }

  get currentFrameIndex(): number {
    return Math.floor(this.progress * this.timelineData.length);
  }

  get currentFrame(): RecordData | undefined {
    return this.timelineData[this.currentFrameIndex];
  }

  public async init(app: Application, viewport: Camera) {
    this.app = app;
    this.viewport = viewport;

    this.viewport.clampZoom({
      maxWidth: this.mapWidth * 2,
      maxHeight: this.mapHeight * 2,
      minScale: 0.1,
    });

    // Load assets
    await assetsManager.loadAssets();

    this.bunnyTexture = Assets.get('bunny');

    this.createWalls();

    // Init UI
    this.gameOverScreen = new GameOverScreen();
    this.gameOverScreen.on('restart', () => {
      this.restartGame();
    });
    this.app.stage.addChild(this.gameOverScreen);

    this.showStartScreen();

    return this;
  }

  private createWalls() {
    // Ground
    this.createWall(0, -50, 10000, 50);
  }

  private createWall(x: number, y: number, w: number, h: number) {
    const wall = new Graphics();
    wall.rect(-w / 2, -h / 2, w, h);
    wall.fill(0x222222);
    wall.position.set(x, y);

    this.viewport.addChild(wall);
  }

  private spawnCharacter() {
    if (!this.bunnyTexture) return;

    const firstFrame = this.setupData;
    if (!firstFrame) return;
    const characterEntity = firstFrame.entities.find((e) => e.label === 'character');
    if (!characterEntity) return;
    const { id, x, y, scaleX, scaleY, rotation } = characterEntity;

    this.character = new Character(
      {
        label: 'character',
        x: x,
        y: y,
        scale: {
          x: scaleX ?? 1,
          y: scaleY ?? 1,
        },
        rotation: rotation ?? 0,
      },
      this.bunnyTexture,
    );
    this.entityMap.set(id!, this.character);

    this.viewport.addChild(this.character);

    // Bind camera
    this.viewport.setViewTarget(this.character);
    this.character.bindCamera(this.viewport);

    this.viewport.setZoom(0.8);
  }

  public updatePreFrameTime(time: number) {
    this.preFrameTime = time;
    if (this.isPlaying) {
      this.play();
    }
  }

  public async play() {
    if (!this.character) return;

    if (this.playFn) {
      Ticker.shared.remove(this.playFn);
    }
    this.isPlaying = true;

    const length = this.timelineData.length;
    const totalTime = length * this.preFrameTime;
    let elapsed = this.progress * totalTime;
    const startTime = performance.now() - elapsed;

    this.playFn = (_ticker: Ticker) => {
      elapsed = performance.now() - startTime;
      const progress = elapsed / totalTime;
      this.updateProgress(progress);
    };
    Ticker.shared.add(this.playFn);
  }
  public pause() {
    if (!this.playFn || !this.isPlaying) return;

    Ticker.shared.remove(this.playFn);
    this.isPlaying = false;
  }
  public updateProgress(progress: number) {
    const prevFrameIndex = this.currentFrameIndex;

    this.progress = Math.min(Math.max(progress, 0), 1);

    if (prevFrameIndex === this.currentFrameIndex) {
      return;
    }

    this.playFrame(this.currentFrame);
    if (this.progress === 1) {
      Ticker.shared.remove(this.playFn!);
      this.onGameOver();
    }
  }

  private playFrame(frame?: RecordData) {
    if (!this.character || !frame) return;

    this.viewport.moveCenter(this.character.position);
    this.character.score = frame.score;

    const entities = frame.entities;

    for (const entityData of entities) {
      const { id, x, y, scaleX, scaleY, rotation, flipped, collected } = entityData;
      const entity = this.entityMap.get(id!);
      if (!entity || entity.destroyed) continue;

      if (x !== undefined) {
        entity.position.x = x;
      }
      if (y !== undefined) {
        entity.position.y = y;
      }
      if (scaleX !== undefined) {
        entity.scale.x = scaleX;
      }
      if (scaleY !== undefined) {
        entity.scale.y = scaleY;
      }
      if (rotation !== undefined) {
        if (entity instanceof Character) {
          entity.sprite.rotation = rotation;
        } else {
          entity.rotation = rotation;
        }
      }

      if (entity instanceof Coin && collected) {
        entity.collect();
        this.character?.collectReward(id!, entity.value);
      }
      if (entity instanceof Character && flipped) {
        this.character?.triggerFlip('left');
      }
    }
  }

  private setupTimeline(timelineData: RecordData[]) {
    const [firstFrame, ...rest] = timelineData;

    this.setupData = firstFrame;
    this.timelineData = rest;

    this.progress = 0;
    this.isPlaying = false;
    this.setupScene();
  }

  private startGame() {
    this.setupTimeline(testingTimelineData);
    this.viewport.on('pointerdown', this.togglePlayEvent, this);
    this.spawnCharacter();
    this.play();
  }

  private setupScene() {
    const firstFrame = this.setupData;
    if (!firstFrame) return;

    const { entities } = firstFrame;

    for (const entity of entities) {
      const { id, label, x, y, rotation, scaleX, scaleY, variant } = entity;

      const renderOptions: ContainerOptions = {
        label: `${label}-${id}`,
        x: x ?? 0,
        y: y ?? 0,
        scale: {
          x: scaleX ?? 1,
          y: scaleY ?? 1,
        },
        rotation: rotation ?? 0,
      };

      if (label === 'coin') {
        const coin = new Coin({ ...renderOptions, variant: variant ?? 0 });
        this.entityMap.set(id!, coin);
        this.entities.push(coin);
        this.viewport.addChild(coin);
      } else if (label === 'balloon') {
        const balloon = new Balloon(renderOptions);
        this.entityMap.set(id!, balloon);
        this.entities.push(balloon);
        this.viewport.addChild(balloon);
      } else if (label === 'cloud') {
        const cloud = new SmallCloud(renderOptions);
        this.entityMap.set(id!, cloud);
        this.entities.push(cloud);
        this.viewport.addChild(cloud);
      }
    }
  }

  private showStartScreen() {
    if (this.startButton) {
      this.startButton.visible = true;
      this.app.stage.addChild(this.startButton);
      return;
    }

    const btn = new Container({ label: 'start-button' });

    // Background
    const bg = new Graphics();
    bg.roundRect(0, 0, 200, 60, 10);
    bg.fill(0x00aa00);
    bg.stroke({ width: 4, color: 0xffffff });

    // Text
    const text = new Text({
      text: 'Start Game',
      style: {
        fontSize: 30,
        fill: 0xffffff,
        fontWeight: 'bold',
      },
    });
    text.anchor.set(0.5);
    text.position.set(100, 30);

    btn.addChild(bg, text);

    // Position center screen
    btn.pivot.set(100, 30);
    btn.position.set(this.app.screen.width / 2, this.app.screen.height / 2);

    // Interactive
    btn.eventMode = 'static';
    btn.cursor = 'pointer';
    btn.on('pointerdown', (e) => {
      e.stopPropagation();
      btn.visible = false;
      this.startGame();
    });

    this.app.stage.addChild(btn);
    this.startButton = btn;
  }

  private onGameOver() {
    this.viewport.off('pointerdown', this.togglePlayEvent, this);
    if (this.gameOverScreen) {
      this.gameOverScreen.setInfo({
        score: this.character?.score ?? 0,
      });
      this.gameOverScreen.resize(this.app.screen.width, this.app.screen.height);
      this.gameOverScreen.visible = true;

      this.app.stage.addChild(this.gameOverScreen);
    }
  }

  private togglePlayEvent() {
    console.log('togglePlayEvent', this.isPlaying);
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  private restartGame() {
    if (this.gameOverScreen) {
      this.gameOverScreen.visible = false;
    }

    // Clear entities
    this.entities.forEach((e) => {
      e.destroy();
    });
    this.entities = [];

    if (this.character) {
      this.character.destroy({ children: true });
      this.character = undefined;
    }

    // Restart logic
    this.startGame();
  }
}
