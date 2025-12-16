import { Viewport, type IViewportOptions } from 'pixi-viewport';

import type { Character } from './Character';

export class Camera extends Viewport {
  viewTarget?: Character;

  constructor(options: IViewportOptions) {
    super(options);
    this.drag().pinch().wheel().decelerate();
  }

  setViewTarget(target: Character) {
    if (this.viewTarget) {
      this.viewTarget.bindCamera(undefined);
    }

    this.viewTarget = target;
    this.moveCenter(target.position);
  }
}
