// Pobieranie danych JSON opublikowanych na GitHub Pages.
const wynik = document.querySelector('#wynik');
const status = document.querySelector('#status');
const przycisk = document.querySelector('#odswiez');

async function pobierzDane() {
  status.textContent = 'Pobieranie pliku dane.json…';
  wynik.textContent = '';
  przycisk.disabled = true;

  try {
    const odpowiedz = await fetch('./dane.json', { cache: 'no-store' });

    if (!odpowiedz.ok) {
      throw new Error(`Błąd HTTP ${odpowiedz.status}`);
    }

    const dane = await odpowiedz.json();
    if (typeof dane.tekst !== 'string') {
      throw new Error('W pliku dane.json brakuje pola "tekst".');
    }

    wynik.textContent = dane.tekst;
    status.textContent = 'Dane pobrane poprawnie.';
  } catch (blad) {
    status.textContent = `Nie udało się pobrać danych: ${blad.message}`;
    console.error('Fetch API:', blad);
  } finally {
    przycisk.disabled = false;
  }
}

przycisk.addEventListener('click', pobierzDane);
pobierzDane();
