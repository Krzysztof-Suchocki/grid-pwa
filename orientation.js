'use strict';

const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const statusElement = document.getElementById('status');
const dotElement = document.getElementById('dot');
const messageElement = document.getElementById('message');
const alphaElement = document.getElementById('alpha');
const betaElement = document.getElementById('beta');
const gammaElement = document.getElementById('gamma');
const lastUpdateElement = document.getElementById('last-update');
const phoneElement = document.getElementById('phone');

let listening = false;
let receivedData = false;
let noDataTimer = null;

function setStatus(message, type = 'idle') {
  statusElement.textContent = message;
  dotElement.className = `dot ${type === 'active' || type === 'error' ? type : ''}`;
}

function showMessage(text) {
  messageElement.textContent = text;
  messageElement.hidden = !text;
}

function displayAngle(value) {
  return Number.isFinite(value) ? `${value.toFixed(1)}°` : '—';
}

function handleOrientation(event) {
  if (!listening) return;
  const { alpha, beta, gamma } = event;
  if (![alpha, beta, gamma].some(Number.isFinite)) {
    // Niektóre przeglądarki emitują zdarzenia bez danych.
    return;
  }

  if (!receivedData) {
    receivedData = true;
    clearTimeout(noDataTimer);
    setStatus('Odczyt na żywo', 'active');
    showMessage('');
  }

  alphaElement.textContent = displayAngle(alpha);
  betaElement.textContent = displayAngle(beta);
  gammaElement.textContent = displayAngle(gamma);
  lastUpdateElement.textContent = `Ostatni odczyt: ${new Date().toLocaleTimeString('pl-PL')}`;

  // Demonstracyjna wizualizacja trzech kątów obrotu.
  const z = Number.isFinite(alpha) ? alpha : 0;
  const x = Number.isFinite(beta) ? beta : 0;
  const y = Number.isFinite(gamma) ? gamma : 0;
  phoneElement.style.transform = `rotateZ(${z}deg) rotateX(${x}deg) rotateY(${y}deg)`;
}

function stopListening() {
  window.removeEventListener('deviceorientation', handleOrientation);
  clearTimeout(noDataTimer);
  listening = false;
  receivedData = false;
  startButton.disabled = false;
  stopButton.disabled = true;
  setStatus('Pomiar zatrzymany');
}

async function startListening() {
  if (listening) return;
  showMessage('');

  if (!window.isSecureContext) {
    setStatus('Brak bezpiecznego połączenia', 'error');
    showMessage('Otwórz stronę przez HTTPS, np. na GitHub Pages.');
    return;
  }
  if (!('DeviceOrientationEvent' in window)) {
    setStatus('Brak obsługi Device Orientation API', 'error');
    showMessage('Ta przeglądarka lub urządzenie nie obsługuje wymaganych zdarzeń. Otwórz stronę na telefonie w Safari.');
    return;
  }

  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    try {
      const permission = await DeviceOrientationEvent.requestPermission();
      if (permission !== 'granted') {
        setStatus('Odmowa dostępu do czujników', 'error');
        showMessage('Zezwól stronie na dostęp do ruchu i orientacji urządzenia w ustawieniach Safari, a następnie spróbuj ponownie.');
        return;
      }
    } catch (error) {
      setStatus('Błąd uprawnień', 'error');
      showMessage(`Nie udało się uzyskać dostępu: ${error.message || String(error)}. Otwórz stronę bezpośrednio w Safari i ponów próbę.`);
      return;
    }
  }

  listening = true;
  receivedData = false;
  startButton.disabled = true;
  stopButton.disabled = false;
  setStatus('Oczekiwanie na odczyt…');
  window.addEventListener('deviceorientation', handleOrientation);
  noDataTimer = setTimeout(() => {
    if (listening && !receivedData) {
      setStatus('Brak danych z czujników', 'error');
      showMessage('Nie otrzymano kątów obrotu. Sprawdź uprawnienia przeglądarki i czy telefon obsługuje czujnik. Delikatnie obróć urządzenie.');
    }
  }, 8000);
}

startButton.addEventListener('click', startListening);
stopButton.addEventListener('click', () => {
  stopListening();
  showMessage('');
});
window.addEventListener('pagehide', () => {
  if (listening) stopListening();
});
