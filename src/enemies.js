'use strict';

(function initialiseEnemies(G) {
  G.addDamageNumber = function addDamageNumber(x, y, text, colour, lifetime) {
    G.state.damageNumbers.push({ x, y, text, colour, lifetime, maxLifetime: lifetime });
  };

  function chooseEnemyType() {
    const roll = Math.random();
    const wave = G.state.wave;

    if (wave >= 4 && roll < 0.12) return 'tank';
    if (wave >= 3 && roll < 0.26) return 'splitter';
    if (wave >= 2 && roll < 0.46) return 'runner';
    return 'grunt';
  }

  G.spawnEnemy = function spawnEnemy(type = chooseEnemyType(), x = null, y = null, scale = 1) {
    const template = G.ENEMY_TYPES[type];
    const margin = 45;
    const side = Math.floor(Math.random() * 4);

    if (x === null) {
      if (side === 0) { x = G.random(0, 1280); y = -margin; }
      if (side === 1) { x = 1280 + margin; y = G.random(0, 720); }
      if (side === 2) { x = G.random(0, 1280); y = 720 + margin; }
      if (side === 3) { x = -margin; y = G.random(0, 720); }
    }

    const waveScale = 1 + (G.state.wave - 1) * 0.115;
    G.state.enemies.push({
      id: Math.random(),
      type,
      x,
      y,
      radius: template.radius * scale,
      speed: template.speed * (1 + Math.min(0.45, G.state.wave * 0.012)),
      health: template.health * waveScale * scale,
      maxHealth: template.health * waveScale * scale,
      damage: template.damage * (1 + G.state.wave * 0.065),
      xp: Math.round(template.xp * scale),
      colour: template.colour,
      hitTime: 0,
      slowAmount: 0,
      slowTime: 0,
      touchCooldown: 0,
      orbitCooldowns: new Map()
    });
  };

  G.updateSpawner = function updateSpawner(deltaTime) {
    const state = G.state;
    state.waveTime += deltaTime;
    state.spawnTimer -= deltaTime;

    if (state.spawnTimer <= 0) {
      const spawnCount = 1 + Math.floor(state.wave / 7);
      for (let index = 0; index < spawnCount; index += 1) {
        G.spawnEnemy();
      }
      state.spawnTimer = Math.max(0.16, 0.72 - state.wave * 0.035);
    }

    if (state.waveTime < state.waveLength) return;

    state.wave += 1;
    state.waveTime = 0;
    state.waveLength = Math.max(22, 28 - state.wave * 0.25);
    state.player.health = Math.min(state.player.maxHealth, state.player.health + 8);

    if (state.wave % 3 === 0) state.rerolls += 1;

    if (state.wave % 5 === 0) {
      G.spawnEnemy('boss');
      G.announce(`BOSS WAVE ${state.wave}`);
    } else {
      G.announce(`WAVE ${state.wave}`);
    }
  };

  G.updateEnemies = function updateEnemies(deltaTime) {
    const player = G.state.player;

    G.state.enemies.forEach(enemy => {
      enemy.hitTime = Math.max(0, enemy.hitTime - deltaTime);
      enemy.touchCooldown = Math.max(0, enemy.touchCooldown - deltaTime);

      if (enemy.slowTime > 0) enemy.slowTime -= deltaTime;
      else enemy.slowAmount = 0;

      const angle = G.angleTo(enemy, player);
      const speed = enemy.speed * (1 - enemy.slowAmount);
      enemy.x += Math.cos(angle) * speed * deltaTime;
      enemy.y += Math.sin(angle) * speed * deltaTime;

      if (G.distance(enemy, player) < enemy.radius + player.radius && enemy.touchCooldown <= 0) {
        G.damagePlayer(enemy.damage);
        enemy.touchCooldown = 0.7;
        enemy.x -= Math.cos(angle) * 18;
        enemy.y -= Math.sin(angle) * 18;
      }
    });
  };

  G.damagePlayer = function damagePlayer(amount) {
    const state = G.state;
    const player = state.player;
    if (player.invulnerableTime > 0) return;

    const shieldLevel = G.powerLevel('shield');
    if (shieldLevel && player.shieldReady) {
      player.shieldReady = false;
      player.shieldTimer = Math.max(3, 9 - shieldLevel);
      player.invulnerableTime = 0.45;
      state.effects.push({ type: 'ring', x: player.x, y: player.y, radius: 8, maxRadius: 70, lifetime: 0.3, maxLifetime: 0.3, colour: '#ffe4a4' });
      return;
    }

    const reduction = shieldLevel ? Math.min(0.42, shieldLevel * 0.07) : 0;
    const finalDamage = amount * (1 - reduction);
    player.health -= finalDamage;
    player.invulnerableTime = 0.55;
    state.shake = 10;
    state.damageFlash = 0.17;
    G.addDamageNumber(player.x, player.y - 25, `-${Math.ceil(finalDamage)}`, '#ff7088', 0.75);

    if (player.health <= 0) G.endRun();
  };

  G.damageEnemy = function damageEnemy(enemy, amount, colour = '#ffffff') {
    enemy.health -= amount;
    enemy.hitTime = 0.08;
    G.addDamageNumber(enemy.x, enemy.y - enemy.radius, Math.round(amount), colour, 0.52);
    if (enemy.health <= 0) G.killEnemy(enemy);
  };

  G.killEnemy = function killEnemy(enemy) {
    const state = G.state;
    const index = state.enemies.indexOf(enemy);
    if (index < 0) return;

    state.enemies.splice(index, 1);
    state.kills += 1;
    state.gems.push({ x: enemy.x, y: enemy.y, value: enemy.xp, radius: enemy.type === 'boss' ? 9 : 5, pulse: G.random(0, G.TAU) });
    state.effects.push({ type: 'burst', x: enemy.x, y: enemy.y, radius: enemy.radius, lifetime: 0.35, maxLifetime: 0.35, colour: enemy.colour });

    if (enemy.type === 'splitter') {
      G.spawnEnemy('runner', enemy.x + G.random(-12, 12), enemy.y + G.random(-12, 12), 0.75);
      G.spawnEnemy('runner', enemy.x + G.random(-12, 12), enemy.y + G.random(-12, 12), 0.75);
    }

    const vampireLevel = G.powerLevel('vampire');
    if (vampireLevel && Math.random() < 0.07 + vampireLevel * 0.035) {
      const healing = 2 + vampireLevel;
      state.player.health = Math.min(state.player.maxHealth, state.player.health + healing);
      G.addDamageNumber(state.player.x, state.player.y - 28, `+${healing}`, '#79ff9f', 0.85);
    }
  };
})(window.TaviGame);
