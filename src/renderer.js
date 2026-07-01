'use strict';

(function initialiseRenderer(G) {
  const ctx = G.ctx;

  function drawBackground() {
    const gradient = ctx.createRadialGradient(640, 360, 40, 640, 360, 900);
    gradient.addColorStop(0, '#131d39');
    gradient.addColorStop(1, '#070b17');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1280, 720);

    ctx.strokeStyle = 'rgba(255,255,255,0.035)';
    for (let x = 0; x < 1280; x += 52) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 720);
      ctx.stroke();
    }
    for (let y = 0; y < 720; y += 52) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1280, y);
      ctx.stroke();
    }

    ctx.fillStyle = G.state.wave % 5 === 0 ? '#ffd36b' : '#8dffbd';
    ctx.fillRect(0, 0, 1280 * G.state.waveTime / G.state.waveLength, 5);
  }

  function drawEnemy(enemy) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.shadowBlur = enemy.type === 'boss' ? 22 : 10;
    ctx.shadowColor = enemy.colour;
    ctx.fillStyle = enemy.hitTime > 0 ? '#ffffff' : enemy.colour;
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius, 0, G.TAU);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(5,8,17,0.65)';
    ctx.beginPath();
    ctx.arc(-enemy.radius * 0.3, -enemy.radius * 0.12, Math.max(2, enemy.radius * 0.1), 0, G.TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(enemy.radius * 0.3, -enemy.radius * 0.12, Math.max(2, enemy.radius * 0.1), 0, G.TAU);
    ctx.fill();
    ctx.restore();

    if (enemy.health < enemy.maxHealth) {
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(enemy.x - enemy.radius, enemy.y - enemy.radius - 10, enemy.radius * 2, 4);
      ctx.fillStyle = '#8dffbd';
      ctx.fillRect(
        enemy.x - enemy.radius,
        enemy.y - enemy.radius - 10,
        enemy.radius * 2 * G.clamp(enemy.health / enemy.maxHealth, 0, 1),
        4
      );
    }
  }

  function drawPlayer() {
    const player = G.state.player;
    ctx.save();
    ctx.translate(player.x, player.y);

    if (player.invulnerableTime > 0 && Math.floor(player.invulnerableTime * 18) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    ctx.shadowBlur = 22;
    ctx.shadowColor = '#8dffbd';
    ctx.fillStyle = '#8dffbd';
    ctx.beginPath();
    ctx.arc(0, 0, player.radius, 0, G.TAU);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#071018';
    ctx.beginPath();
    ctx.arc(-6, -3, 2.5, 0, G.TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(6, -3, 2.5, 0, G.TAU);
    ctx.fill();

    ctx.lineWidth = 2.3;
    ctx.strokeStyle = '#071018';
    ctx.beginPath();
    ctx.arc(0, 2, 7, 0.2, Math.PI - 0.2);
    ctx.stroke();
    ctx.restore();

    if (G.powerLevel('shield') && player.shieldReady) {
      ctx.strokeStyle = 'rgba(255,228,164,0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius + 8 + Math.sin(G.state.time * 4) * 2, 0, G.TAU);
      ctx.stroke();
    }
  }

  function drawPowers() {
    const orbitLevel = G.powerLevel('orbit');
    if (orbitLevel) {
      const count = Math.min(6, orbitLevel + 1);
      const radius = 52 + orbitLevel * 4;
      for (let index = 0; index < count; index += 1) {
        const angle = G.state.time * (1.55 + orbitLevel * 0.08) + index / count * G.TAU;
        ctx.fillStyle = '#ffd36b';
        ctx.fillRect(
          G.state.player.x + Math.cos(angle) * radius - 8,
          G.state.player.y + Math.sin(angle) * radius - 11,
          16,
          22
        );
      }
    }

    if (G.powerLevel('drone')) {
      const drone = G.getDronePosition();
      ctx.fillStyle = '#77ffd7';
      ctx.beginPath();
      ctx.arc(drone.x, drone.y, 10, 0, G.TAU);
      ctx.fill();
    }
  }

  function drawEffects() {
    G.state.effects.forEach(effect => {
      const alpha = G.clamp(effect.lifetime / effect.maxLifetime, 0, 1);
      ctx.globalAlpha = alpha;

      if (effect.type === 'ring') {
        ctx.strokeStyle = effect.colour;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, G.TAU);
        ctx.stroke();
      }

      if (effect.type === 'burst') {
        ctx.globalAlpha = alpha * 0.55;
        ctx.fillStyle = effect.colour;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius * (1.3 - alpha * 0.3), 0, G.TAU);
        ctx.fill();
      }

      if (effect.type === 'line') {
        ctx.strokeStyle = '#e9d7ff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        effect.points.forEach((point, index) => {
          const x = point.x + G.random(-4, 4);
          const y = point.y + G.random(-4, 4);
          if (index === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      }

      if (effect.type === 'meteor') {
        const progress = 1 - effect.lifetime / effect.maxLifetime;
        ctx.globalAlpha = 0.35 + progress * 0.45;
        ctx.strokeStyle = '#ff7b78';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius * (1 - progress * 0.35), 0, G.TAU);
        ctx.stroke();
      }
    });
    ctx.globalAlpha = 1;
  }

  G.drawGame = function drawGame() {
    const shakeX = G.state.shake > 0 ? G.random(-G.state.shake, G.state.shake) : 0;
    const shakeY = G.state.shake > 0 ? G.random(-G.state.shake, G.state.shake) : 0;

    ctx.save();
    ctx.translate(shakeX, shakeY);
    drawBackground();

    G.state.puddles.forEach(puddle => {
      ctx.globalAlpha = Math.min(0.4, puddle.lifetime / 2);
      ctx.fillStyle = '#6cff72';
      ctx.beginPath();
      ctx.arc(puddle.x, puddle.y, puddle.radius, 0, G.TAU);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    G.state.gems.forEach(gem => {
      ctx.save();
      ctx.translate(gem.x, gem.y);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = '#72d9ff';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#63c9ff';
      const size = gem.radius + Math.sin(gem.pulse) * 1.5;
      ctx.fillRect(-size, -size, size * 2, size * 2);
      ctx.restore();
    });

    G.state.enemies.forEach(drawEnemy);

    G.state.shots.forEach(shot => {
      ctx.fillStyle = shot.colour;
      ctx.shadowBlur = 11;
      ctx.shadowColor = shot.colour;
      ctx.beginPath();
      ctx.arc(shot.x, shot.y, shot.radius, 0, G.TAU);
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    drawPowers();
    drawPlayer();
    drawEffects();

    G.state.damageNumbers.forEach(number => {
      ctx.globalAlpha = G.clamp(number.lifetime / 0.35, 0, 1);
      ctx.fillStyle = number.colour;
      ctx.font = 'bold 16px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(number.text, number.x, number.y);
    });
    ctx.globalAlpha = 1;
    ctx.restore();

    if (G.state.damageFlash > 0) {
      ctx.fillStyle = `rgba(255,70,100,${G.state.damageFlash * 0.9})`;
      ctx.fillRect(0, 0, 1280, 720);
    }

    if (G.state.paused && !G.state.choosingPower && !G.state.gameOver && G.state.running) {
      ctx.fillStyle = 'rgba(4,7,15,0.62)';
      ctx.fillRect(0, 0, 1280, 720);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 58px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', 640, 360);
    }
  };
})(window.TaviGame);
