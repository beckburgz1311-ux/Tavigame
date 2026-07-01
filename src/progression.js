'use strict';

(function initialiseProgression(G) {
  G.powerLevel = function powerLevel(id) {
    return G.state.player.powers.get(id) || 0;
  };

  G.getPowerChoices = function getPowerChoices() {
    const canAddNewPower = G.state.player.powers.size < 4;
    const pool = G.POWERS.filter(power => {
      const level = G.powerLevel(power.id);
      return level < power.maxLevel && (level > 0 || canAddNewPower);
    });

    const choices = [];
    while (pool.length > 0 && choices.length < 4) {
      const index = Math.floor(Math.random() * pool.length);
      choices.push(pool.splice(index, 1)[0]);
    }
    return choices;
  };

  G.gainExperience = function gainExperience(amount) {
    const state = G.state;
    state.xp += amount;

    while (state.xp >= state.xpNeeded) {
      state.xp -= state.xpNeeded;
      state.level += 1;
      state.xpNeeded = Math.floor(12 + state.level * 7 + state.level ** 1.18);
      state.pendingLevels += 1;

      if (state.level % 4 === 0) {
        state.rerolls += 1;
      }
    }

    if (state.pendingLevels > 0 && !state.choosingPower) {
      G.showPowerChoices();
    }
  };

  G.pickPower = function pickPower(id) {
    const state = G.state;
    const oldLevel = G.powerLevel(id);
    state.player.powers.set(id, oldLevel + 1);

    if (id === 'shield') {
      state.player.maxHealth += oldLevel > 0 ? 3 : 8;
      state.player.health = Math.min(state.player.maxHealth, state.player.health + 10);
      state.player.shieldReady = true;
    }

    G.renderPowerSlots();
    state.pendingLevels -= 1;

    if (state.pendingLevels > 0) {
      G.renderPowerChoices();
    } else {
      state.choosingPower = false;
      state.paused = false;
      G.ui.levelModal.classList.remove('open');
      G.lastFrame = performance.now();
    }

    G.updateHud();
  };
})(window.TaviGame);
