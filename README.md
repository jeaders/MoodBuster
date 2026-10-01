# 🎬 Moodbuster Video & Cinema

Scegli il film in base al mood. Un'applicazione web 3D in prima persona ispirata alle videoteche anni '90, con un catalogo di 90+ film organizzati per mood, una sala cinema integrata, trailer reali e contenuti gratuiti legali.

## Cos'è Moodbuster

Moodbuster è una videoteca 3D interattiva dove ti muovi in prima persona tra gli scaffali di un negozio in stile anni '90. Ogni reparto è dedicato a un mood diverso: da ridere, da piangere, adrenalina, paura, cuore, cervello acceso e molti altri. Inoltre è presente una sala cinema con proiettore e poltrone dove puoi guardare trailer e film gratuiti.

Invece di scorrere infinite liste, esplori lo spazio, scegli il mood che ti corrisponde e lasciati consigliare. Se non sai cosa guardare, puoi chiedere un consiglio a **Claudio il commesso**, usare il **Mood-o-Matic**, rispondere a un quiz o preparare una **serata** con più film.

## Caratteristiche principali

- 🎮 **Gioco in prima persona**: cammina, salta, guardati attorno e interagisci con l'ambiente 3D.
- 🎭 **12 mood categorie**: DA RIDERE, DA PIANGERE, ADRENALINA, DA PAURA, CUORE, CERVELLO ACCESO, COMFORT MOVIE, EPICO, VIAGGIO, DRAMMATICO, TUTTI INSIEME, ANIMAZIONE.
- 📽️ **90+ film nel catalogo**: ognuno con mood, anno, durata, valutazione, piattaforme di streaming, snack e drink consigliati.
- 🍿 **Sala Cinema 1**: entra nella sala, siediti e guarda trailer YouTube ufficiali o film gratuiti legali.
- 🆓 **Contenuti gratuiti legali**: film di pubblico dominio da Internet Archive e canali YouTube ufficiali.
- 🧠 **Integrazione TMDB**: copertine reali, trailer, provider di streaming e dati aggiornati da The Movie Database.
- 📱 **Touch support**: joystick virtuale, pulsanti touch e interfaccia ottimizzata per mobile.
- 🔊 **Audio procedurale**: passi, salti, suoni UI e musica generati con Web Audio API, senza file audio esterni.
- 🔦 **Torcia** e **vista terza persona**.
- 🔍 **Ricerca**, **filtro per mood**, **serata**, **film personalizzato**, **quiz** e **pannello di aiuto**.

## Tecnologie

- **React 19** + **TypeScript**
- **Three.js** + **@react-three/fiber**
- **Zustand** per lo stato del gioco
- **Tailwind CSS 4** + **@tailwindcss/vite**
- **Vite 7** + **vite-plugin-singlefile**
- **TMDB API** v3 (italiano)

## Struttura del progetto

```
src/
  App.tsx            # Componente principale, gestione input e pannelli
  main.tsx           # Entry point React
  index.css          # Stili globali e classi personalizzate
  data/
    films.ts         # Catalogo 90+ film, mood e logica prezzi
    freeMovies.ts    # Film gratuiti legali (Internet Archive + YouTube)
  three/
    Scene.tsx        # Scena 3D: negozio, gondole, scaffali, sala cinema
    Player.tsx       # Giocatore in prima persona, collisioni, animazioni
  ui/
    Hud.tsx          # Barra superiore, mirino, bussola, minimappa, joystick
    Panels.tsx       # Pannelli: Mood-o-Matic, serata, ricerca, quiz, Claudio
    CinemaOverlay.tsx# Overlay per la visione in sala (trailer e film gratuiti)
    FreeCinemaPanel.tsx # Pannello per contenuti gratuiti
    useTmdb.tsx      # Integrazione poster e copertine TMDB
    common.ts        # Componenti UI condivisi
  lib/
    state.ts         # Store Zustand e logica di gioco
    layout.ts        # Mappe, slot, gondole, poltrone, navigazione
    tmdb.ts          # Client API TMDB, cache poster, ricerca film
    audio.ts         # Motore audio procedurale (passi, salti, UI, musica)
    textures.ts      # Generazione texture procedurali
    threePosters.ts  # Caricamento poster su mesh Three.js
  utils/
    cn.ts            # Utility per classi Tailwind
```

## Come funziona

### Controlli desktop

| Tasto | Azione |
|-------|--------|
| `W A S D` | Cammina |
| `Spazio` | Salta |
| `E` o `Invio` | Interagisci (kiosk, Claudio, poltrone, film) |
| `F` o `/` | Cerca |
| `M` | Pannello Mood |
| `B` | Pannello Serata |
| `L` | Torcia |
| `V` | Cambia vista (prima/terza persona) |
| `Esc` | Chiudi pannelli |
| Click sinistro | Blocca il cursore per guardarti attorno |

### Controlli mobile

- Joystick virtuale per muoverti
- Pulsanti touch per saltare, interagire e usare la torcia
- Tap breve per selezionare oggetti direttamente

### Flusso di gioco

1. All'apertura vedi l'intro, poi entri nel negozio.
2. Esplora i reparti: ogni gondola corrisponde a un mood.
3. Avvicinati a un film e premi `E` per vedere la scheda dettagliata con trailer, piattaforme e consigli.
4. Usa il **Mood-o-Matic** se vuoi trovare un film per stato d'animo.
5. Entra nella **Sala Cinema**, siediti e guarda trailer o film gratuiti.
6. Salva i film che ti piacciono nella **Serata** o chiedi consiglio a **Claudio**.

## Avvio rapido

### Prerequisiti

- Node.js 18+
- npm o pnpm

### Installazione

```bash
npm install
```

### Sviluppo

```bash
npm run dev
```

Apri `http://localhost:5173` nel browser.

### Build

```bash
npm run build
```

### Anteprima build

```bash
npm run preview
```

## Note sulla configurazione

L'app usa una chiave TMDB di default per funzionare subito. Puoi sostituirla con la tua chiave gratuita registrandoti su [themoviedb.org](https://www.themoviedb.org/settings/api) e inserendola nel pannello dedicato.

Per YouTube, imposta queste variabili d'ambiente:
- `VITE_YOUTUBE_API_KEY`
- `VITE_YOUTUBE_FILMS_PLAYLIST`
- `VITE_YOUTUBE_CARTOONS_PLAYLIST`

Esempio file `.env`:
```
VITE_TMDB_API_KEY=
VITE_YOUTUBE_API_KEY=
VITE_YOUTUBE_FILMS_PLAYLIST=PL1kWuU-4-qOnPjWBZbPJpNBPtm7N9uNUf
VITE_YOUTUBE_CARTOONS_PLAYLIST=PLfgtmsJQgW6Q0P7fk2gEyqKDAz9PZo5eg
```

I contenuti gratuiti provengono da:
- **Internet Archive**: opere di pubblico dominio con player embeddabile stabile.
- **YouTube**: playlist pubbliche di film completi e cartoni animati distribuiti legalmente.

## Deploy su Netlify

1. Collega il repository GitHub a Netlify.
2. Imposta queste variabili d'ambiente nel pannello Netlify:
   - `VITE_TMDB_API_KEY`
   - `VITE_YOUTUBE_API_KEY`
   - `VITE_YOUTUBE_FILMS_PLAYLIST`
   - `VITE_YOUTUBE_CARTOONS_PLAYLIST`
3. Il file `netlify.toml` configura automaticamente build e publish.
4. Netlify effettua il deploy automatico ad ogni push su `main`.

## Credits

Costruito con React, Three.js, Tailwind e tanta passione per il cinema.
