================================================================================
PROGETTO TECNOLOGIE WEB 2025/2026 - RELAZIONE DI CONSEGNA
================================================================================

TITOLO PROGETTO: ArtAround - Ecosistema Museale Digitale Integrato
FASCIA DI VOTO TARGET: 18 - 33 PUNTI (Progetto Base + Modulo 1 Guida/Docente + Modulo 2 Geo/LLM)

AUTORI DEL PROGETTO:
- Nome e Cognome: [Nome Cognome] | Matricola: [Matricola] | Email: [email@studio.unibo.it]
- Repository GitHub: https://github.com/chryDegliEsposti/artAround_TW.git

================================================================================
1. CREDENZIALI DI ACCESSO AGLI ACCOUNT OBBLIGATORI
================================================================================

Tutti gli account sono preconfigurati nel database e hanno come password comune:
Password: 12345678

1. AUTORE 1 (Ruolo: Autore / Creator):
   - Email: autore1@artaround.it
   - Password: 12345678
   - Permessi: Creazione Item (con AI), Creazione Visite (su vincoli), Gestione Museo.

2. AUTORE 2 (Ruolo: Autore / Creator):
   - Email: autore2@artaround.it
   - Password: 12345678
   - Permessi: Creazione e pubblicazione contenuti nel Marketplace.

3. VISITATORE 1 (Ruolo: Visitatore / Visitor):
   - Email: visitatore1@artaround.it
   - Password: 12345678
   - Permessi: Navigazione indoor, scansione QR, fruizione visite, traduzione.

4. VISITATORE 2 (Ruolo: Visitatore / Visitor):
   - Email: visitatore2@artaround.it
   - Password: 12345678
   - Permessi: Fruizione visite, partecipazione a visite sincronizzate.

5. DOCENTE 1 (Ruolo: Docente / Guida):
   - Email: docente1@artaround.it
   - Password: 12345678
   - Permessi: Avvio sessione sincronizzata con nome mnemonico "Fenice rossa", broadcast movimenti, somministrazione Quiz finale alla classe.

================================================================================
2. MUSEO REALE E DATASET IMPLEMENTATO
================================================================================

- Museo Reale Scelto: Pinacoteca Nazionale di Bologna (Codice identificativo: PIN-BO)
- Pianta Indoor: Mappa vettoriale 2D a 2 livelli (Piano Terra L1, Primo Piano L2) con pareti, porte, aree tematiche, corridoi e punti di interesse (POI).
- Opere d'Arte Reali Documentate (12 Capolavori):
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

- 4 Visite Guidate Complete (3 con >= 10 opere con step logistici separati dagli item + 1 sincronizzata):
  * Visita 1: "I Grandi Capolavori della Pinacoteca" (Tono Medio, 10 opere + indicazioni per le sale)
  * Visita 2: "Caccia all'Arte per Ragazzi: Draghi, Santi ed Eroi" (Tono Infantile, 10 opere per famiglie)
  * Visita 3: "Dal Manierismo al Barocco Emiliano: Bedoli, Carracci e Guido Reni" (Tono Specialistico, 10 opere per studiosi)
  * Visita 4 (Sincronizzata): "Visita Guidata Classe 4B - Liceo Artistico" (Nome mnemonico: "Fenice rossa", con Quiz finale di 5 domande)

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
   - Foglio QR Code Stampa: http://localhost:3000/qr-codes

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
   cd ../backend && npm run dev (oppure npm start)

================================================================================
4. GUIDA AL COLLAUDO DELLE FUNZIONALITA' (FASCIA 18-33)
================================================================================

1. MODULO DI TELETRASPORTO VIRTUALE (Slide 33):
   - Nel Navigator, cliccare sul pulsante con l'icona del fulmine (Zap) a sinistra.
   - Nella lista, selezionare un'opera (es. "Estasi di santa Cecilia" di Raffaello).
   - L'utente viene teletrasportato istantaneamente davanti al quadro, la mappa centra la visuale, il piano cambia automaticamente a L2 e la scheda dell'opera si apre.

2. TRIGGER QR CODE REALE & FOGLIO STAMPABILE:
   - Visitare http://localhost:3000/qr-codes per visualizzare il foglio con i 12 QR Code ad alta definizione dei capolavori.
   - Nel Navigator, cliccare sul pulsante fotocamera e inquadrare un QR (o incollare il Q-ID Wikidata): l'opera viene agganciata e aperta all'istante.

3. CONTROLLO VOCALE WEB SPEECH API CON VOCABOLARIO CONTROLLATO (Slide 27):
   - Nel Navigator, cliccare sul pulsante microfono.
   - Pronunciare comandi in italiano quali: "prossima opera", "ripeti spiegazione", "pausa", "apri dettagli", "vai a Raffaello", "mostrami il Bedoli", "dov'è il bagno", "strada più facile", "sali al primo piano".
   - Il sistema visualizza le onde sonore, trascrive la voce ed esegue l'azione.

4. ACCESSIBILITA' FISICA E COGNITIVA (Slide 24, 26):
   - Cliccare sul pulsante Accessibilità (icona omino) a sinistra o nel player.
   - Opzioni testabili: Percorso Senza Barriere / Strada Facile (esclude le scale), Dimensione Testi (100%-140%), Velocità Voce (0.75x-1.5x), Modalità Alto Contrasto.

5. GENERATIVE AI / LLM NEL MARKETPLACE E NAVIGATOR (Slide 33):
   - Creazione Item con AI: in /marketplace -> "Crea Item", cercare un'opera su Wikidata e cliccare "🪄 Genera Testo con AI". Il testo viene autocompilato con metadato 'autore_contenuto: "AI"'.
   - Generazione Visita su Vincoli con AI: in /marketplace -> "Crea Visite", cliccare "⚡ Assistente AI: Genera su Vincoli", impostare durata (es. 45 min) e target (Bambini / Specialistico). L'AI crea il percorso, ordina i capolavori e genera le istruzioni logistiche.
   - Traduzione Real-Time: nella scheda dell'opera nel Navigator, cliccare sulle bandiere (IT, EN, ES, FR, DE) per tradurre istantaneamente il testo e ascoltarlo nella lingua selezionata.
   - Adattamento Tono al Volo: cambiare tono tra "👶 Ragazzi", "👤 Standard" e "🎓 Esperto".

6. SINCRONIZZAZIONE REAL-TIME GUIDA/DOCENTE & QUIZ (Slide 31-32):
   - Aprire due finestre del browser su http://localhost:3000/navigator:
     * Finestra 1 (Docente): Cliccare sull'icona Antenna/Radio, selezionare "Modalità Docente" e avviare la sessione con nome mnemonico "Fenice rossa".
     * Finestra 2 (Studente): Cliccare sull'icona Antenna/Radio, inserire "Fenice rossa" e cliccare "Unisciti".
   - Muovendo la mappa o cambiando opera dal Docente, la finestra dello Studente si sincronizza istantaneamente in tempo reale via WebSocket.
   - Dal Docente, cliccare "⚡ Somministra Quiz Finale alla Classe": il Quiz di 5 domande appare all'istante sullo schermo dello Studente.
   - Lo studente risponde, consegna e visualizza il punteggio percentuale con spiegazioni; il docente riceve in tempo reale il report con i voti della classe.

================================================================================
5. ARCHITETTURA E SCELTE TECNOLOGICHE
================================================================================
- Backend: Node.js, Express, MongoDB (Mongoose), Socket.io, Google TTS API.
- Navigator Client: React, Vite, Leaflet Indoor Mapping, Web Speech API.
- Marketplace & Editor: HTML5 semantico, TailwindCSS, Alpine.js (No-framework constraint rispettato).
- Containerizzazione: Docker, Docker Compose multi-stage.

================================================================================
Fine Relazione di Consegna - ArtAround TW 2025/2026
================================================================================
