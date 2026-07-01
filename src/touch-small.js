'use strict';

(function initialiseSmallTouchControls(G) {
  const controls = document.getElementById('mobileControls');
  const arena = document.querySelector('.arena-wrap');
  const isTouchDevice = navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;

  G.touchMovement = { x: 0, y: 0 };
  if (!controls || !isTouchDevice) return;

  document.documentElement.classList.add('touch-device');
  controls.innerHTML = '<div class="joystick-base"><div class="joystick-knob"></div></div>';

  const base = controls.querySelector('.joystick-base');
  const knob = controls.querySelector('.joystick-knob');
  let activePointer = null;

  const style = document.createElement('style');
  style.textContent = `
    .touch-device body,
    .touch-device .arena-wrap,
    .touch-device .mobile-controls,
    .touch-device .mobile-controls * {
      -webkit-user-select: none !important;
      user-select: none !important;
      -webkit-touch-callout: none !important;
      touch-action: none !important;
      -webkit-tap-highlight-color: transparent;
    }
    .touch-device .mobile-controls {
      display: block;
      position: absolute;
      left: 8px;
      bottom: 8px;
      width: 104px;
      height: 104px;
      z-index: 10;
    }
    .touch-device .joystick-base {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 52px;
      height: 52px;
      border: 2px solid rgba(255,255,255,.3);
      border-radius: 50%;
      background: rgba(5,9,20,.62);
      box-shadow: inset 0 0 10px rgba(0,0,0,.35),0 3px 9px rgba(0,0,0,.35);
    }
    .touch-device .joystick-knob {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 22px;
      height: 22px;
      margin-left: -11px;
      margin-top: -11px;
      border: 1px solid rgba(255,255,255,.4);
      border-radius: 50%;
      background: rgba(141,255,189,.82);
      box-shadow: 0 2px 6px rgba(0,0,0,.4);
      pointer-events: none;
      transform: translate(0,0);
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

    knob.style.transform = `translate(${x}px,${y}px)`;
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

  controls.addEventListener('pointerdown', event => {
    event.preventDefault();
    activePointer = event.pointerId;
    controls.setPointerCapture(event.pointerId);
    updateStick(event);
  });

  controls.addEventListener('pointermove', event => {
    if (event.pointerId !== activePointer) return;
    event.preventDefault();
    updateStick(event);
  });

  controls.addEventListener('pointerup', releaseStick);
  controls.addEventListener('pointercancel', releaseStick);
  controls.addEventListener('lostpointercapture', releaseStick);
  controls.addEventListener('contextmenu', event => event.preventDefault());
  controls.addEventListener('selectstart', event => event.preventDefault());
  arena.addEventListener('selectstart', event => event.preventDefault());
})(window.TaviGame);
