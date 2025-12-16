import { Assets } from 'pixi.js';

import BunnyImage from '@/assets/bunny.png';

import CandySpine from '@/assets/spines/Symbol.json?url';
import CandySpineAtlas from '@/assets/spines/Symbol.atlas?url';
import CandySpineTexture from '@/assets/spines/Symbol.png?url';

export class AssetsManager {
  async loadAssets() {
    await Assets.load({
      alias: 'bunny',
      src: BunnyImage,
    });
    await this.loadSpine({
      alias: 'candy',
      data: CandySpine,
      atlas: CandySpineAtlas,
      textureUrl: CandySpineTexture,
    });
  }
  async loadSpine({
    alias,
    data,
    atlas,
    textureUrl,
  }: {
    alias: string;
    data: string;
    atlas: string;
    textureUrl: string;
  }) {
    const texture = await Assets.load({
      alias: `${alias}-texture`,
      src: textureUrl,
      parser: 'texture',
    });
    await Assets.load({
      alias: `${alias}-atlas`,
      src: atlas,
      data: {
        images: texture,
      },
    });
    await Assets.load({
      alias: `${alias}-data`,
      src: data,
    });
  }
}

export const assetsManager = new AssetsManager();
