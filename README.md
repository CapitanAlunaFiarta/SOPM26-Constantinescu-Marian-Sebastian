# Cinema NIII7 Brașov — versiunea React

Aplicație de rezervare bilete pentru Cinema NIII7 (Corpul N, Universitatea Transilvania Brașov), construită cu Vite, React 18 și React Router 6. Datele (bilete, încasări, locuri ocupate, temă) se păstrează în `localStorage`, nu există server.

## Pornire

```bash
npm install
npm run dev
npm run test:run
npm run build
```

Fișierele video cu trailere (`dune.mp4`, `interstellar.mp4`, `inception.mp4`, `avatar.mp4`, `oppenheimer.mp4`, `spiderman.mp4`, `the_batman.mp4`, `batman_dk.mp4`) se pun în folderul `public/`. Dacă un trailer lipsește, pagina filmului afișează un mesaj și un link de căutare.

## Variabile de mediu (opțional)

Copiază `.env.example` în `.env.local`. Aplicația funcționează și fără ele.

| Variabilă | Rol |
| --- | --- |
| `VITE_TMDB_API_KEY` | încarcă filmele „now playing” de la TMDB |
| `VITE_EMAILJS_*` | trimite biletul pe email prin EmailJS (altfel trimiterea este simulată) |
| `VITE_PUBLIC_URL` | adresa publică folosită în QR-ul de validare (implicit adresa curentă; pentru scanare de pe telefon trebuie să fie accesibilă de pe rețea) |

## Funcționalități

- program filtrabil după gen, sală și oră, căutare după titlu
- selectare locuri cu hartă accesibilă de la tastatură, „AI Sweet-Spot”, maximum 8 locuri pe comandă
- locuri ocupate deterministe pentru fiecare proiecție (film, sală, dată, oră), salvate după cumpărare
- snacks, coduri promoționale (`STUDENT20`, `CORPULN`, `VIP15`, `NIII7PRO`, `FREEVIP2`), plată simulată cu validare și protecție la dublu-click
- bilet cu cod unic, QR semnat, descărcare PNG, Google Calendar, fișier `.ics` cu alarmă, reminder prin notificări
- pagina `/validare` verifică semnătura din QR și respinge datele modificate
- Roata Norocului (3% jackpot, tasta `G`), panou admin la `Ctrl+Shift+A` cu resetare date
- temă întunecată/luminoasă, conversie RON/EUR/USD, meteo și dată prin API-uri cu timeout și valori de rezervă

## Limitări cunoscute

- Semnătura QR este o sumă de control calculată în browser: protejează împotriva modificării accidentale a link-ului, nu este securitate reală. Pentru producție semnătura trebuie generată și verificată pe server.
- Panoul admin nu are autentificare și plata este doar simulată.
- Reminderul din browser funcționează doar cât timp pagina rămâne deschisă; `.ics` și Google Calendar sunt varianta sigură.
- Pentru rutele directe (`/validare`, `/film/1`) serverul de hosting trebuie să redirecționeze către `index.html`.
