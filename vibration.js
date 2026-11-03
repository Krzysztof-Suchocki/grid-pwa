'use strict';

const przycisk = document.getElementById('wibruj');
const status = document.getElementById('status');

przycisk.addEventListener('click', () => {
  // Wibration API wymaga interakcji użytkownika; wywołujemy je bezpośrednio po kliknięciu.
  if (typeof navigator.vibrate !== 'function') {
    status.textContent = 'Ta przeglądarka nie obsługuje Vibration API. Na iPhonie funkcja nie jest oficjalnie dostępna.';
    return;
  }

  try {
    const rozpoczęto = navigator.vibrate(1000); // 1000 ms = 1 sekunda

    if (rozpoczęto) {
      status.textContent = 'Wysłano żądanie wibracji na 1 sekundę.';
    } else {
      status.textContent = 'Przeglądarka nie uruchomiła wibracji (np. z powodu ustawień urządzenia).';
    }
  } catch (error) {
    console.error('Błąd Vibration API:', error);
    status.textContent = 'Nie można uruchomić wibracji: ' + error.message;
  }
});
