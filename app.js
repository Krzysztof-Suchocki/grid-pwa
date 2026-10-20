// Grid PWA: rejestracja Service Workera.
// Sciezka wzgledna dziala rowniez na GitHub Pages pod /grid-pwa/.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./service-worker.js');
      console.log('Grid PWA: Service Worker zarejestrowany.', registration.scope);
    } catch (error) {
      console.error('Grid PWA: Nie udalo sie zarejestrowac Service Workera.', error);
    }
  });
} else {
  console.warn('Grid PWA: Ta przegladarka lub tryb uruchomienia nie obsluguje Service Workera. Uzyj HTTPS albo localhost.');
}
