# Grid PWA

Responsywna strona CSS Grid z obszarami a–f.

## GitHub Pages

Prześlij zawartość tego katalogu (nie sam folder) do katalogu głównego gałęzi `main` repozytorium `grid-pwa`. Włącz w Settings > Pages: Deploy from a branch, main, /(root).

Adres: https://krzysztof-suchocki.github.io/grid-pwa/

`index.html` odwołuje się do `manifest.json`, `style.css` i `app.js`. `app.js` rejestruje `service-worker.js`. Skrypt Service Worker zapisuje do pamięci podręcznej także `app.js` i obrazy ikon.

PWA testuj przez HTTPS albo localhost, nie przez file://.
