'use strict';

(function loadGameData(G) {
  G.POWERS = [
    { id: 'blaster', icon: '💥', name: 'Tavi Blaster', description: 'Automatically fires at the nearest enemy.', upgrade: level => `Faster shots and ${10 + level * 4} damage.`, maxLevel: 8 },
    { id: 'orbit', icon: '🌀', name: 'Orbiting Pints', description: 'Pints circle Tavi and batter nearby enemies.', upgrade: level => `${Math.min(6, level + 1)} stronger orbiting pints.`, maxLevel: 6 },
    { id: 'lightning', icon: '⚡', name: 'Chain Lightning', description: 'Lightning jumps through groups of enemies.', upgrade: level => `More damage and up to ${Math.min(6, level + 2)} targets.`, maxLevel: 7 },
    { id: 'frost', icon: '❄️', name: 'Last Orders', description: 'A freezing shockwave damages and slows enemies.', upgrade: () => 'Bigger blast, heavier slow and lower cooldown.', maxLevel: 6 },
    { id: 'fan', icon: '🗡️', name: 'Blade Fan', description: 'Launches a spread of piercing blades.', upgrade: level => `${3 + Math.min(6, level)} blades with better piercing.`, maxLevel: 7 },
    { id: 'poison', icon: '☠️', name: 'Toxic Trail', description: 'Leaves damaging puddles while moving.', upgrade: () => 'Bigger, stronger and longer-lasting puddles.', maxLevel: 6 },
    { id: 'shield', icon: '🛡️', name: 'Bouncer Shield', description: 'Reduces damage and periodically blocks a hit.', upgrade: level => `More protection; block recharges in ${Math.max(3, 9 - level)}s.`, maxLevel: 6 },
    { id: 'meteor', icon: '☄️', name: 'Barstool Meteor', description: 'Drops explosive barstools into enemy crowds.', upgrade: () => 'Bigger explosions, more damage and faster drops.', maxLevel: 7 },
    { id: 'drone', icon: '🤖', name: 'Little Kev', description: 'A loyal drone circles Tavi and fires independently.', upgrade: () => 'Faster drone fire with stronger rounds.', maxLevel: 6 },
    { id: 'vampire', icon: '🩸', name: 'Hair of the Dog', description: 'Kills occasionally restore health.', upgrade: level => `Higher heal chance and +${level + 2} health per proc.`, maxLevel: 5 }
  ];

  G.ENEMY_TYPES = {
    grunt: { radius: 15, speed: 72, health: 24, damage: 10, xp: 3, colour: '#ff687f' },
    runner: { radius: 11, speed: 124, health: 16, damage: 8, xp: 3, colour: '#ffb56b' },
    tank: { radius: 23, speed: 45, health: 72, damage: 18, xp: 7, colour: '#b777ff' },
    splitter: { radius: 17, speed: 62, health: 44, damage: 12, xp: 6, colour: '#66e0b5' },
    boss: { radius: 42, speed: 40, health: 540, damage: 28, xp: 45, colour: '#ffe26b' }
  };
})(window.TaviGame);
