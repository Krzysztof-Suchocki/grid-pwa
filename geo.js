const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const statusElement = document.getElementById('status');
const latitudeElement = document.getElementById('latitude');
const longitudeElement = document.getElementById('longitude');
const accuracyElement = document.getElementById('accuracy');
const updatedElement = document.getElementById('updated');

let watchId = null;

function showStatus(message, type = '') {
  statusElement.textContent = message;
  statusElement.className = `status ${type}`.trim();
}

function stopTracking() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
  startButton.disabled = false;
  stopButton.disabled = true;
}

function onPosition(position) {
  const { latitude, longitude, accuracy } = position.coords;
  latitudeElement.textContent = latitude.toFixed(6) + '°';
  longitudeElement.textContent = longitude.toFixed(6) + '°';
  accuracyElement.textContent = Math.round(accuracy) + ' m';
  updatedElement.textContent = new Date(position.timestamp).toLocaleTimeString('pl-PL');
  showStatus('Lokalizacja aktywna – aktualizacja po zmianie pozycji.', 'active');
}

function onError(error) {
  let message;
  switch (error.code) {
    case 1:
      message = 'Odmówiono dostępu do lokalizacji. Włącz uprawnienia lokalizacji w ustawieniach przeglądarki i telefonu.';
      stopTracking();
      break;
    case 2:
      message = 'Nie można ustalić położenia. Sprawdź, czy lokalizacja jest włączona i czy masz zasięg.';
      break;
    case 3:
      message = 'Upłynął czas oczekiwania na pozycję. Spróbuj na zewnątrz lub poczekaj na następny odczyt.';
      break;
    default:
      message = 'Nieoczekiwany błąd geolokalizacji.';
  }
  showStatus(message, 'error');
}

startButton.addEventListener('click', () => {
  if (!window.isSecureContext) {
    showStatus('Geolokalizacja wymaga bezpiecznego połączenia HTTPS (lub localhost). Otwórz stronę przez GitHub Pages.', 'error');
    return;
  }
  if (!('geolocation' in navigator)) {
    showStatus('Ta przeglądarka nie obsługuje geolokalizacji.', 'error');
    return;
  }
  if (watchId !== null) return;

  showStatus('Oczekiwanie na zgodę i pierwszy odczyt lokalizacji…');
  startButton.disabled = true;
  stopButton.disabled = false;

  try {
    watchId = navigator.geolocation.watchPosition(onPosition, onError, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 20000
    });
  } catch (error) {
    stopTracking();
    showStatus('Nie można uruchomić geolokalizacji: ' + error.message, 'error');
  }
});

stopButton.addEventListener('click', () => {
  stopTracking();
  showStatus('Lokalizacja zatrzymana. Widoczne są ostatnio odebrane współrzędne.');
});

window.addEventListener('pagehide', stopTracking);
