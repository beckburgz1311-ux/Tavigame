'use strict';

(function initialisePowers(G) {
  function nearestEnemy(origin = G.state.player) {
    let nearest = null;
    let bestDistance = Infinity;

    G.state.enemies.forEach(enemy => {
      const distance = G.distance(origin, enemy);
      if (distance < bestDistance) {
        bestDistance = distance;
        nearest = enemy;
      }
    });

    return nearest;
  }

  function largestEnemyCluster() {
    let bestEnemy = null;
    let bestCount = -1;

    G.state.enemies.forEach(enemy => {
      const nearbyCount = G.state.enemies.filter(other => G.distance(enemy, other) < 135).length;
      if (nearbyCount > bestCount) {
        bestCount = nearbyCount;
        bestEnemy = enemy;
      }
    });

    return bestEnemy;
  }

  G.fireShot = function fireShot(x, y, angle, speed, damage, colour, radius = 5, pierce = 0) {
    G.state.shots.push({
      x,
      y,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed,
      damage,
      colour,
      radius,
      lifetime: 2,
      pierce,
      hitEnemies: new Set()
    });
  };

  function fireChainLightning(firstEnemy, level) {
    const hitEnemies = [];
    let target = firstEnemy;

    for (let jump = 0; jump < Math.min(6, level + 2) && target; jump += 1) {
      hitEnemies.push(target);
      G.damageEnemy(target, 12 + level * 6, '#e2c7ff');

      const previousTarget = target;
      target = G.state.enemies
        .filter(enemy => !hitEnemies.includes(enemy) && G.distance(previousTarget, enemy) < 190)
        .sort((a, b) => G.distance(previousTarget, a) - G.distance(previousTarget, b))[0];
    }

    G.state.effects.push({
      type: 'line',
      points: [
        { x: G.state.player.x, y: G.state.player.y },
        ...hitEnemies.map(enemy => ({ x: enemy.x, y: enemy.y }))
      ],
      lifetime: 0.16,
      maxLifetime: 0.16
    });
  }

  G.getDronePosition = function getDronePosition() {
    const angle = G.state.time * 1.8;
    return {
      x: G.state.player.x + Math.cos(angle) * 58,
      y: G.state.player.y + Math.sin(angle) * 58
    };
  };

  G.updatePowers = function updatePowers(deltaTime) {
    const state = G.state;
    const player = state.player;
    const timers = player.timers;
    const timedPowers = ['blaster', 'lightning', 'frost', 'fan', 'meteor', 'drone'];

    timedPowers.forEach(id => {
      timers[id] = (timers[id] || 0) - deltaTime;
    });

    const target = nearestEnemy();

    const blasterLevel = G.powerLevel('blaster');
    if (blasterLevel && target && timers.blaster <= 0) {
      G.fireShot(player.x, player.y, G.angleTo(player, target), 580, 7 + blasterLevel * 3.4, '#78d8ff');
      timers.blaster = Math.max(0.16, 0.65 - blasterLevel * 0.055);
    }

    const lightningLevel = G.powerLevel('lightning');
    if (lightningLevel && target && timers.lightning <= 0) {
      fireChainLightning(target, lightningLevel);
      timers.lightning = Math.max(0.8, 2.7 - lightningLevel * 0.24);
    }

    const frostLevel = G.powerLevel('frost');
    if (frostLevel && timers.frost <= 0) {
      const radius = 125 + frostLevel * 16;
      state.effects.push({ type: 'ring', x: player.x, y: player.y, radius: 5, maxRadius: radius, lifetime: 0.48, maxLifetime: 0.48, colour: '#9ce9ff' });

      state.enemies.slice().forEach(enemy => {
        if (G.distance(player, enemy) <= radius) {
          G.damageEnemy(enemy, 10 + frostLevel * 7, '#b8f1ff');
          enemy.slowAmount = 0.35 + frostLevel * 0.055;
          enemy.slowTime = 2.2 + frostLevel * 0.25;
        }
      });

      timers.frost = Math.max(2.4, 6.2 - frostLevel * 0.55);
    }

    const fanLevel = G.powerLevel('fan');
    if (fanLevel && target && timers.fan <= 0) {
      const bladeCount = 3 + Math.min(6, fanLevel);
      const centreAngle = G.angleTo(player, target);

      for (let blade = 0; blade < bladeCount; blade += 1) {
        const spread = (blade - (bladeCount - 1) / 2) * 0.12;
        G.fireShot(player.x, player.y, centreAngle + spread, 460, 8 + fanLevel * 3, '#ff9e80', 6, 1 + Math.floor(fanLevel / 3));
      }

      timers.fan = Math.max(0.72, 2.15 - fanLevel * 0.17);
    }

    const meteorLevel = G.powerLevel('meteor');
    if (meteorLevel && state.enemies.length > 0 && timers.meteor <= 0) {
      const cluster = largestEnemyCluster();
      state.effects.push({ type: 'meteor', x: cluster.x, y: cluster.y, radius: 35 + meteorLevel * 4, lifetime: 0.72, maxLifetime: 0.72, level: meteorLevel, exploded: false });
      timers.meteor = Math.max(1.8, 5.4 - meteorLevel * 0.42);
    }

    const droneLevel = G.powerLevel('drone');
    if (droneLevel && target && timers.drone <= 0) {
      const drone = G.getDronePosition();
      G.fireShot(drone.x, drone.y, G.angleTo(drone, target), 650, 6 + droneLevel * 4, '#77ffd7', 4);
      timers.drone = Math.max(0.28, 1.05 - droneLevel * 0.1);
    }
  };

  G.updateProjectiles = function updateProjectiles(deltaTime) {
    G.state.shots.forEach(shot => {
      shot.x += shot.velocityX * deltaTime;
      shot.y += shot.velocityY * deltaTime;
      shot.lifetime -= deltaTime;

      G.state.enemies.slice().forEach(enemy => {
        if (shot.lifetime <= 0 || shot.hitEnemies.has(enemy.id)) return;

        if (G.distance(shot, enemy) < shot.radius + enemy.radius) {
          shot.hitEnemies.add(enemy.id);
          G.damageEnemy(enemy, shot.damage, shot.colour);

          if (shot.pierce > 0) shot.pierce -= 1;
          else shot.lifetime = 0;
        }
      });
    });

    G.state.shots = G.state.shots.filter(shot => (
      shot.lifetime > 0 && shot.x > -80 && shot.x < 1360 && shot.y > -80 && shot.y < 800
    ));
  };

  G.updateOrbitingPints = function updateOrbitingPints() {
    const level = G.powerLevel('orbit');
    if (!level) return;

    const pintCount = Math.min(6, level + 1);
    const orbitRadius = 52 + level * 4;

    for (let pint = 0; pint < pintCount; pint += 1) {
      const angle = G.state.time * (1.55 + level * 0.08) + pint / pintCount * G.TAU;
      const orbitingPint = {
        x: G.state.player.x + Math.cos(angle) * orbitRadius,
        y: G.state.player.y + Math.sin(angle) * orbitRadius,
        radius: 10
      };

      G.state.enemies.slice().forEach(enemy => {
        const nextHitTime = enemy.orbitCooldowns.get(pint) || 0;
        if (G.state.time < nextHitTime) return;

        if (G.distance(orbitingPint, enemy) < orbitingPint.radius + enemy.radius) {
          G.damageEnemy(enemy, 6 + level * 4, '#ffd36b');
          enemy.orbitCooldowns.set(pint, G.state.time + 0.38);
        }
      });
    }
  };
})(window.TaviGame);
