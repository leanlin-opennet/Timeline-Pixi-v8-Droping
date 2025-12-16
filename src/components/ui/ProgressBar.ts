import { Container, Graphics, type FederatedPointerEvent } from 'pixi.js';

const TrackBGColor = 0x333333;
const TrackBorderColor = 0xffffff;
const TrackFillColor = 0xdedede;
const KnobColor = 0xffffff;

export class ProgressBar extends Container {
  private track: Graphics;
  private fill: Graphics;
  private knob: Graphics;
  private _progress: number = 0;
  private isDragging: boolean = false;
  private _width: number = 0;
  private _height: number = 20;

  constructor() {
    super();

    this.track = new Graphics();
    this.addChild(this.track);

    this.fill = new Graphics();
    this.addChild(this.fill);

    this.knob = new Graphics();
    this.knob.circle(0, 0, 10);
    this.knob.fill(KnobColor);
    this.knob.stroke({ width: 2, color: 0x000000 });
    this.addChild(this.knob);

    this.eventMode = 'static';
    this.cursor = 'pointer';

    this.on('pointerdown', this.onDragStart, this);
    this.on('globalpointermove', this.onDragMove, this);
    this.on('pointerup', this.onDragEnd, this);
    this.on('pointerupoutside', this.onDragEnd, this);
  }

  public get progress(): number {
    return this._progress;
  }

  public set progress(value: number) {
    if (this.isDragging) return;
    this._progress = Math.max(0, Math.min(1, value));
    this.updateVisuals();
  }

  public resize(screenWidth: number, screenHeight: number) {
    this._width = screenWidth - 100; // 50px padding on each side
    const x = 50;
    const y = screenHeight - 50; // 50px from bottom

    this.position.set(x, y);

    this.drawTrack();
    this.updateVisuals();
  }

  private drawTrack() {
    this.track.clear();
    this.track.roundRect(0, -this._height / 2, this._width, this._height, 10);
    this.track.fill(TrackBGColor);
    this.track.stroke({ width: 2, color: TrackBorderColor });
  }

  private updateVisuals() {
    const fillWidth = this._width * this._progress;

    this.fill.clear();
    this.fill.roundRect(0, -this._height / 2, fillWidth, this._height, 10);
    this.fill.fill(TrackFillColor);

    this.knob.position.set(fillWidth, 0);
  }

  private onDragStart(e: FederatedPointerEvent) {
    e.stopPropagation();
    this.isDragging = true;
    this.updateFromEvent(e);
    this.emit('seekStart');
  }

  private onDragMove(e: FederatedPointerEvent) {
    if (!this.isDragging) return;
    this.updateFromEvent(e);
  }

  private onDragEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.emit('seekEnd', this._progress);
  }

  private updateFromEvent(e: FederatedPointerEvent) {
    const localPos = this.toLocal(e.global);
    const newProgress = localPos.x / this._width;

    this._progress = Math.max(0, Math.min(1, newProgress));
    this.updateVisuals();
    this.emit('seek', this._progress);
  }
}
