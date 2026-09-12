# 🏛️ ArtAround — Documentazione Tecnica & Specifica Completa delle Feature

Benvenuto nella documentazione tecnica ufficiale di **ArtAround**, una piattaforma web full-stack avanzata per la digitalizzazione dell'esperienza museale, la gestione di percorsi di visita interattivi, il disegno di planimetrie indoor e la vendita di tour e opere digitali.

---

## 📑 Indice Generale

1. [Architettura di Sistema & Scelte Tecnologiche](#1-architettura-di-sistema--scelte-tecnologiche)
2. [Sicurezza, Autenticazione & Accounting](#2-sicurezza-autenticazione--accounting)
3. [Modulo 1: Marketplace](#3-modulo-1-marketplace)
4. [Modulo 2: Navigator (Web App di Navigazione & Tour)](#4-modulo-2-navigator-web-app-di-navigazione--tour)
5. [Modulo 3: Editor di Planimetrie Indoor](#5-modulo-3-editor-di-planimetrie-indoor)
6. [Modello Dati & Database MongoDB](#6-modello-dati--database-mongodb)
7. [Guida all'Uso Corretto del Sito (Step-by-Step User Journeys)](#7-guida-alluso-corretto-del-sito-step-by-step-user-journeys)
   - [7.1 Creazione Planimetria con l'Editor](#71-creazione-planimetria-con-leditor)
   - [7.2 Creazione di un Museo & Inserimento Opere (Creator)](#72-creazione-di-un-museo--inserimento-opere-creator)
   - [7.3 Creazione di un Percorso di Visita](#73-creazione-di-un-percorso-di-visita)
   - [7.4 Navigazione Marketplace, Preferiti & Acquisti](#74-navigazione-marketplace-preferiti--acquisti)
   - [7.5 Esplorazione della Mappa Outdoor & Scheda Museo](#75-esplorazione-della-mappa-outdoor--scheda-museo)
   - [7.6 Esecuzione di un Tour Indoor Completo](#76-esecuzione-di-un-tour-indoor-completo)
   - [7.7 Visita Sincronizzata con la Classe & Quiz Finale (Teacher / Visitor)](#77-visita-sincronizzata-con-la-classe--quiz-finale-teacher--visitor)

---

## 1. Architettura di Sistema & Scelte Tecnologiche

Il progetto è strutturato secondo un'architettura **Full-Stack Disaccoppiata** ma fortemente integrata tramite API REST e WebSocket:

```
                      ┌───────────────────────────────────────┐
                      │              CLIENT TIER              │
                      └───────────────────┬───────────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
     ┌────────────────────────┐                      ┌────────────────────────┐
     │   Client Marketplace   │                      │    Client Navigator    │
     │  (Alpine.js + Tailwind)│                      │    (React 18 + Vite)   │
     └────────────┬───────────┘                      └────────────┬───────────┘
                  │                                               │
                  │              HTTP / REST / WebSocket          │
                  └───────────────────────┬───────────────────────┘
                                          ▼
                      ┌───────────────────────────────────────┐
                      │              SERVER TIER              │
                      │    Node.js + Express + Socket.io      │
                      └───────────────────┬───────────────────┘
                                          ▼
                      ┌───────────────────────────────────────┐
                      │             DATABASE TIER             │
                      │          MongoDB (Mongoose)           │
                      └───────────────────────────────────────┘
```

### Tecnologie Adottate:
- **Backend**:
  - **Node.js & Express 5**: Gestione del routing modulare, serving dei file statici e API RESTful.
  - **MongoDB & Mongoose 9**: Database documentale NoSQL con modelli relazionati (`ObjectId` ref) e query con populate.
  - **Socket.io 4**: Comunicazione bidirezionale in tempo reale per le sessioni sincrone di gruppo e broadcast del Quiz.
  - **Bcryptjs**: Crittografia unidirezionale con hashing e salting (10 rounds) per le password.
  - **JSON Web Token (JWT)**: Autenticazione stateless con gestione ibrida (Cookie HTTP-Only + Bearer Token).
  - **Google TTS API**: Generazione di audio sintetizzato per le guide vocali delle opere.
- **Frontend Marketplace**:
  - **HTML5 semantico, Tailwind CSS, Alpine.js 3**: Architettura reattiva e leggera, perfetta per dashboard amministrative e navigazione catalogo.
- **Frontend Navigator & Editor**:
  - **React 18 & Vite 5**: SPA ad alte prestazioni, con gestione stato locale e reattività rapida.
  - **HTML5 2D Canvas API**: Motore grafico proprietario ad altissima efficienza per il rendering di planimetrie multilivello, muri, stanze, collisioni e avatar visitatore.
  - **Leaflet & OpenStreetMap**: Mappe geografiche outdoor per geolocalizzazione e discovery dei musei.
  - **Lucide Icons**: Iconografia moderna e coerente.

---

## 2. Sicurezza, Autenticazione & Accounting

### 2.1 Modello Utente & Ruoli (RBAC)
Ogni utente nel sistema appartiene a un ruolo specifico definito nel campo `role` del modello `User`:
- **`visitor`**: Utente base / turista / studente. Può esplorare la mappa, sfogliare il catalogo, comprare visite/opere, partecipare a tour individuali o di gruppo e fare quiz. **Non ha accesso** alle funzionalità di creazione musei, inserimento opere o planimetrie.
- **`creator`**: Curatore museale / gestore. Ha tutti i permessi del visitatore più la possibilità di: creare nuovi musei, disegnare planimetrie con l'Editor, caricare opere d'arte, definire nuovi percorsi di visita e approvare/rifiutare richieste di join di altri creator.
- **`teacher`**: Docente / guida turistica. Può avviare sessioni sincronizzate in tempo reale con codice mnemonico, guidare a distanza la visualizzazione degli studenti e lanciare quiz di verifica delle competenze.

*File di riferimento:*
- Modello Utente: [`backend/src/models/User.js`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/backend/src/models/User.js)

### 2.2 Autenticazione Ibrida (Cookie + JWT Bearer)
Il sistema supporta una doppia modalità di trasmissione del token JWT:
1. **Cookie HTTP-Only (`jwt`)**: Generato al login/registrazione, non accessibile da JavaScript per prevenire attacchi XSS durante la navigazione di pagine tradizionali.
2. **Bearer Authorization Header (`Authorization: Bearer <token>`)**: Il token viene salvato nel `localStorage` del client ed allegato esplicitamente nelle chiamate `fetch` asincrone effettuate dall'app React Navigator.

Il middleware unificato `authorization` intercetta entrambe le modalità in modo trasparente.

*File di riferimento:*
- Middleware Auth: [`backend/src/middlewares/auth.middleware.js`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/backend/src/middlewares/auth.middleware.js)
- Controller Auth: [`backend/src/controllers/auth.controller.js`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/backend/src/controllers/auth.controller.js)
- Route Auth: [`backend/src/routes/auth.routes.js`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/backend/src/routes/auth.routes.js)

### 2.3 Protezione delle Rotte per Ruolo (Role Guard)
Il middleware `requireRole(['creator'])` blocca a monte qualsiasi tentativo di accesso non autorizzato a pagine e API sensibili:
- Se un utente `visitor` tenta di accedere a `/marketplace/newMuseum`, `/marketplace/createVisits`, `/marketplace/createItems`, `/marketplace/myMuseums`, `/marketplace/joinMuseum` o `/marketplace/editor`, viene reindirizzato con errore o riceve un HTTP `403 Forbidden`.
- Stessa protezione applicata agli endpoint REST di creazione (`POST /api/v1/marketplace/museums/create`, `POST /api/v1/marketplace/create/items`, `POST /api/v1/marketplace/create/visits`).

*File di riferimento:*
- Route Pagine Marketplace: [`backend/src/routes/marketplace.routes.js`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/backend/src/routes/marketplace.routes.js)
- Route API Marketplace: [`backend/src/routes/apiMarketplace.routes.js`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/backend/src/routes/apiMarketplace.routes.js)

### 2.4 Controllo di Accesso al Tour (Accounting del Tour)
L'accesso alla planimetria e alla navigazione interattiva di un percorso (`/navigator/tour`) è strettamente subordinato all'acquisto del biglietto.
- L'endpoint protetto `GET /api/v1/navigator/visits/tourData/:visitId` verifica se `visitId` è presente nell'array `purchasedVisits` dell'utente autenticato.
- Se la visita non è stata acquistata: restituisce `403 Forbidden` e a schermo compare un messaggio esplicativo con blocco del canvas.
- Se acquistata: restituisce le geometrie complete del museo (`layers`, `lines`, `areas`, `pois`) e le tappe del tour.

*File di riferimento:*
- API Dati Tour: [`backend/src/routes/navigator/VisitsAPI.js`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/backend/src/routes/navigator/VisitsAPI.js)
- Gestione Tour React: [`client_navigator/src/components/Pages/NavigatorApp.jsx`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/client_navigator/src/components/Pages/NavigatorApp.jsx)

### 2.5 Sistema di Gestione Account nel Navigator
Nel Navigator è integrato un pannello Account completo alimentato direttamente da MongoDB:
- **Tab Profilo**: Mostra Username, Email e Ruolo.
- **Tab Sicurezza**: Form per la modifica della password con verifica preliminare della password attuale e hashing sicuro.
- **Tab Pagamenti**: Inserimento e visualizzazione dei dati della carta di credito (`payment_card_number`, `payment_card_cvv`, `payment_card_exp`).
- **Tab Storico Acquisti (Payment History)**: Recupera in tempo reale tramite `populate` tutte le visite acquistate e le opere d'arte comprate nel marketplace con relativo prezzo.
- **Header Badge & Login Intelligente**: Mostra le iniziali dell'utente in un cerchio cliccabile; se non autenticato, mostra il tasto "Login" che reindirizza al Marketplace con il parametro `?redirect=...` per riportare l'utente sulla stessa pagina dopo l'accesso.

*File di riferimento:*
- Frontend Account: [`client_navigator/src/components/Pages/Account.jsx`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/client_navigator/src/components/Pages/Account.jsx), [`Account.css`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/client_navigator/src/components/Pages/Account.css)
- Layout Header con Iniziali: [`client_navigator/src/components/Pages/Layout.jsx`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/client_navigator/src/components/Pages/Layout.jsx)
- API Backend Account: [`backend/src/routes/navigator/AccountAPI.js`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/backend/src/routes/navigator/AccountAPI.js)
- Login con Redirect: [`client_marketplace/marketplace/pages/login.html`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/client_marketplace/marketplace/pages/login.html)

---

## 3. Modulo 1: Marketplace

Il Marketplace è il cuore commerciale e gestionale di ArtAround.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             MARKETPLACE MODULE                              │
├──────────────────────────────┬──────────────────────────────┬───────────────┤
│    Area Pubblica/Utente      │        Area Acquisti         │ Area Creator  │
├──────────────────────────────┼──────────────────────────────┼───────────────┤
│ • Index / Welcome            │ • Catalogo (BrowseMarket)    │ • New Museum  │
│ • Login & Registrazione      │ • Gestione Preferiti         │ • Create Item │
│ • Homepage con Dashboard     │ • Modal Checkout Simulato    │ • Create Visit│
│ • Notifiche Real-time        │ • Carrello & Storico         │ • My Museums  │
│ • Generatore QR Code         │                              │ • Join Museum │
└──────────────────────────────┴──────────────────────────────┴───────────────┘
```

### 3.1 Homepage & Dashboard Personalizzata
- Visualizzazione dinamica in base al ruolo (`visitor`, `creator`, `teacher`).
- Contatori statistici (musei gestiti, visite pubblicate, acquisti effettuati).
- Dropdown per la selezione rapida del museo attivo.
- Centro notifiche per le richieste di accesso e aggiornamenti di sistema.
- *File:* [`client_marketplace/marketplace/pages/homepage.html`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/client_marketplace/marketplace/pages/homepage.html)

### 3.2 Catalogo Esplorativo (Browse Market)
- Visualizzazione a schede di tutte le visite guidate e delle opere d'arte acquistabili.
- Filtri per categoria, museo, livello di conoscenza, prezzo e durata.
- Sistema di toggle preferiti (cuoricino) con salvataggio asincrono su DB (`favoriteVisits` e `favoriteItems`).
- *File:* [`client_marketplace/marketplace/pages/browseMarket.html`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/client_marketplace/marketplace/pages/browseMarket.html)

### 3.3 Flusso di Acquisto & Checkout
- Modale e pagina dedicata di checkout per visite e item.
- Registrazione dell'acquisto nel database dell'utente autenticato (`purchasedVisits`, `purchasedItems`).
- Prevenzione automatica degli acquisti duplicati.
- *File:* [`client_marketplace/marketplace/pages/checkout.html`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/client_marketplace/marketplace/pages/checkout.html), Controller: [`backend/src/controllers/apiMarketplace.controller.js`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/backend/src/controllers/apiMarketplace.controller.js)

### 3.4 Creazione e Gestione Museo (`newMuseum.html`)
- Inserimento dati anagrafici: Nome, Codice Univoco (es. `PIN-BO`), Città, Indirizzo, Coordinate GPS (Latitudine, Longitudine), Descrizione e URL Immagine di copertina.
- **Integrazione Round-Trip con l'Editor**:
  - Il pulsante *"Crea/Modifica Piantina"* salva lo stato del form in `sessionStorage` e apre l'Editor (`/navigator/editor?lat=...&lng=...&returnUrl=...`).
  - Al termine dell'editing, l'Editor inietta la planimetria JSON in `sessionStorage` e rimanda al form.
  - Il form mostra il badge verde *"✅ Mappa Allegata"* e al submit invia geometrie, layers, stanze, muri e POI al database MongoDB.
- *File:* [`client_marketplace/marketplace/pages/newMuseum.html`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/client_marketplace/marketplace/pages/newMuseum.html)

### 3.5 Creazione Opere d'Arte (`createItems.html`)
- Form per aggiungere opere appartenenti a un museo gestito.
- Campi: Titolo, Autore, Anno, Stile/Periodo, Dimensioni, Accession Number, URL Immagine, Prezzo di sblocco e descrizioni differenziate per livello.
- *File:* [`client_marketplace/marketplace/pages/createItems.html`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/client_marketplace/marketplace/pages/createItems.html)

### 3.6 Creazione Percorsi di Visita (`createVisits.html`)
- Creazione di tour personalizzati selezionando in sequenza le opere registrate nel museo.
- Impostazione del titolo, durata stimata, livello di conoscenza (`infantile`, `medio`, `specialistico`), eventuale codice mnemonico per visite sincronizzate e abbinamento di un quiz di verifica.
- *File:* [`client_marketplace/marketplace/pages/createVisits.html`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/client_marketplace/marketplace/pages/createVisits.html)

### 3.7 Collaborazione & Gestione Musei (`myMuseums.html`, `joinMuseum.html`)
- I Creator possono cercare musei esistenti tramite codice e inviare richieste di associazione (`joinReqMuseum`).
- I proprietari del museo ricevono notifiche e possono accettare o rifiutare la collaborazione con un clic (`handleJoinReq`).
- *File:* [`client_marketplace/marketplace/pages/myMuseums.html`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/client_marketplace/marketplace/pages/myMuseums.html), [`joinMuseum.html`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/client_marketplace/marketplace/pages/joinMuseum.html)

### 3.8 Generazione QR Code (`qrCodes.html`)
- Generazione automatica di QR Code per avviare istantaneamente visite specifiche o puntare alla scheda di un'opera d'arte.
- *File:* [`client_marketplace/marketplace/pages/qrCodes.html`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/client_marketplace/marketplace/pages/qrCodes.html)

---

## 4. Modulo 2: Navigator (Web App di Navigazione & Tour)

Il Navigator è la Single Page Application (SPA) in React pensata per la fruizione sul campo all'interno dei musei.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              NAVIGATOR MODULE                               │
├──────────────────────────────┬──────────────────────────────┬───────────────┤
│      Discovery & Mappe       │       Tour Interattivo       │ Accessibilità │
├──────────────────────────────┼──────────────────────────────┼───────────────┤
│ • Mappa Leaflet Outdoor      │ • Canvas 2D Multilivello     │ • Alto Contr. │
│ • Geolocalizzazione GPS      │ • D-Pad Controller con Fallb.│ • Zoom Font   │
│ • Scheda Dinamica Museo      │ • Pathfinding A* / Collisioni│ • Regolaz TTS │
│ • Lista "Le Mie Visite"      │ • Audio Guida & BottomBar    │ • No Barriere │
│ • Panoramica Tour (Overview) │ • Sessione Sincrona + Quiz   │               │
└──────────────────────────────┴──────────────────────────────┴───────────────┘
```

### 4.1 Mappa Outdoor & Geolocalizzazione (`MapView.jsx`)
- Mappa interattiva su base Leaflet / OpenStreetMap.
- Posizionamento in tempo reale dell'utente con bussola di orientamento (`heading`).
- Recupero dal database MongoDB di tutti i musei con coordinate, thumbnail, rating e indirizzo.
- Cliccando su un museo: apertura card di dettaglio con possibilità di avviare il calcolo percorso o aprire la scheda completa.
- *File:* [`client_navigator/src/components/Pages/MapView.jsx`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/client_navigator/src/components/Pages/MapView.jsx), [`MapView.css`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/client_navigator/src/components/Pages/MapView.css), [`MuseumsAPI.js`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/backend/src/routes/navigator/MuseumsAPI.js)

### 4.2 Scheda Dinamica del Museo (`ExploreMuseum.jsx`)
- Endpoint dinamico `/navigator/museum/:id`.
- Popola dal database: descrizione del museo, capolavori in evidenza, mostre in corso e servizi della struttura (Toilette, Bar, Ascensori, Guardaroba).
- *File:* [`client_navigator/src/components/Pages/ExploreMuseum.jsx`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/client_navigator/src/components/Pages/ExploreMuseum.jsx), [`ExploreMuseum.css`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/client_navigator/src/components/Pages/ExploreMuseum.css)

### 4.3 Gestione Visite Utente (`MyVisits.jsx`)
- Visualizza i tour acquistati dall'utente (`upcomingVisits`) con immagine di copertina, durata e tipologia.
- Azioni disponibili:
  - **"Bring me there"**: Apre Google Maps con indicazioni stradali fino alle coordinate del museo.
  - **"Overview"**: Mostra il riepilogo dettagliato del percorso.
  - **"Start Visit"**: Avvia il Tour interattivo indoor passando il `visitId` autenticato.
- *File:* [`client_navigator/src/components/Pages/MyVisits.jsx`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/client_navigator/src/components/Pages/MyVisits.jsx), [`MyVisits.css`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/client_navigator/src/components/Pages/MyVisits.css)

### 4.4 Engine di Navigazione Indoor (`NavigatorApp.jsx`)
- **Motore Canvas 2D**: Renderizza la planimetria vettoriale del museo estratta dal DB (muri con spessore, aree stanze colorate con etichette, POI interattivi, icone dei servizi, avatar visitatore e linea del percorso ottimale).
- **Controller D-Pad (Joystick)**: Controlla la posizione dell'utente nella mappa con sistema di fallback (non blocca il movimento anche in assenza di una griglia di collisione perfetta).
- **Gestione Piani (Floor/Layer Switching)**: Passaggio istantaneo tra diversi piani dell'edificio con ricalcolo dei punti visibili.
- **Pathfinding & Calcolo Percorsi**: Algoritmo su griglia che calcola la linea guida ottimale per raggiungere la prossima opera del tour (`gridPathfinding.js`).
- *File:* [`client_navigator/src/components/Pages/NavigatorApp.jsx`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/client_navigator/src/components/Pages/NavigatorApp.jsx), [`NavigatorApp.css`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/client_navigator/src/components/Pages/NavigatorApp.css), [`gridPathfinding.js`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/client_navigator/src/utils/gridPathfinding.js)

### 4.5 Audio Guida & Scheda Opera (`BottomBar.jsx`, `useSpeaker.js`)
- Barra inferiore scorrevole/espandibile (stile Apple Music / Spotify).
- Riproduzione audio sintetica del testo dell'opera con controlli Play/Pausa, Skip, Barra di avanzamento e regolazione volume.
- Scheda opera espansa con: immagine in alta definizione, titolo, autore, sala/piano, stile, dimensioni, accession number e testo descrittivo approfondito.
- *File:* [`client_navigator/src/components/UI/BottomBar.jsx`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/client_navigator/src/components/UI/BottomBar.jsx), [`BottomBar.css`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/client_navigator/src/components/UI/BottomBar.css), [`useSpeaker.js`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/client_navigator/src/utils/useSpeaker.js)

### 4.6 Accessibilità & Personalizzazione (`AccessibilityModal.jsx`)
- Regolazione ingrandimento caratteri (fontSize multiplier).
- Regolazione velocità di pronuncia dell'audio guida (speech rate).
- Attivazione tema ad **Alto Contrasto** per persone ipovedenti.
- Opzione *"Percorso Accessibile"* per calcolare tragitti privi di scale/barriere architettoniche.
- *File:* [`client_navigator/src/components/UI/AccessibilityModal.jsx`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/client_navigator/src/components/UI/AccessibilityModal.jsx), [`AccessibilityModal.css`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/client_navigator/src/components/UI/AccessibilityModal.css)

### 4.7 Sessioni Sincronizzate & Quiz di Gruppo (`SyncSessionModal.jsx`, `QuizModal.jsx`)
- **Architettura WebSocket (`/sync-tour`)**:
  - Il Docente crea o controlla una stanza associata a un codice mnemonico (es. *"Fenice rossa"*).
  - Gli studenti si uniscono inserendo il codice.
  - La posizione del docente, i cambi di piano e il cambio dell'opera attiva vengono trasmessi a tutti i dispositivi connessi in tempo reale.
- **Somministrazione Quiz**:
  - Il docente preme *"Avvia Quiz per la Classe"*: il WebSocket invia il payload del quiz a tutti i dispositivi degli studenti.
  - Gli studenti compilano le domande a risposta multipla con feedback e spiegazione didattica per ogni risposta.
  - I risultati vengono inviati in tempo reale sulla dashboard del docente con punteggio e percentuale.
- *File:* [`client_navigator/src/components/UI/SyncSessionModal.jsx`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/client_navigator/src/components/UI/SyncSessionModal.jsx), [`QuizModal.jsx`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/client_navigator/src/components/UI/QuizModal.jsx), Backend Socket: [`backend/src/sockets/syncTour.socket.js`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/backend/src/sockets/syncTour.socket.js)

---

## 5. Modulo 3: Editor di Planimetrie Indoor

L'Editor vettoriale è un'applicazione avanzata per il rilievo e il disegno delle piante degli edifici museali.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PLANMETRY EDITOR MODULE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Strumenti di Disegno: Muri (Lines), Stanze (Areas), Punti di Interesse    │
│ • Gestione Multilivello: Creazione, rinomina e ordinamento Piani (Layers)   │
│ • Griglia Interattiva con Snapping e Coordinate GPS/Astratte                │
│ • Riconoscimento Tipologia POI: Opere, Ingressi, Scale, Bagni, Ristorante   │
│ • Generatore Automatico di Griglie di Collisione e Ostacoli                 │
│ • Workflow Bidirezionale con SessionStorage e Redirezione a newMuseum.html   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Caratteristiche Tecniche dell'Editor:
1. **Piani Multipli (Layers)**: Possibilità di aggiungere infiniti piani (es. "Piano Terra", "Primo Piano", "Sotterraneo"), ciascuno con la propria altezza e ordine.
2. **Tracciamento Pareti (Wall Lines)**: Strumento per tracciare muri interni ed esterni con snap magnetico alla griglia e spessore parametrico.
3. **Disegno Aree & Stanze (Areas)**: Creazione di poligoni chiusi rappresentanti le sale espositive (es. "Sala del Rinascimento", "Sala 2"), con attribuzione di colore e nome.
4. **Posizionamento POI (Points of Interest)**: Inserimento mirato di:
   - 🖼️ *Opere d'arte esposte* (collegabili ad artworkId).
   - 🚪 *Ingressi ed Uscite*.
   - 🪜 *Scale & Ascensori* (fondamentali per il routing accessibile).
   - 🚻 *Servizi Igienici*.
   - ☕ *Punti Ristoro / Bar*.
5. **Esportazione & Integrazione Automatica**:
   - Se utilizzato in modalità autonoma: scarica il file `.json` strutturato della mappa.
   - Se richiamato da `newMuseum.html`: al click di *"Esporta JSON"*, serializza la mappa in `sessionStorage.getItem('editorMapData')` e reindirizza istantaneamente alla creazione museo.

*File di riferimento:*
- Componente Editor: [`client_navigator/src/components/Pages/Editor.jsx`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/client_navigator/src/components/Pages/Editor.jsx), [`Editor.css`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/client_navigator/src/components/Pages/Editor.css)

---

## 6. Modello Dati & Database MongoDB

I modelli Mongoose definiscono in modo chiaro le relazioni dell'intero ecosistema:

| Modello | File | Descrizione & Campi Chiave |
| :--- | :--- | :--- |
| **`User`** | [`User.js`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/backend/src/models/User.js) | Account utente: `username`, `email`, `password` (hash), `role` (`visitor`, `creator`, `teacher`), dati di pagamento, `purchasedVisits`, `purchasedItems`, `favoriteVisits`, `managedMuseums`. |
| **`Museum`** | [`Museum.js`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/backend/src/models/Museum.js) | Scheda museo: `name`, `museumId` (codice univoco), `city`, `address`, `latitude`, `longitude`, `image`, `creator`, `collaborators`, e geometrie planimetriche (`layers`, `lines`, `areas`, `pois`). |
| **`Item`** | [`Item.js`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/backend/src/models/Item.js) | Singola opera d'arte: `name`, `author`, `year`, `museum`, `museumId`, `description`, `style`, `recognitionImage`, `price`, `targetAges`. |
| **`Visit`** | [`Visit.js`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/backend/src/models/Visit.js) | Percorso guidato: `title`, `museum`, `creator`, `duration`, `price`, `knowledgeLevel`, `mnemonicName`, `isSync`, `steps` (array ordinato di tappe/opere), `quiz`. |
| **`Quiz`** | [`Quiz.js`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/backend/src/models/Quiz.js) | Questionario didattico: `title`, `description`, `timeLimitMinutes`, `questions` (domanda, opzioni, indice risposta esatta, spiegazione). |
| **`Notification`** | [`Notification.js`](file:///home/chribbio/Documents/techweb_prj/artAround_TW/backend/src/models/Notification.js) | Notifiche interne: `recipient`, `sender`, `type` (es. `join_request`), `museum`, `status` (`pending`, `accepted`, `rejected`), `read`. |

---

## 7. Guida all'Uso Corretto del Sito (Step-by-Step User Journeys)

Di seguito viene illustrata la procedura passo-passo per testare e utilizzare correttamente tutte le funzionalità del sistema.

```
   ┌─────────────────────────────────────────────────────────────┐
   │             FLUSSO OPERATIVO COMPLETO ARTAROUND             │
   └──────────────────────────────┬──────────────────────────────┘
                                  │
         ┌────────────────────────┴────────────────────────┐
         ▼                                                 ▼
┌──────────────────┐                              ┌──────────────────┐
│ FLUSSO CREATORE  │                              │ FLUSSO VISITATORE│
├──────────────────┤                              ├──────────────────┤
│ 1. Registrazione │                              │ 1. Registrazione │
│    ruolo Creator │                              │    ruolo Visitor │
│ 2. Disegno mappa │                              │ 2. Sfoglia Market│
│    (Editor)      │                              │    & Preferiti   │
│ 3. Crea Museo    │                              │ 3. Acquisto Tour │
│ 4. Carica Opere  │                              │ 4. Mappa Outdoor │
│ 5. Crea Visita   │                              │ 5. Tour Indoor   │
└──────────────────┘                              │ 6. Quiz Finale   │
                                                  └──────────────────┘
```

---

### 7.1 Creazione Planimetria con l'Editor
1. Effettua l'accesso come `creator` ed entra nell'Editor (`/navigator/editor` oppure cliccando *"Crea/Modifica Piantina"* dal form nuovo museo).
2. Nel pannello laterale sinistro seleziona il livello (es. *Piano 1*).
3. Clicca sullo strumento **Pareti** e traccia i muri perimetrali e divisori delle stanze cliccando sulla griglia.
4. Clicca sullo strumento **Aree / Stanze**, clicca per definire i vertici della stanza, assegna un nome (es. *"Sala Raffaello"*) e seleziona un colore.
5. Clicca sullo strumento **POI (Punti di Interesse)** e posiziona le icone sulla mappa:
   - Seleziona *Opera d'arte* e posizionala vicino alla parete.
   - Posiziona le icone *Ingresso*, *Scale* e *Toilette*.
6. Clicca su **"Esporta Mappa"**: se sei partito da `newMuseum.html`, la mappa verrà salvata in memoria e tornerai automaticamente al form del museo.

---

### 7.2 Creazione di un Museo & Inserimento Opere (Creator)
1. Nella Marketplace Homepage, clicca su **"Nuovo Museo"**.
2. Compila i dati anagrafici: Nome (es. *"Museo Civico Archeologico"*), Codice univoco (es. *"MCA-BO"*), Città, Indirizzo e Coordinate GPS (es. `44.4938`, `11.3431`).
3. Incolla l'URL dell'immagine di copertina.
4. Verifica che sia presente il badge *"✅ Mappa Allegata"* (ottenuto al punto 7.1).
5. Invia il modulo: il museo e la sua planimetria sono ora salvati nel database MongoDB.
6. Vai su **"Crea Nuova Opera"** (`createItems.html`), seleziona il museo appena creato e carica 2-3 opere compilando titolo, autore, prezzo e descrizioni.

---

### 7.3 Creazione di un Percorso di Visita
1. Vai su **"Crea Visita"** (`createVisits.html`).
2. Seleziona il museo creato.
3. Seleziona in sequenza le opere caricate per comporre le tappe del percorso (Step 1, Step 2, Step 3).
4. Assegna un titolo (es. *"I Capolavori del Rinascimento"*), una durata (es. 45 min) e un prezzo (es. 10.00 €).
5. Scegli il livello di conoscenza (es. *Medio / Standard*) e inserisci un nome mnemonico per i gruppi (es. *"Fenice rossa"*).
6. Salva la visita per renderla immediatamente disponibile nel catalogo del Marketplace.

---

### 7.4 Navigazione Marketplace, Preferiti & Acquisti
1. Accedi come utente `visitor` (o registrati da `/marketplace/registration`).
2. Entra in **"Catalogo"** (`browseMarket.html`).
3. Usa la barra di ricerca o i filtri per individuare la visita creata.
4. Clicca sul cuoricino per aggiungere la visita ai tuoi **Preferiti** (verrà salvata nel tuo profilo DB).
5. Clicca su **"Acquista Visita"**: si aprirà il checkout con il riepilogo del prezzo.
6. Conferma l'acquisto: la visita viene registrata nel tuo account MongoDB (`user.purchasedVisits`).

---

### 7.5 Esplorazione della Mappa Outdoor & Scheda Museo
1. Accedi all'applicazione Navigator su `/navigator/`.
2. Nella **MapView**, visualizzerai la mappa geografica con il marker del museo aggiunto e la tua posizione GPS.
3. Clicca sul marker del museo: visualizzerai la card con foto, valutazione e indirizzo.
4. Clicca su **"Esplora Museo"**: verrai indirizzato a `/navigator/museum/:id` dove potrai ammirare la scheda completa con i capolavori, le mostre e i servizi offerti.

---

### 7.6 Esecuzione di un Tour Indoor Completo
1. Nel Navigator, apri il menu e clicca su **"My Visits"** (`/navigator/my-visits`).
2. Troverai la scheda del tour acquistato al punto 7.4.
3. Clicca su **"Start Visit"**:
   - L'endpoint `/tourData/:visitId` verificherà il tuo acquisto e sbloccherà il tour.
   - Verrà caricato il canvas interattivo con la planimetria reale del museo.
4. Usa il **D-Pad Joystick** in basso a sinistra per muovere il tuo avatar tra le sale.
5. Man mano che ti avvicini o selezioni le tappe del tour, la **BottomBar** mostrerà l'opera attiva.
6. Clicca su **Play** nella BottomBar per ascoltare la guida vocale (TTS).
7. Trascina la BottomBar verso l'alto per aprire la scheda di approfondimento dell'opera con tutti i dettagli storici e le immagini in alta risoluzione.
8. Usa i controlli di piano (L1 / L2) se il museo si sviluppa su più livelli.

---

### 7.7 Visita Sincronizzata con la Classe & Quiz Finale (Teacher / Visitor)
1. **Flusso Docente (Teacher)**:
   - L'utente accede con ruolo `teacher` e avvia il tour con visita sincrona abilitata.
   - Apre il modale **Sync Session** (icona antenna radio) e seleziona la stanza con il nome mnemonico (es. *"Fenice rossa"*).
   - Muovendosi sulla mappa e cambiando opera, trasmette automaticamente la propria posizione a tutti i partecipanti.
2. **Flusso Studente (Visitor)**:
   - Gli studenti aprono il modale Sync Session e cliccano *"Unisciti come Visitatore"* digitando il codice *"Fenice rossa"*.
   - Il canvas si sincronizza all'istante seguendo la posizione e le opere selezionate dal docente.
3. **Lancio del Quiz Finale**:
   - Il docente clicca su *"Avvia Quiz per la Classe"*.
   - Su tutti i dispositivi degli studenti si apre istantaneamente il **QuizModal** con il questionario.
   - Gli studenti rispondono alle domande e premono *"Invia Risposte"*.
   - Il docente riceve in tempo reale sulla propria dashboard i risultati, i punteggi e le percentuali di apprendimento di ogni studente.

---

## 8. Riepilogo dei File e Risoluzione dei Problemi Noti

- **Proxy Vite per Ambiente di Sviluppo**: `client_navigator/vite.config.js` è configurato con `target: 'http://localhost:3000'` per instradare le chiamate `/api` al server Node.js.
- **Standalone MongoDB**: Tutte le operazioni di scrittura (compresa la registrazione utenti in `auth.controller.js`) sono state rese native per funzionare senza obbligo di Replica Set transazionale.
- **Git Ignore**: Il file `.gitignore` include tutte le esclusioni critiche (`.env`, `node_modules/`, `dist/`, `.mongodb_data/`, log e dump binari).
