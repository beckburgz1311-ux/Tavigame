'use strict';

const packages = [
  'src/core.js',
  'src/data.js',
  'src/progression.js',
  'src/ui.js',
  'src/enemies.js',
  'src/powers.js',
  'src/world.js',
  'src/renderer.js',
  'src/main.js'
];

function loadPackage(index) {
  if (index >= packages.length) return;

  const script = document.createElement('script');
  script.src = packages[index];
  script.async = false;
  script.onload = () => loadPackage(index + 1);
  script.onerror = () => {
    const message = `Could not load ${packages[index]}`;
    console.error(message);
    document.body.insertAdjacentHTML('beforeend', `<pre class="load-error">${message}</pre>`);
  };

  document.body.appendChild(script);
}

loadPackage(0);
