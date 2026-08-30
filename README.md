# 🎨 ArtAround - Ecosistema Museale Digitale Integrato

> **Progetto di Tecnologie Web 2025/2026** — *Università di Bologna (Prof. Fabio Vitali)*  
> **Fascia di Voto Target:** **18 - 27 Punti** (Progetto Base + I Modulo Sincronizzazione Guida/Docente e Quiz)

---

## 🏛️ Museo Reale: Pinacoteca Nazionale di Bologna (`PIN-BO`)

Il progetto è interamente calato sul caso di studio reale della **Pinacoteca Nazionale di Bologna**:
* **Pianta Indoor 2D Multi-Piano:** Piano Terra (L1) e Primo Piano (L2) con pareti, porte, aree tematiche, corridoi e POI.
* **12 Capolavori Reali Documentati con Wikidata Q-ID:** Girolamo Mazzola Bedoli (`Q126599960`), Raffaello (`Q2453886`), Guido Reni (`Q3824424`), Vitale da Bologna (`Q3947230`), Parmigianino (`Q3842416`), Annibale Carracci (`Q3627389`), Ludovico Carracci (`Q3618174`), Guercino (`Q3947885`), Giotto (`Q3907519`), Perugino (`Q3842426`), Lorenzo Costa, Francesco Francia.
* **4 Visite Guidate Complete:**
  1. *I Grandi Capolavori della Pinacoteca* (10 opere, tono medio, indicazioni logistiche per le sale).
  2. *Caccia all'Arte per Ragazzi: Draghi, Santi ed Eroi* (10 opere, tono infantile per famiglie).
  3. *Dal Manierismo al Barocco Emiliano: Bedoli, Carracci e Guido Reni* (10 opere, tono specialistico per studiosi).
  4. *Visita Guidata Classe 4B - Liceo Artistico* (Sincronizzata con nome mnemonico **`Fenice rossa`** e Quiz finale).

---

## 🚀 Avvio Rapido con Docker

```bash
# 1. Clona il repository ed entra nella cartella
git clone https://github.com/chryDegliEsposti/artAround_TW.git
cd artAround_TW

# 2. Avvia MongoDB e l'App con Docker Compose (il seed dei dati è automatico)
docker compose up --build
```

Apri il browser su:
* 🌐 **Marketplace & Editor:** [http://localhost:3000/marketplace](http://localhost:3000/marketplace)
* 🧭 **Navigator (React):** [http://localhost:3000/navigator](http://localhost:3000/navigator)

---

## 👥 Credenziali Account Preconfigurati (Password comune: `12345678`)

| Ruolo | Email | Password | Descrizione |
|---|---|---|---|
| **Autore 1** | `autore1@artaround.it` | `12345678` | Creazione item multilivello/multidurata e visite |
| **Autore 2** | `autore2@artaround.it` | `12345678` | Creazione e pubblicazione contenuti nel Marketplace |
| **Visitatore 1** | `visitatore1@artaround.it` | `12345678` | Navigazione indoor 2D, player audio, comandi vocali |
| **Visitatore 2** | `visitatore2@artaround.it` | `12345678` | Fruizione visite e modalità studente sincronizzato |
| **Docente 1** | `docente1@artaround.it` | `12345678` | Controllo sessione `"Fenice rossa"` e Quiz finale |

---

## ⚡ Funzionalità Principali Implementate (Fascia 18–27)

### 1. 🎓 Sincronizzazione Real-Time Docente/Guida (`Fenice rossa`) & Quiz (Slide 28, 33)
* **Docente:** Avvio sessione con nome mnemonico `"Fenice rossa"`, trasmissione posizione, cambio opera per tutti e broadcast audio.
* **Studente:** Collegamento con nome mnemonico; mappa e spiegazioni seguono in diretta il docente.
* **Quiz Finale:** Somministrazione a tutta la classe di 5 domande a risposta multipla con punteggio e statistiche in tempo reale.

### 2. 🎙️ Web Speech API con Vocabolario Controllato (Slide 26, 27)
Icona microfono: onde sonore animate e riconoscimento di comandi in italiano (*"prossima opera"*, *"opera precedente"*, *"ripeti spiegazione"*, *"mostrami il Bedoli"*, *"vai a Raffaello"*, *"dov'è il bagno"*, *"strada più facile"*, *"sali al primo piano"*).

### 3. ♿ Accessibilità Fisica e Cognitiva (Slide 24, 26, 27)
Pannello dedicato: percorso *"Strada Facile"* senza barriere architettoniche né scale, ridimensionamento testi (100%-140%), regolazione velocità audio (0.75x-1.5x), contrasto elevato.

### 4. 🛒 Marketplace & Editor (Senza Framework: Alpine.js / Vanilla - Slide 20, 37)
* Registrazione, login e profilazione utenti.
* Catalogo visite, acquisto e gestione preferiti.
* Creazione Item con 4 livelli di linguaggio e 4 durate temporali.
* Creazione Visite con ordinamento drag & drop SortableJS e step logistici tra le sale.

---

## 🛠️ Stack Tecnologico

* **Backend:** Node.js, Express, MongoDB (Mongoose), Socket.io, Google TTS API.
* **Navigator Client:** React, Vite, Leaflet Indoor Mapping, Web Speech API (Con Framework).
* **Marketplace & Editor:** HTML5 semantico, TailwindCSS, Alpine.js (Senza Framework).
* **Containerizzazione:** Docker & Docker Compose multi-stage.