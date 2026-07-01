'use strict';

(function initialiseInterface(G) {
  const byId = id => document.getElementById(id);
  let announcementTimer;

  G.ui = {
    level: byId('levelValue'),
    wave: byId('waveValue'),
    kills: byId('killsValue'),
    time: byId('timeValue'),
    health: byId('healthValue'),
    healthBar: byId('healthBar'),
    xp: byId('xpValue'),
    xpBar: byId('xpBar'),
    slots: byId('powerSlots'),
    slotCounter: byId('slotCounter'),
    startModal: byId('startModal'),
    levelModal: byId('levelModal'),
    gameOverModal: byId('gameOverModal'),
    choices: byId('powerChoices'),
    rerollButton: byId('rerollButton'),
    rerolls: byId('rerollsValue'),
    results: byId('results'),
    announcement: byId('announcement'),
    pauseButton: byId('pauseButton')
  };

  G.formatTime = function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const remainder = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainder}`;
  };

  G.announce = function announce(text) {
    G.ui.announcement.textContent = text;
    G.ui.announcement.classList.add('show');
    clearTimeout(announcementTimer);
    announcementTimer = setTimeout(() => G.ui.announcement.classList.remove('show'), 1200);
  };

  G.updateHud = function updateHud() {
    const state = G.state;
    const player = state.player;

    G.ui.level.textContent = state.level;
    G.ui.wave.textContent = state.wave;
    G.ui.kills.textContent = state.kills;
    G.ui.time.textContent = G.formatTime(state.time);
    G.ui.health.textContent = `${Math.ceil(player.health)} / ${player.maxHealth}`;
    G.ui.healthBar.style.width = `${G.clamp(player.health / player.maxHealth * 100, 0, 100)}%`;
    G.ui.xp.textContent = `${state.xp} / ${state.xpNeeded}`;
    G.ui.xpBar.style.width = `${G.clamp(state.xp / state.xpNeeded * 100, 0, 100)}%`;
    G.ui.rerolls.textContent = state.rerolls;
    G.ui.pauseButton.textContent = state.paused && !state.choosingPower ? 'Resume' : 'Pause';
  };

  G.renderPowerSlots = function renderPowerSlots() {
    const ownedPowers = [...G.state.player.powers];
    G.ui.slots.innerHTML = '';
    G.ui.slotCounter.textContent = `${ownedPowers.length} / 4`;

    for (let index = 0; index < 4; index += 1) {
      const slot = document.createElement('div');
      slot.className = 'power-slot';
      const owned = ownedPowers[index];

      if (owned) {
        const [id, level] = owned;
        const power = G.POWERS.find(item => item.id === id);
        slot.classList.add('filled');
        slot.innerHTML = `<span class="power-icon">${power.icon}</span><span><strong>${power.name}</strong><small>Level ${level}</small></span>`;
      } else {
        slot.textContent = 'Empty power slot';
      }

      G.ui.slots.appendChild(slot);
    }
  };

  G.renderPowerChoices = function renderPowerChoices() {
    G.ui.choices.innerHTML = '';

    G.getPowerChoices().forEach(power => {
      const currentLevel = G.powerLevel(power.id);
      const button = document.createElement('button');
      button.className = 'power-choice';
      button.innerHTML = `
        <span class="choice-icon">${power.icon}</span>
        <h3>${power.name}</h3>
        <p>${currentLevel ? power.upgrade(currentLevel + 1) : power.description}</p>
        <span class="choice-level">${currentLevel ? `Upgrade ${currentLevel} → ${currentLevel + 1}` : 'New power'}</span>
      `;
      button.addEventListener('click', () => G.pickPower(power.id));
      G.ui.choices.appendChild(button);
    });

    G.ui.rerollButton.disabled = G.state.rerolls <= 0;
  };

  G.showPowerChoices = function showPowerChoices() {
    G.state.choosingPower = true;
    G.state.paused = true;
    G.ui.levelModal.classList.add('open');
    G.renderPowerChoices();
    G.updateHud();
  };

  G.endRun = function endRun() {
    const state = G.state;
    state.gameOver = true;
    state.paused = true;
    G.ui.results.innerHTML = `
      <div class="result"><span>Time survived</span><strong>${G.formatTime(state.time)}</strong></div>
      <div class="result"><span>Wave reached</span><strong>${state.wave}</strong></div>
      <div class="result"><span>Enemies flattened</span><strong>${state.kills}</strong></div>
    `;
    G.ui.gameOverModal.classList.add('open');
  };
})(window.TaviGame);
