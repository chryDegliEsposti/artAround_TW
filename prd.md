# PRD — ArtAround Navigator v33

**Prodotto:** ArtAround
**Modulo:** Navigator
**Versione:** 33 (Geolocalizzazione + Generative AI)
**Target:** Smartphone web app
**Stack obbligatorio:** Client JS/TS + Server Node.js + MongoDB
**Fonte requisiti:** Specifiche progetto 

---

## 1. Obiettivo del prodotto

Creare un’app web mobile che guida i visitatori nei musei con:

* Navigazione tra opere
* Riproduzione audio dei contenuti
* Interazione vocale naturale
* Adattamento ai profili utente
* Geolocalizzazione indoor simulata o reale
* Generazione dinamica di contenuti tramite LLM

L’utente **non deve percepire l’uso dell’AI**.

---

## 2. Obiettivi chiave

* Supportare visite personalizzate per interessi, età, tempo e competenze
* Riconoscere automaticamente l’opera più vicina
* Generare contenuti quando mancano
* Accettare comandi vocali naturali
* Tradurre contenuti in tempo reale
* Generare visite su richiesta in base ai vincoli utente

---

## 3. Utenti target

* Visitatori casuali
* Studenti
* Famiglie
* Ricercatori
* Turisti con tempo limitato

---

## 4. Componenti principali

### 4.1 Client Navigator (Mobile Web)

* Selezione museo tramite file config
* Selezione visita
* Mappa ambienti
* Lettura audio TTS
* Visualizzazione testo
* Comandi vocali
* Geolocalizzazione opere
* Comunicazione con LLM API

### 4.2 Server (Node.js)

* API visite e item
* Gestione utenti
* Connessione MongoDB
* API AI
* Log interazioni

---

## 5. Modello dati core

### 5.1 Item (contenuto)

Ogni item deve includere:

* `id`
* `opera_id` (ID universale)
* `autore_id`
* `stile_id`
* `durata` (3s, 15s, 40s, 1–4min)
* `livello_linguaggio` (infantile, semplice, medio, avanzato)
* `testo`
* `immagine_riferimento`
* `licenza`
* `autore_contenuto`
* `metadata_tematici`

### 5.2 Visita

Una visita contiene:

* Sequenza di item
* Istruzioni logistiche separate dagli item
* Contenuti opzionali
* Durata stimata
* Varianti per livelli diversi

---

## 6. Funzionalità obbligatorie v33

---

### 6.1 Localizzazione opere

#### Modalità base

* QR Code accanto alle opere
* Scanner QR → recupero item associato

#### Modalità avanzata

* Uso GPS + bussola + orientamento device
* Determinazione automatica dell’opera più vicina
* Se ambigua → mostra immagini candidate → utente seleziona

---

### 6.2 Navigazione intelligente

Sistema deve:

* Determinare opera successiva
* Fornire indicazioni logistiche
* Supportare richieste tipo:

  * Uscita
  * Toilette
  * Bar
  * Shop
  * Ostacoli accessibilità

---

### 6.3 Sistema di presentazione contenuti

* Selezione automatica item adatto a:

  * Età
  * Interesse
  * Tempo disponibile
  * Livello culturale
* Riproduzione TTS
* Visualizzazione testo sincronizzata

---

## 7. Integrazione Generative AI (LLM)

### 7.1 Generazione contenuti

LLM deve:

* Creare item se mancano
* Adattare livello linguistico
* Ridurre o aumentare lunghezza
* Generare alternative tematiche

---

### 7.2 Interpretazione linguaggio naturale

Input libero → mappatura ai comandi standard

**Esempi**

| Input naturale  | Comando mappato |
| --------------- | --------------- |
| "E adesso?"     | Prossimo        |
| "Non ho capito" | Più semplice    |
| "Dimmi altro"   | Dimmi di più    |

---

### 7.3 Traduzione in tempo reale

* Traduzione testo e audio
* Stessi contenuti in lingue diverse
* Nessuna modifica semantica

---

### 7.4 Generazione visite personalizzate

LLM deve creare visite partendo da vincoli:

**Input possibili**

* Tempo disponibile
* Età gruppo
* Livello culturale
* Interesse tematico
* Storico visite precedenti

**Esempi**

* “Ho solo 30 minuti”
* “Due adulti e due bambini”
* “Visita avanzata su Parmigianino”

**Output**

* Sequenza opere ottimizzata
* Livello linguistico adeguato
* Tempo stimato coerente

---

## 8. Interazione vocale

Supportare:

* Vocabolario controllato
* Linguaggio naturale libero
* Domande su:

  * Autore
  * Stile
  * Contesto storico
  * Approfondimenti
  * Navigazione spaziale

---

## 9. UX obbligatoria

* Nessun prompt visibile AI
* Nessuna indicazione che il contenuto è generato
* Interazione naturale e continua
* Modalità accessibile con pulsanti equivalenti ai comandi vocali

---

## 10. Vincoli tecnici

* Frontend: JavaScript o TypeScript
* Backend: Node.js (obbligatorio)
* Database: MongoDB
* Tutto su server dipartimento
* API AI esterna consentita
* Navigator generico, configurato via file museo

---

## 11. Contenuti richiesti alla consegna

* Museo reale configurato
* DB popolato con:

  * Item multipli per opere
  * 3 visite da ≥10 opere
* QR Code stampati per simulazione
* Modulo teletrasporto per test posizioni opere

---

## 12. Criteri di successo

Sistema è valido se:

* Localizza correttamente opere
* Genera contenuti coerenti
* Traduce correttamente
* Risponde a comandi naturali
* Crea visite dinamiche funzionanti
* UX appare naturale e non artificiale

---

## 13. Output consigliato per AI implementatrice

Se vuoi, posso ora generare una **versione ancora più strutturata per AI**, con:

* JSON schema per Item e Visita
* API contract Node.js
* Prompt engineering per LLM
* Diagramma architettura
* Checklist tecnica di implementazione
* PRD ultra-formale per valutazione universitaria
