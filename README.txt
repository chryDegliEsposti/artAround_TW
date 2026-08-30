================================================================================
PROGETTO TECNOLOGIE WEB 2025/2026 - RELAZIONE DI CONSEGNA
================================================================================

TITOLO PROGETTO: ArtAround - Ecosistema Museale Digitale Integrato
FASCIA DI VOTO TARGET: 18 - 27 PUNTI (Progetto Base + I Modulo Sincronizzazione Guida/Docente e Quiz)

AUTORI DEL PROGETTO:
- Nome e Cognome: [Nome Cognome] | Matricola: [Matricola] | Email: [email@studio.unibo.it]
- Repository GitHub: https://github.com/chryDegliEsposti/artAround_TW.git

================================================================================
1. CREDENZIALI DI ACCESSO AGLI ACCOUNT PRECONFIGURATI (Slide 15, 32)
================================================================================

Tutti gli account sono preconfigurati nel database con password comune:
Password: 12345678

1. AUTORE 1 (Ruolo: Autore / Creator):
   - Email: autore1@artaround.it
   - Password: 12345678
   - Permessi: Creazione Item multilivello/multidurata, Creazione Visite con step logistici, Gestione Museo.

2. AUTORE 2 (Ruolo: Autore / Creator):
   - Email: autore2@artaround.it
   - Password: 12345678
   - Permessi: Creazione e pubblicazione contenuti nel Marketplace.

3. VISITATORE 1 (Ruolo: Visitatore / Visitor):
   - Email: visitatore1@artaround.it
   - Password: 12345678
   - Permessi: Navigazione indoor 2D, fruizione visite, player audio TTS, comandi vocali.

4. VISITATORE 2 (Ruolo: Visitatore / Visitor):
   - Email: visitatore2@artaround.it
   - Password: 12345678
   - Permessi: Fruizione visite e partecipazione a visite sincronizzate con la guida/docente.

5. DOCENTE 1 (Ruolo: Docente / Guida - Modulo 18-27):
   - Email: docente1@artaround.it
   - Password: 12345678
   - Permessi: Avvio sessione sincronizzata con nome mnemonico "Fenice rossa", broadcast ritmo visita, somministrazione Quiz finale alla classe.

================================================================================
2. MUSEO REALE E DATASET IMPLEMENTATO (Slide 21, 32, 33)
================================================================================

- Museo Reale Scelto: Pinacoteca Nazionale di Bologna (Codice identificativo: PIN-BO)
- Pianta Indoor 2D: Mappa vettoriale a 2 livelli (Piano Terra L1, Primo Piano L2) con pareti interne/esterne, aree tematiche, corridoi e punti di interesse (POI).
- Opere d'Arte Reali Documentate (12 Capolavori con Wikidata Q-ID):
  1. Girolamo Mazzola Bedoli - Ritratto di frate in veste di San Tommaso d'Aquino (Q126599960)
  2. Raffaello Sanzio - Estasi di santa Cecilia (Q2453886)
  3. Guido Reni - Strage degli innocenti (Q3824424)
  4. Vitale da Bologna - San Giorgio e il drago (Q3947230)
  5. Parmigianino - Madonna di Santa Margherita (Q3842416)
  6. Annibale Carracci - Assunzione della Vergine (Q3627389)
  7. Ludovico Carracci - Annunciazione (Q3618174)
  8. Guercino - San Sebastiano soccorso da Irene (Q3947885)
  9. Giotto e bottega - Polittico di Bologna (Q3907519)
  10. Pietro Perugino - Madonna in gloria e santi (Q3842426)
  11. Lorenzo Costa - Matrimonio mistico di santa Caterina
  12. Francesco Francia - Pala Felicini

- 4 Visite Complete:
  * 3 Visite Standard con >= 10 opere reali e step logistici separati dagli item (Slide 21, 32):
    1. "I Grandi Capolavori della Pinacoteca" (Tono Medio, 10 opere + indicazioni per le sale)
    2. "Caccia all'Arte per Ragazzi: Draghi, Santi ed Eroi" (Tono Infantile, 10 opere per famiglie)
    3. "Dal Manierismo al Barocco Emiliano: Bedoli, Carracci e Guido Reni" (Tono Specialistico, 10 opere per studiosi)
  * 1 Visita Sincronizzata (Slide 28, 33):
    4. "Visita Guidata Classe 4B - Liceo Artistico" (Nome mnemonico: "Fenice rossa", con Quiz finale di 5 domande)

================================================================================
3. ISTRUZIONI PER L'AVVIO
================================================================================

--- OPZIONE A: TRAMITE DOCKER (CONSIGLIATA PER IL COLLAUDO) ---
Requisiti: Docker e Docker Compose installati.

1. Posizionarsi nella cartella radice del progetto:
   cd artAround_TW_merge

2. Avviare i container (MongoDB + Applicazione unificata con seed automatico):
   docker compose up --build

3. Aprire il browser agli indirizzi:
   - Marketplace / Editor:  http://localhost:3000/marketplace
   - Navigator (React):     http://localhost:3000/navigator

--- OPZIONE B: AVVIO IN LOCALE (SENZA DOCKER) ---
Requisiti: Node.js (v18+) e un'istanza MongoDB locale in esecuzione su porta 27017.

1. Installazione dipendenze:
   cd backend && npm install
   cd ../client_navigator && npm install

2. Compilazione frontend Navigator:
   cd ../client_navigator && npm run build

3. Inserimento dataset nel database:
   cd ../backend && npm run seed

4. Avvio server Express:
   cd ../backend && npm start (oppure npm run dev)

================================================================================
4. GUIDA AL COLLAUDO DELLE FUNZIONALITA' (FASCIA 18-27)
================================================================================

1. NAVIGAZIONE INDOOR 2D & POSIZIONAMENTO (Slide 22, 23, 27):
   - Mappa interattiva della Pinacoteca a 2 piani (L1 e L2) con Leaflet e Canvas renderer.
   - Calcolo del percorso a piedi (Pathfinding su griglia con rilevamento ostacoli).
   - Movimento tramite D-Pad virtuale o drag della mappa.

2. CONTROLLO VOCALE WEB SPEECH API CON VOCABOLARIO CONTROLLATO (Slide 26, 27):
   - Nel Navigator, cliccare sul pulsante microfono.
   - Pronunciare comandi in italiano quali: "prossima opera", "opera precedente", "ripeti spiegazione", "pausa", "apri dettagli", "vai a Raffaello", "mostrami il Bedoli", "dov'è il bagno", "strada più facile", "sali al primo piano".
   - Il sistema visualizza le onde sonore, trascrive la voce ed esegue l'azione.

3. ACCESSIBILITA' FISICA E COGNITIVA (Slide 24, 26, 27):
   - Cliccare sul pulsante Accessibilità (icona omino) a sinistra o nel player.
   - Opzioni testabili: Percorso Senza Barriere / Strada Facile (esclude le scale), Dimensione Testi (100%-140%), Velocità Voce (0.75x-1.5x), Modalità Alto Contrasto.

4. SINCRONIZZAZIONE REAL-TIME GUIDA/DOCENTE & QUIZ (Slide 28, 33 - I MODULO 18-27):
   - Aprire due schede del browser su http://localhost:3000/navigator:
     * Scheda 1 (Docente): Cliccare sull'icona Antenna/Radio, selezionare "Modalità Docente" e avviare la sessione con nome mnemonico "Fenice rossa".
     * Scheda 2 (Studente): Cliccare sull'icona Antenna/Radio, inserire "Fenice rossa" e cliccare "Unisciti".
   - Muovendo la mappa o cambiando opera dal Docente, la scheda dello Studente si sincronizza istantaneamente in tempo reale via WebSocket.
   - Dal Docente, cliccare "⚡ Somministra Quiz Finale alla Classe": il Quiz di 5 domande appare all'istante sullo schermo dello Studente.
   - Lo studente risponde, consegna e visualizza il punteggio percentuale con spiegazioni didattiche; il docente riceve in tempo reale il report con i voti della classe.

5. MARKETPLACE ED EDITOR (SENZA FRAMEWORK: ALPINE.JS / VANILLA) (Slide 16-20):
   - Accesso con `autore1@artaround.it` (pwd: `12345678`).
   - "Crea Items": ricerca opere con integrazione Wikidata, selezione durata (3s, 15s, 1min, 4min) e livello linguistico (infantile, elementare, medio, specialistico).
   - "Crea Visite": composizione del percorso con drag & drop di item e inserimento di indicazioni logistiche per le sale.

================================================================================
5. ARCHITETTURA E SCELTE TECNOLOGICHE (Slide 37)
================================================================================
- Backend: Node.js, Express, MongoDB (Mongoose), Socket.io, Google TTS API.
- Navigator Client: React, Vite, Leaflet Indoor Mapping, Web Speech API (Con Framework).
- Marketplace & Editor: HTML5 semantico, TailwindCSS, Alpine.js (Senza Framework, vincolo rispettato).
- Containerizzazione: Docker, Docker Compose multi-stage.

================================================================================
Fine Relazione di Consegna - ArtAround TW 2025/2026
================================================================================
