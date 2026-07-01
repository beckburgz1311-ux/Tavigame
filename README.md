# Tavi's Last Round

A fast browser-based arena roguelite inspired by the wave-survival structure of games such as *Brotato*.

## Play

Open `index.html` in a modern browser. No installation or build step is required.

### Controls

- **WASD / Arrow keys:** move
- **P / Escape:** pause
- Attacks and powers activate automatically
- Touch controls appear on smaller screens

## Core loop

- Start every run with the Tavi Blaster, then survive increasingly difficult timed waves.
- Defeated enemies drop experience gems.
- Every level-up offers four random choices from a pool of ten powers.
- A run can hold no more than four different powers.
- Once all four slots are occupied, level-up choices only upgrade owned powers.
- Bosses appear every fifth wave.
- Rerolls are earned during longer runs.

## Power pool

1. Tavi Blaster
2. Orbiting Pints
3. Chain Lightning
4. Last Orders
5. Blade Fan
6. Toxic Trail
7. Bouncer Shield
8. Barstool Meteor
9. Little Kev
10. Hair of the Dog

## Extra systems included

- Multiple enemy archetypes, including runners, tanks and splitters
- Boss waves
- Automatic targeting
- Health recovery between waves
- Shield blocking and damage reduction
- Lifesteal-style healing
- Responsive desktop and touch controls
- Pause, restart and run statistics

## Project structure

- `index.html` – game UI and modal screens
- `styles.css` – responsive presentation
- `game.js` – gameplay, rendering, powers, enemies and progression
