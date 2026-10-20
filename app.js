
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./service-worker.js');

      console.log(
        'Grid PWA: Service Worker zarejestrowany.',
        registration.scope
      );
    } catch (error) {
      console.error(
        'Grid PWA: Nie udało się zarejestrować Service Workera.',
        error
      );
    }
  });
} else {
  console.warn('Service Worker nie jest obsługiwany.');
}
