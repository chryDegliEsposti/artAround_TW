# 🎨 ArtAround - Ecosistema Museale Digitale Integrato

> **Progetto di Tecnologie Web 2025/2026** — *Università di Bologna (Prof. Fabio Vitali)*  
> **Fascia di Voto Target:** **18 - 33 Punti** (Progetto Base + Modulo 1 Docente/Guida + Modulo 2 Geo/LLM)

---

## 🏛️ Museo Reale: Pinacoteca Nazionale di Bologna (`PIN-BO`)

Il progetto è interamente calato sul caso di studio reale della **Pinacoteca Nazionale di Bologna**:
* **Pianta Indoor 2D Multi-Piano:** Piano Terra (L1) e Primo Piano (L2) con pareti, porte, aree tematiche e POI.
* **12 Capolavori Reali Documentati con Wikidata Q-ID:** Girolamo Mazzola Bedoli (`Q126599960`), Raffaello (`Q2453886`), Guido Reni (`Q3824424`), Vitale da Bologna (`Q3947230`), Parmigianino (`Q3842416`), Annibale Carracci (`Q3627389`), Ludovico Carracci (`Q3618174`), Guercino (`Q3947885`), Giotto (`Q3907519`), Perugino (`Q3842426`), Lorenzo Costa, Francesco Francia.
* **4 Visite Guidate Complete:**
  1. *I Grandi Capolavori della Pinacoteca* (10 opere, tono medio, indicazioni logistiche).
  2. *Caccia all'Arte per Ragazzi: Draghi, Santi ed Eroi* (10 opere, tono infantile).
  3. *Dal Manierismo al Barocco Emiliano* (10 opere, tono specialistico).
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
* 🖨️ **Foglio QR Code per l'Esame:** [http://localhost:3000/qr-codes](http://localhost:3000/qr-codes)

---

## 👥 Credenziali Account Preconfigurati (Password comune: `12345678`)

| Ruolo | Email | Password | Descrizione |
|---|---|---|---|
| **Autore 1** | `autore1@artaround.it` | `12345678` | Creazione item con AI e visite su vincoli |
| **Autore 2** | `autore2@artaround.it` | `12345678` | Creazione contenuti nel Marketplace |
| **Visitatore 1** | `visitatore1@artaround.it` | `12345678` | Navigazione indoor, scansione QR e audio |
| **Visitatore 2** | `visitatore2@artaround.it` | `12345678` | Fruizione visite e modalità studente sincronizzato |
| **Docente 1** | `docente1@artaround.it` | `12345678` | Sessione sincronizzata `"Fenice rossa"` e Quiz broadcast |

---

## ⚡ Guida alle Funzionalità Implementate (18–33 Punti)

### 1. ⚡ Modulo di Teletrasporto Virtuale (Slide 33)
Pulsante `Zap` nel Navigator: seleziona all'istante una qualsiasi delle 12 opere o dei servizi; l'utente viene posizionato davanti al quadro, il piano cambia automaticamente a L2 e la scheda dell'opera si apre.

### 2. 📷 Trigger QR Code Reale & Foglio Stampabile
Riconoscimento istantaneo di identificatori Wikidata (es. `Q126599960`) tramite fotocamera reale con foglio stampabile accessibile su `/qr-codes`.

### 3. 🎙️ Web Speech API con Vocabolario Controllato (Slide 27)
Icona microfono: onde sonore animate e riconoscimento di comandi in italiano (*"prossima opera"*, *"ripeti spiegazione"*, *"mostrami il Bedoli"*, *"vai a Raffaello"*, *"dov'è il bagno"*, *"strada più facile"*, *"sali al primo piano"*).

### 4. ♿ Accessibilità Fisica e Cognitiva (Slide 24, 26)
Pannello dedicato: percorso *"Strada Facile"* senza barriere architettoniche né scale, ridimensionamento testi (100%-140%), regolazione velocità audio (0.75x-1.5x), contrasto elevato.

### 5. 🤖 Generative AI / LLM (Slide 33)
* **Creazione Item con AI:** In `/marketplace` -> *Crea Item*, click su *"🪄 Genera Testo con AI"* per generare spiegazioni con metadato `autore_contenuto: "AI"`.
* **Generazione Visite su Vincoli:** In `/marketplace` -> *Crea Visite*, click su *"⚡ Assistente AI: Genera su Vincoli"* con impostazione di durata (es. 45 min) e target.
* **Traduzione Real-Time Multilingua:** 🇮🇹 IT, 🇬🇧 EN, 🇪🇸 ES, 🇫🇷 FR, 🇩🇪 DE con audio TTS sincronizzato.
* **Adattamento Tono al Volo:** Riscrittura istantanea della guida (👶 Ragazzi, 👤 Standard, 🎓 Esperto).

### 6. 🎓 Sincronizzazione Real-Time Docente/Guida (`Fenice rossa`) & Quiz (Slide 31-32)
* **Docente:** Avvio sessione con nome mnemonico `"Fenice rossa"`, trasmissione posizione, cambio opera per tutti e broadcast audio.
* **Studente:** Collegamento con nome mnemonico; mappa e spiegazioni seguono in diretta il docente.
* **Quiz Finale:** Somministrazione a tutta la classe di 5 domande a risposta multipla con punteggio e statistiche in tempo reale.

---

## 🛠️ Stack Tecnologico

* **Backend:** Node.js, Express, MongoDB (Mongoose), Socket.io, Google TTS API.
* **Navigator Client:** React, Vite, Leaflet Indoor Mapping, Web Speech API.
* **Marketplace & Editor:** HTML5 semantico, TailwindCSS, Alpine.js (Vincolo no-framework rispettato).
* **Containerizzazione:** Docker & Docker Compose multi-stage.