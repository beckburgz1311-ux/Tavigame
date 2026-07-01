'use strict';

(function initialiseTouchControls(G) {
  const controls = document.getElementById('mobileControls');
  const arena = document.querySelector('.arena-wrap');
  const isTouchDevice = navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;

  G.touchMovement = { x: 0, y: 0 };
  if (!controls || !isTouchDevice) return;

  document.documentElement.classList.add('touch-device');
  controls.innerHTML = '<div class="joystick-base" aria-label="Drag to move"><div class="joystick-knob"></div></div>';

  const base = controls.querySelector('.joystick-base');
  const knob = controls.querySelector('.joystick-knob');
  let activePointer = null;

  const style = document.createElement('style');
  style.textContent = `
    .touch-device body,
    .touch-device .arena-wrap,
    .touch-device .mobile-controls {
      -webkit-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
    }
    .touch-device .arena-wrap,
    .touch-device #gameCanvas,
    .touch-device .mobile-controls,
    .touch-device .joystick-base,
    .touch-device .joystick-knob {
      touch-action: none;
    }
    .touch-device .mobile-controls {
      display: block;
      position: absolute;
      left: 16px;
      bottom: 16px;
      width: 154px;
      height: 154px;
      z-index: 10;
    }
    .joystick-base {
      position: relative;
      width: 100%;
      height: 100%;
      border: 3px solid rgba(255,255,255,.3);
      border-radius: 50%;
      background: rgba(5,9,20,.62);
      box-shadow: inset 0 0 30px rgba(0,0,0,.35), 0 8px 28px rgba(0,0,0,.35);
    }
    .joystick-knob {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 66px;
      height: 66px;
      margin-left: -33px;
      margin-top: -33px;
      border: 3px solid rgba(255,255,255,.4);
      border-radius: 50%;
      background: rgba(141,255,189,.82);
      box-shadow: 0 5px 18px rgba(0,0,0,.4);
      pointer-events: none;
      transform: translate(0,0);
    }
    @media (orientation: landscape) and (max-height: 560px) {
      .touch-device .mobile-controls {
        width: 132px;
        height: 132px;
        left: 10px;
        bottom: 10px;
      }
      .joystick-knob {
        width: 58px;
        height: 58px;
        margin-left: -29px;
        margin-top: -29px;
      }
    }
  `;
  document.head.appendChild(style);

  function updateStick(event) {
    const rect = base.getBoundingClientRect();
    const centreX = rect.left + rect.width / 2;
    const centreY = rect.top + rect.height / 2;
    const maximum = rect.width * 0.29;
    const rawX = event.clientX - centreX;
    const rawY = event.clientY - centreY;
    const distance = Math.hypot(rawX, rawY);
    const scale = distance > maximum ? maximum / distance : 1;
    const x = rawX * scale;
    const y = rawY * scale;

    knob.style.transform = `translate(${x}px, ${y}px)`;
    G.touchMovement.x = x / maximum;
    G.touchMovement.y = y / maximum;
  }

  function releaseStick(event) {
    if (activePointer !== null && event.pointerId !== activePointer) return;
    activePointer = null;
    G.touchMovement.x = 0;
    G.touchMovement.y = 0;
    knob.style.transform = 'translate(0,0)';
  }

  base.addEventListener('pointerdown', event => {
    event.preventDefault();
    activePointer = event.pointerId;
    base.setPointerCapture(event.pointerId);
    updateStick(event);
  });

  base.addEventListener('pointermove', event => {
    if (event.pointerId !== activePointer) return;
    event.preventDefault();
    updateStick(event);
  });

  base.addEventListener('pointerup', releaseStick);
  base.addEventListener('pointercancel', releaseStick);
  base.addEventListener('lostpointercapture', releaseStick);

  controls.addEventListener('contextmenu', event => event.preventDefault());
  controls.addEventListener('selectstart', event => event.preventDefault());
  arena.addEventListener('selectstart', event => event.preventDefault());
})(window.TaviGame);
