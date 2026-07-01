'use strict';

window.TaviGame = window.TaviGame || {};

(function initialiseCore(G) {
  const canvas = document.getElementById('gameCanvas');

  G.canvas = canvas;
  G.ctx = canvas.getContext('2d');
  G.TAU = Math.PI * 2;
  G.keys = new Set();

  G.random = (min, max) => Math.random() * (max - min) + min;
  G.clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  G.distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  G.angleTo = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);

  G.createState = function createState() {
    return {
      running: false,
      paused: true,
      choosingPower: false,
      gameOver: false,
      time: 0,
      wave: 1,
      waveTime: 0,
      waveLength: 28,
      spawnTimer: 0,
      kills: 0,
      level: 1,
      xp: 0,
      xpNeeded: 12,
      rerolls: 1,
      pendingLevels: 0,
      shake: 0,
      damageFlash: 0,
      player: {
        x: 640,
        y: 360,
        radius: 18,
        speed: 235,
        health: 100,
        maxHealth: 100,
        invulnerableTime: 0,
        powers: new Map([['blaster', 1]]),
        timers: {},
        shieldReady: true,
        shieldTimer: 0
      },
      enemies: [],
      shots: [],
      gems: [],
      effects: [],
      puddles: [],
      damageNumbers: []
    };
  };

  G.state = G.createState();
})(window.TaviGame);
