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

  const $timelineUpload = document.getElementById('timeline-upload') as HTMLInputElement;
  $timelineUpload.addEventListener('change', (e) => {
    if (gameManager.isPlaying) {
      window.alert('Please stop the game or wait to the end before uploading a new timeline');
      return;
    }

    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          gameManager.setupTimeline(data);
        } catch (_error) {
          window.alert('Invalid timeline data, it must be a valid JSON file');
          return;
        }
      };
      reader.readAsText(file);
    }
  });

  const $smooth = document.getElementById('smooth') as HTMLInputElement;
  $smooth.addEventListener('change', (e) => {
    gameManager.needLerp = (e.target as HTMLInputElement).checked;
  });
})();
