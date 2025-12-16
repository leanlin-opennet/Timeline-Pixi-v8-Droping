import { Application } from 'pixi.js';

import { GameManager } from './managers/GameManager';
import { Camera } from './components/Camera';

const MapData = {
  width: 2000,
  height: 4000,
};

(async () => {
  const app = new Application();
  await app.init({ background: '#1099bb', resizeTo: window });
  document.getElementById('pixi-container')?.appendChild(app.canvas);

  // Initialize Camera (replacing Viewport)
  const camera = new Camera({
    events: app.renderer.events,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    worldWidth: MapData.width,
    worldHeight: MapData.height,
  });
  app.stage.addChild(camera);

  // Initialize Game Manager
  const gameManager = await GameManager.instance.init(app, camera);

  const $fpsSelect = document.getElementById('fps-select') as HTMLSelectElement;
  $fpsSelect.value = '120';
  $fpsSelect.addEventListener('change', (e) => {
    const value = (e.target as HTMLSelectElement).value;
    gameManager.updatePreFrameTime(1000 / Number.parseInt(value, 10));
  });
})();
