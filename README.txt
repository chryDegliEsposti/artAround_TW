================================================================================
# Università di Bologna - Corso di Laurea in Informatica
# Tecnologie Web (A.A. 2025/26) - Prof. Fabio Vitali
================================================================================

# READ ME DEL PROGETTO ARTAROUND
# Progetto ArtAround 18-27

## Nome del gruppo: 
Vai Roma

## Membri del gruppo:
* Nome e cognome: Christian Degli Esposti, matricola: 0001160851, mail: christi.degliesposti@studio.unibo.it (Punto di contatto primario)
* Nome e cognome: Matteo Lombardo, matricola: 0001172254, mail: matteo.lombardo7@studio.unibo.it
* Nome e cognome: Mohammed Ababil Hossain, matricola: 0001160957, mail: mohammed.hossain4@studio.unibo.it
* LLM utilizzata: Gemini 3.7 Flash (Licenza commerciale / Google DeepMind API)

## Tipo progetto:
18-27 (Progetto Base + Estensione Modulo 1: Sincronizzazione Guida/Docente e Quiz di Valutazione)

## Data di disponibilità delle applicazioni:
Disponibile immediatamente per la valutazione.

## Locazione del progetto:
* URI del Marketplace & Editor: https://site2526XX.tw.cs.unibo.it/marketplace (in locale: http://localhost:3000/marketplace)
* URI del Navigator (React):    https://site2526XX.tw.cs.unibo.it/navigator   (in locale: http://localhost:3000/navigator)
* URI Sorgenti:                 https://site2526XX.tw.cs.unibo.it/source/
* Altri URI rilevanti:
  - Editor Planimetria:         https://site2526XX.tw.cs.unibo.it/navigator/editor

================================================================================
## Credenziali degli Account Obbligatori Preconfigurati
================================================================================
Tutti gli account hanno come password comune: 12345678

1. AUTORE 1 (Ruolo: Creator):
   - Email: autore1@artaround.it | Password: 12345678
   - Permessi: Creazione Item (con AI), Creazione Visite, Gestione Museo e Planimetria 2D.

2. AUTORE 2 (Ruolo: Creator):
   - Email: autore2@artaround.it | Password: 12345678
   - Permessi: Creazione e pubblicazione contenuti nel Marketplace.

3. VISITATORE 1 (Ruolo: Visitor):
   - Email: visitatore1@artaround.it | Password: 12345678
   - Permessi: Navigazione indoor, ascolto descrizioni, acquisto visite/opere.

4. VISITATORE 2 (Ruolo: Visitor):
   - Email: visitatore2@artaround.it | Password: 12345678
   - Permessi: Fruizione visite, partecipazione a visite sincronizzate.

5. DOCENTE 1 (Ruolo: Teacher / Guida):
   - Email: docente1@artaround.it | Password: 12345678
   - Permessi: Avvio sessione sincronizzata con nome mnemonico "Fenice rossa", broadcast in tempo reale alla classe, creazione e somministrazione Quiz finale.

================================================================================
## Organizzazione dei Sorgenti
================================================================================
Tutti i file sorgenti sono posizionati nella cartella /home/web/site2526XX/html/source/
con permessi 755 per le directory e 644 per i file:

* source/backend/
  - src/index.js: Entry point del server Express e inizializzazione WebSocket Socket.io (porta 8000).
  - src/models/: Schemi Mongoose (User, Museum, Item, Visit, Quiz).
  - src/routes/: Routing modulare Express per Marketplace (/api/v1/marketplace) e Navigator (/api/v1/navigator).
  - src/controllers/: Logica applicativa business, acquisti, gestione musei, items, visite e quiz.
  - src/sockets/syncTour.socket.js: Gestore WebSocket per la sincronizzazione real-time docente-studenti e quiz.
  - src/seed/: Script per il popolamento automatico del dataset museale iniziale.

* source/marketplace/
  - marketplace/pages/: Pagine HTML dell'applicazione Marketplace (homepage, browseMarket, createItems, createVisits, newMuseum, checkout, login/register).
  - marketplace/scripts/: Logica client Alpine.js e gestione chiamate API autenticate JWT.

* source/navigator/
  - src/components/Pages/: Componenti React per la navigazione (Home, ExploreMuseum, Tour con mappa indoor e Leaflet, Editor 2D planimetrie).
  - src/components/Shared/: Componenti riutilizzabili (Player audio TTS, Modale Sincronizzazione Docente/Studente, Modale Quiz).
  - dist/: Bundle di produzione compilato con Vite e servito staticamente da Express.

================================================================================
## Tecnologie Utilizzate
================================================================================

#### Server-Side:
- Runtime: Node.js (v20/v22)
- Framework Web: Express.js
- Database: MongoDB con ODM Mongoose
- Comunicazione Real-Time: Socket.io (WebSockets)
- Sicurezza & Autenticazione: JSON Web Token (JWT), bcryptjs, CORS
- Sintesi Vocale: Web Speech Synthesis API & Google Cloud Text-to-Speech API

#### Applicazione Marketplace & Editor (Vincolo No-Framework rispettato):
- Linguaggi: HTML5 Semantico, Vanilla JavaScript (ES6+)
- Framework Reattivo Leggero: Alpine.js (Nessun framework pesante SPA come da vincolo)
- Grafica & Styling: Tailwind CSS e FontAwesome

#### Applicazione Navigator (Mobile-First):
- Framework: React 19 con Vite
- Mappe & Navigazione Indoor: Leaflet e React-Leaflet (Mappa vettoriale 2D multi-layer con coordinate locali)
- Iconografia & UI: Lucide React e Material Symbols
- Riconoscimento & Sintesi Vocale: Web Speech API (SpeechRecognition & SpeechSynthesis)

================================================================================
## Descrizione del Progetto e Feature Rilevanti (Estensione 18-27)
================================================================================

1. Dataset Reale (Pinacoteca Nazionale di Bologna - Codice: PIN-BO):
   - Pianta indoor vettoriale 2D su due piani (Piano Terra e Primo Piano) con muri perimetrali, pareti interne, aree di servizio e 17 POI.
   - 12 Opere d'Arte reali documentate da Wikidata con immagini, stili e descrizioni differenziate per tono (Infantile, Medio, Specialistico) e durata (15s, 1m, 3m).
   - 4 Visite guidate complete (di cui 3 con >= 10 opere con step logistici separati dagli item).

2. Presentazione Museo & Slider Anteprima:
   - Pagina di presentazione dinamica nel Navigator con Hero banner, slider interattivo a frecce per le opere scelte dal curatore (previewItems), reindirizzamento al Marketplace per l'acquisto di visite e catalogo opere filtrate.
   - Sezione "Servizi & Struttura" generata in tempo reale dalla geometria della planimetria senza hardcoding.

3. Editor 2D Planimetrie con Controllo Accessi:
   - Accesso consentito unicamente agli utenti con ruolo Creator che possiedono almeno 1 museo registrato.
   - Disegno interattivo di muri perimetrali, pareti, aree ristoro/WC e posizionamento POI agganciati alle opere del database.

4. Modulo Sincronizzazione Guida/Docente Real-Time (Estensione 18-27):
   - La docente attiva la visita sul Marketplace assegnando un nome mnemonico (es. "Fenice rossa").
   - Gli studenti si collegano digitando il nome e la docente visualizza i partecipanti in tempo reale.
   - Broadcast istantaneo dei movimenti e delle spiegazioni dal dispositivo docente a tutti gli studenti.
   - Chat interattiva per domande e richieste di spiegazione da parte degli studenti al docente.
   - Creazione e somministrazione istantanea del Quiz a scelta multipla con calcolo automatico del punteggio e report voti live per la docente.
   - Chiusura sincronizzata della sessione che disconnette automaticamente tutti gli allievi.

================================================================================
## Contributo Individuale dei Membri del Gruppo
================================================================================
La suddivisione del lavoro è stata effettuata su base funzionale (Full-Stack):

* Christian Degli Esposti:
  - Architettura backend Express, autenticazione JWT e middleware ruoli.
  - Sviluppo del modulo WebSocket Socket.io per la sincronizzazione real-time della visita sincronizzata Docente/Studente e gestione Quiz.
  - Implementazione delle viste Marketplace (browseMarket, checkout, createVisits) e logica Alpine.js.

* Matteo Lombardo:
  - Progettazione e sviluppo dell'applicazione Navigator in React/Vite.
  - Implementazione della mappa indoor interattiva multi-layer con Leaflet e sistema di navigazione.
  - Sviluppo della pagina di presentazione museo (ExploreMuseum) con slider interattivo e filtri dinamici.
  - Integrazione Web Speech API per comandi vocali e sintesi audio.

* Mohammed Ababil Hossain:
  - Sviluppo dell'Editor 2D della planimetria (disegno muri, aree, calcolo facilities dinamiche).
  - Modellazione schemi database Mongoose (User, Museum, Item, Visit, Quiz) e script di seeding iniziale.
  - Sviluppo della sezione creazione museo/items e controlli di autorizzazione per i Creator.
  - Configurazione dei container Docker di dipartimento e test di collaudo.

================================================================================
## Contributo della LLM (Gemini 3.7 Flash)
================================================================================
L'assistente AI (LLM) è stato utilizzato in modalità Pair Programming per:
1. Generazione e arricchimento dei testi descrittivi delle opere d'arte della Pinacoteca Nazionale di Bologna secondo i vari livelli linguistici (infantile, medio, specialistico) e durate (15s, 1m, 3m).
2. Supporto al debug degli handler WebSocket per la sincronizzazione real-time delle stanze e disconnessione dei client.
3. Ottimizzazione delle query Mongoose e calcolo delle coordinate geometriche per il rendering dei muri Leaflet nell'Editor 2D.
================================================================================
