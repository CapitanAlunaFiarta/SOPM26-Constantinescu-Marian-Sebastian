# CINEMA NIII7 — Brașov

Site de rezervări pentru un cinema (IMAX, 4DX, VIP Lounge) făcut pentru laboratorul SOPM
(lucru colaborativ cu Git + folosirea unor API-uri externe). Este o aplicație **statică**:
HTML + CSS + JavaScript, fără backend și fără build.

## Cum rulezi proiectul

Varianta rapidă: deschide `index.html` în browser.

Recomandat (pentru ca trailerele, QR-ul și `validare.html` să funcționeze corect):

```bash
python -m http.server 8000
# apoi deschide http://localhost:8000
```

## Ce poate face

- program filme cu filtre (gen, sală, oră, căutare) și afiș + trailer pe pagina filmului
- rezervare locuri pe hartă (preț pe rând + supliment 4DX/VIP), cu „AI Sweet-Spot" și selecție de la tastatură
- locuri ocupate **stabile per proiecție** (film + dată + oră + sală), iar locurile cumpărate rămân ocupate după reîncărcare
- snacks, coduri promoționale, plată simulată cu validare (email, nume, card, expirare, CVV)
- bilet cu QR unic, descărcabil ca PNG; QR-ul duce la `validare.html`
- adăugare în **Google Calendar** sau fișier **.ics** (cu alarmă cu 1h înainte) și reminder prin notificări
- mod **dark / light** (se reține în browser)
- pagini de experiență: comparator IMAX + test audio (Web Audio), simulator 4DX, simulator fotoliu VIP
- **Roata Norocului** și panou de **admin** (`Ctrl+Shift+A`) cu încasări și reset de date demo

## API-uri folosite

| API | Pentru ce |
| --- | --- |
| [Open-Meteo](https://open-meteo.com/) | temperatura live în Brașov |
| [WorldTimeAPI](https://worldtimeapi.org/) | data curentă și datele de proiecție |
| [ExchangeRate API](https://open.er-api.com/) | conversie RON / EUR / USD |
| [Wikipedia REST](https://en.wikipedia.org/api/rest_v1/) | descriere live a filmului |
| [QRServer](https://goqr.me/api/) | generare cod QR pentru bilet |
| Web Audio, Notification, Speech Synthesis | test audio IMAX, remindere, confirmare vocală |

Dacă un API nu răspunde în 4 secunde, site-ul folosește valori implicite și rămâne utilizabil.

## Structura

```
index.html       pagina principală (toate vizualizările)
script.js        logica aplicației
style.css        stiluri (dark + light)
validare.html    pagina deschisă de codul QR al biletului
media/           trailere (.mp4) și postere locale
```

### Trailere

Pagina filmului caută `media/<nume>.mp4`. Acum există doar `media/avatar.mp4`; pentru celelalte filme apare
mesajul „Trailer indisponibil". Adaugă fișierele cu aceste nume în `media/`:
`dune.mp4`, `interstellar.mp4`, `batman_dk.mp4`, `inception.mp4`, `oppenheimer.mp4`, `spiderman.mp4`, `the_batman.mp4`.

## Pentru demo

- **Tasta G** (în afara câmpurilor de text) armează jackpotul de la Roata Norocului: următoarea învârtire câștigă codul `FREEVIP2`.
- **Ctrl+Shift+A** deschide panoul de admin; butonul de acolo șterge biletele, încasările și locurile cumpărate.
- Cardul nu este verificat cu algoritmul Luhn (orice 16 cifre merg). Pune `STRICT_CARD_CHECK: true` în `script.js` ca să fie cerut un număr valid.
- Pentru emailuri reale completează cheile EmailJS din `API_CONFIG`; până atunci trimiterea este sărită.

## Limite cunoscute (nu există server)

- Biletele, încasările și locurile cumpărate sunt în `localStorage`, deci doar pe browserul și calculatorul respectiv.
- „Validarea" biletului verifică o semnătură calculată în browser. Sarea este publică în cod, deci protejează doar împotriva modificării
  accidentale a link-ului, nu împotriva unui atacator. Un sistem real ar valida pe un server.
- Pentru ca QR-ul să se poată scana de pe telefon, site-ul trebuie să fie publicat (de exemplu GitHub Pages), nu deschis din `file://` sau `localhost`.
- Reminderul din browser apare doar cât timp pagina este deschisă; în calendar (Google / .ics) alarma funcționează independent.

## Lucrul în echipă (Git)

- `COD-GENERAL` este branch-ul de integrare; fiecare lucrează pe branch propriu și îl unește prin Pull Request.
- Commit-uri scurte, cu mesaj care spune *ce* s-a schimbat (nu „am stricat ceva").
- Înainte de commit, rulează site-ul local și verifică fluxul rezervare → plată → bilet → validare.
