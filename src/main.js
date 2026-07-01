'use strict';

(function startApplication(G) {
  G.lastFrame = performance.now();

  G.startRun = function startRun() {
    G.state = G.createState();
    G.ui.startModal.classList.remove('open');
    G.ui.levelModal.classList.remove('open');
    G.ui.gameOverModal.classList.remove('open');

    G.state.running = true;
    G.state.paused = false;
    G.lastFrame = performance.now();

    G.announce('WAVE 1');
    G.renderPowerSlots();
    G.updateHud();
  };

  G.togglePause = function togglePause() {
    const state = G.state;
    if (!state.running || state.choosingPower || state.gameOver) return;

    state.paused = !state.paused;
    G.lastFrame = performance.now();
    G.updateHud();
  };

  function frame(now) {
    const deltaTime = Math.min(0.033, (now - G.lastFrame) / 1000 || 0);
    G.lastFrame = now;

    if (G.state.running && !G.state.paused && !G.state.gameOver) {
      G.updateGame(deltaTime);
    }

    G.drawGame();
    requestAnimationFrame(frame);
  }

  document.getElementById('startButton').addEventListener('click', G.startRun);
  document.getElementById('restartButton').addEventListener('click', G.startRun);
  G.ui.pauseButton.addEventListener('click', G.togglePause);

  G.ui.rerollButton.addEventListener('click', () => {
    if (G.state.rerolls <= 0) return;
    G.state.rerolls -= 1;
    G.renderPowerChoices();
    G.updateHud();
  });

  window.addEventListener('keydown', event => {
    const key = event.key.toLowerCase();
    const movementKeys = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];

    if (movementKeys.includes(key)) {
      event.preventDefault();
      G.keys.add(key);
    }

    if (key === 'p' || key === 'escape') {
      event.preventDefault();
      G.togglePause();
    }
  });

  window.addEventListener('keyup', event => {
    G.keys.delete(event.key.toLowerCase());
  });

  window.addEventListener('blur', () => {
    G.keys.clear();
    if (G.state.running && !G.state.choosingPower && !G.state.gameOver) {
      G.state.paused = true;
      G.updateHud();
    }
  });

  document.querySelectorAll('#mobileControls button').forEach(button => {
    const key = button.dataset.key.toLowerCase();

    const press = event => {
      event.preventDefault();
      G.keys.add(key);
    };

    const release = event => {
      event.preventDefault();
      G.keys.delete(key);
    };

    button.addEventListener('pointerdown', press);
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('pointerleave', release);
  });

  G.renderPowerSlots();
  G.updateHud();
  G.drawGame();
  requestAnimationFrame(frame);
})(window.TaviGame);
