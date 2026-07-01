'use strict';

(function initialiseWorld(G) {
  G.updateMovement = function updateMovement(deltaTime) {
    const player = G.state.player;
    let horizontal = 0;
    let vertical = 0;

    if (G.keys.has('w') || G.keys.has('arrowup')) vertical -= 1;
    if (G.keys.has('s') || G.keys.has('arrowdown')) vertical += 1;
    if (G.keys.has('a') || G.keys.has('arrowleft')) horizontal -= 1;
    if (G.keys.has('d') || G.keys.has('arrowright')) horizontal += 1;

    const length = Math.hypot(horizontal, vertical) || 1;
    const isMoving = horizontal !== 0 || vertical !== 0;

    player.x = G.clamp(player.x + horizontal / length * player.speed * deltaTime, player.radius, 1280 - player.radius);
    player.y = G.clamp(player.y + vertical / length * player.speed * deltaTime, player.radius, 720 - player.radius);
    player.invulnerableTime = Math.max(0, player.invulnerableTime - deltaTime);

    const shieldLevel = G.powerLevel('shield');
    if (shieldLevel && !player.shieldReady) {
      player.shieldTimer -= deltaTime;
      if (player.shieldTimer <= 0) player.shieldReady = true;
    }

    const poisonLevel = G.powerLevel('poison');
    if (isMoving && poisonLevel) {
      player.timers.poison = (player.timers.poison || 0) - deltaTime;

      if (player.timers.poison <= 0) {
        G.state.puddles.push({
          x: player.x,
          y: player.y,
          radius: 28 + poisonLevel * 3,
          lifetime: 2.8 + poisonLevel * 0.45,
          damage: 8 + poisonLevel * 5,
          tickTimer: 0
        });
        player.timers.poison = Math.max(0.16, 0.42 - poisonLevel * 0.035);
      }
    }
  };

  G.updatePuddles = function updatePuddles(deltaTime) {
    G.state.puddles.forEach(puddle => {
      puddle.lifetime -= deltaTime;
      puddle.tickTimer -= deltaTime;

      if (puddle.tickTimer <= 0) {
        G.state.enemies.slice().forEach(enemy => {
          if (G.distance(puddle, enemy) < puddle.radius + enemy.radius * 0.4) {
            G.damageEnemy(enemy, puddle.damage * 0.25, '#91ff74');
          }
        });
        puddle.tickTimer = 0.25;
      }
    });

    G.state.puddles = G.state.puddles.filter(puddle => puddle.lifetime > 0);
  };

  G.updateGems = function updateGems(deltaTime) {
    const player = G.state.player;

    G.state.gems.forEach(gem => {
      gem.pulse += deltaTime * 5;
      let distance = G.distance(gem, player);

      if (distance < 150) {
        const angle = G.angleTo(gem, player);
        const speed = 120 + (150 - distance) * 5;
        gem.x += Math.cos(angle) * speed * deltaTime;
        gem.y += Math.sin(angle) * speed * deltaTime;
        distance = G.distance(gem, player);
      }

      if (distance < gem.radius + player.radius + 6) {
        gem.collected = true;
        G.gainExperience(gem.value);
      }
    });

    G.state.gems = G.state.gems.filter(gem => !gem.collected);
  };

  G.updateEffects = function updateEffects(deltaTime) {
    const state = G.state;
    const addedEffects = [];

    state.effects.forEach(effect => {
      effect.lifetime -= deltaTime;

      if (effect.type === 'ring') {
        effect.radius += (effect.maxRadius - effect.radius) * Math.min(1, deltaTime * 13);
      }

      if (effect.type === 'meteor' && effect.lifetime <= 0 && !effect.exploded) {
        effect.exploded = true;
        const explosionRadius = 70 + effect.level * 9;

        state.enemies.slice().forEach(enemy => {
          if (G.distance(effect, enemy) < explosionRadius + enemy.radius) {
            G.damageEnemy(enemy, 30 + effect.level * 13, '#ff8a71');
          }
        });

        addedEffects.push({
          type: 'burst',
          x: effect.x,
          y: effect.y,
          radius: explosionRadius,
          lifetime: 0.5,
          maxLifetime: 0.5,
          colour: '#ff8a71'
        });
        state.shake = 14;
      }
    });

    state.effects = state.effects.filter(effect => (
      effect.lifetime > 0 || (effect.type === 'meteor' && !effect.exploded)
    ));
    state.effects.push(...addedEffects);

    state.damageNumbers.forEach(number => {
      number.lifetime -= deltaTime;
      number.y -= 34 * deltaTime;
    });
    state.damageNumbers = state.damageNumbers.filter(number => number.lifetime > 0);

    state.shake = Math.max(0, state.shake - 35 * deltaTime);
    state.damageFlash = Math.max(0, state.damageFlash - deltaTime);
  };

  G.updateGame = function updateGame(deltaTime) {
    G.state.time += deltaTime;
    G.updateSpawner(deltaTime);
    G.updateMovement(deltaTime);
    G.updatePowers(deltaTime);
    G.updateEnemies(deltaTime);
    G.updateProjectiles(deltaTime);
    G.updateOrbitingPints();
    G.updatePuddles(deltaTime);
    G.updateGems(deltaTime);
    G.updateEffects(deltaTime);
    G.updateHud();
  };
})(window.TaviGame);
