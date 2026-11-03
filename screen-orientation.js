'use strict';

const orientationLabel = document.getElementById('orientationLabel');
const orientationType = document.getElementById('orientationType');
const orientationAngle = document.getElementById('orientationAngle');
const viewportWidth = document.getElementById('viewportWidth');
const viewportHeight = document.getElementById('viewportHeight');
const orientationSource = document.getElementById('orientationSource');
const changeCount = document.getElementById('changeCount');
const portraitQuery = window.matchMedia('(orientation: portrait)');

let previousMode = null;
let changes = 0;

function updateOrientation() {
  // Nowoczesne Screen Orientation API, jeśli przeglądarka je obsługuje.
  const apiType = screen.orientation && typeof screen.orientation.type === 'string'
    ? screen.orientation.type
    : null;

  // Fallback działa również w Safari na iPhonie (bez osobnych uprawnień).
  const mode = apiType?.startsWith('portrait')
    ? 'portrait'
    : apiType?.startsWith('landscape')
      ? 'landscape'
      : (portraitQuery.matches ? 'portrait' : 'landscape');

  if (previousMode !== null && previousMode !== mode) {
    changes += 1;
  }
  previousMode = mode;

  document.documentElement.dataset.orientation = mode;
  orientationLabel.textContent = mode === 'portrait' ? 'PORTRAIT – pionowo' : 'LANDSCAPE – poziomo';
  orientationType.textContent = apiType || mode;
  orientationAngle.textContent = Number.isFinite(screen.orientation?.angle)
    ? `${screen.orientation.angle}°`
    : 'Niedostępny';
  viewportWidth.textContent = `${window.innerWidth} px`;
  viewportHeight.textContent = `${window.innerHeight} px`;
  orientationSource.textContent = apiType ? 'Screen Orientation API' : 'Media query (fallback)';
  changeCount.textContent = String(changes);
}

// Aktualizacja po obrocie ekranu i zmianie wymiarów okna.
if (screen.orientation?.addEventListener) {
  screen.orientation.addEventListener('change', updateOrientation);
}
if (portraitQuery.addEventListener) {
  portraitQuery.addEventListener('change', updateOrientation);
} else if (portraitQuery.addListener) {
  portraitQuery.addListener(updateOrientation); // starsze Safari
}
window.addEventListener('resize', updateOrientation);
window.addEventListener('pageshow', updateOrientation);
updateOrientation();
