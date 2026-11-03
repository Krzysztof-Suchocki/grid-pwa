'use strict';

// Device Motion API — pomiar przyspieszenia X/Y/Z i prędkości obrotu.
// Na iOS prośba o uprawnienia musi być bezpośrednio wywołana z kliknięcia.
const $ = (id) => document.getElementById(id);
const startButton = $('start');
const stopButton = $('stop');
const message = $('message');
let listening = false;
let receivedData = false;
let eventCount = 0;
let lastRender = 0;
let noDataTimer = null;

function status(text, state = '') {
  $('status').textContent = text;
  $('status-dot').className = `status-dot ${state}`.trim();
}

function showMessage(text) {
  message.textContent = text;
  message.hidden = false;
}

function clearMessage() {
  message.textContent = '';
  message.hidden = true;
}

const hasNumber = (n) => typeof n === 'number' && Number.isFinite(n);

function showNumber(id, value, decimals = 2) {
  $(id).textContent = hasNumber(value) ? value.toFixed(decimals) : '—';
}

function showBar(id, value) {
  const bar = $(id);
  if (!hasNumber(value)) {
    bar.style.width = '0%';
    bar.style.left = '50%';
    return;
  }
  // Skala wizualna ±15 m/s²; wartości ponad zakres nie są obcinane w liczbach.
  const fraction = Math.min(Math.abs(value) / 15, 1);
  bar.style.width = `${fraction * 50}%`;
  bar.style.left = value >= 0 ? '50%' : `${50 - fraction * 50}%`;
}

function hasAxes(object) {
  return object && ['x', 'y', 'z'].some((key) => hasNumber(object[key]));
}

function hasRotation(object) {
  return object && ['alpha', 'beta', 'gamma'].some((key) => hasNumber(object[key]));
}

function onMotion(event) {
  const acceleration = event.acceleration;
  const withGravity = event.accelerationIncludingGravity;
  const rotation = event.rotationRate;

  if (!hasAxes(acceleration) && !hasAxes(withGravity) && !hasRotation(rotation)) {
    return;
  }

  eventCount += 1;
  if (!receivedData) {
    receivedData = true;
    window.clearTimeout(noDataTimer);
    status('Odczyt danych z czujników aktywny', 'active');
  }

  // Nie odświeżaj DOM kilkadziesiąt razy na sekundę.
  const now = performance.now();
  if (now - lastRender < 100) return;
  lastRender = now;

  showNumber('ax', acceleration?.x);
  showNumber('ay', acceleration?.y);
  showNumber('az', acceleration?.z);
  showBar('bar-ax', acceleration?.x);
  showBar('bar-ay', acceleration?.y);
  showBar('bar-az', acceleration?.z);

  showNumber('gx', withGravity?.x);
  showNumber('gy', withGravity?.y);
  showNumber('gz', withGravity?.z);

  // rotationRate: beta dotyczy osi X, gamma — Y, alpha — Z.
  showNumber('rx', rotation?.beta, 1);
  showNumber('ry', rotation?.gamma, 1);
  showNumber('rz', rotation?.alpha, 1);

  $('last-update').textContent = new Date().toLocaleTimeString('pl-PL');
  $('interval').textContent = hasNumber(event.interval) ? `${event.interval.toFixed(1)} ms` : '—';
  $('count').textContent = String(eventCount);
}

async function startMotion() {
  if (listening) return;
  clearMessage();

  if (!window.isSecureContext) {
    status('Wymagane HTTPS', 'error');
    showMessage('Otwórz tę stronę przez HTTPS, np. na GitHub Pages. Odczyt z czujników nie działa w zwykłym, niezabezpieczonym HTTP.');
    return;
  }

  if (!('DeviceMotionEvent' in window)) {
    status('Brak obsługi Device Motion API', 'error');
    showMessage('Ta przeglądarka lub urządzenie nie udostępnia Device Motion API. Otwórz stronę bezpośrednio w Safari na telefonie.');
    return;
  }

  startButton.disabled = true;
  status('Oczekiwanie na zgodę i odczyt…', 'warning');

  try {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      // Uwaga: poniższa metoda musi być wywołana bez opóźnienia w reakcji na kliknięcie.
      const permission = await DeviceMotionEvent.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Nie przyznano zgody na dostęp do czujników ruchu. Sprawdź uprawnienia witryny w Safari.');
      }
    }

    receivedData = false;
    eventCount = 0;
    lastRender = 0;
    $('count').textContent = '0';
    window.addEventListener('devicemotion', onMotion);
    listening = true;
    stopButton.disabled = false;
    noDataTimer = window.setTimeout(() => {
      if (!listening || receivedData) return;
      status('Brak danych z czujników', 'warning');
      showMessage('Zgoda została udzielona lub nie była wymagana, ale przeglądarka nie przesyła odczytów. Sprawdź, czy strona jest otwarta bezpośrednio w Safari, czy czujniki nie są zablokowane i czy telefon jest odblokowany.');
    }, 8000);
  } catch (error) {
    status('Nie udało się uruchomić czujników', 'error');
    showMessage(error instanceof Error ? error.message : 'Wystąpił nieznany błąd.');
    console.error('Device Motion:', error);
    startButton.disabled = false;
  }
}

function stopMotion() {
  window.removeEventListener('devicemotion', onMotion);
  window.clearTimeout(noDataTimer);
  listening = false;
  startButton.disabled = false;
  stopButton.disabled = true;
  clearMessage();
  status('Pomiar zatrzymany');
}

$('environment').textContent = window.isSecureContext ? 'HTTPS / bezpieczny kontekst' : 'Niezabezpieczony kontekst';
startButton.addEventListener('click', startMotion);
stopButton.addEventListener('click', stopMotion);
window.addEventListener('pagehide', () => {
  if (listening) stopMotion();
});
