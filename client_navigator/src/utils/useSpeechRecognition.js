import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Controlled Vocabulary Matcher
 * Analyzes natural Italian speech text and maps to predefined application commands.
 */
export function parseControlledVoiceCommand(text, pois = [], currentIndex = 0, itemsLength = 0) {
  if (!text || typeof text !== 'string') return { type: 'UNKNOWN', text: '' };

  const clean = text.toLowerCase().trim();

  // 1. Tour Navigation
  if (/\b(prossim[ao]|avanti|successiv[ao]|next|dopo)\b/.test(clean)) {
    return { type: 'NAV_NEXT', feedback: 'Passaggio alla prossima opera...' };
  }
  if (/\b(precedent[ei]|indietro|prim[ao]|prev|back)\b/.test(clean)) {
    return { type: 'NAV_PREV', feedback: 'Torno all\'opera precedente...' };
  }
  if (/\b(ripeti|riascolta|ricomincia|da capo)\b/.test(clean)) {
    return { type: 'AUDIO_REPLAY', feedback: 'Riascolto la spiegazione da capo...' };
  }
  if (/\b(pausa|ferma|stop|silenzio|blocca)\b/.test(clean)) {
    return { type: 'AUDIO_PAUSE', feedback: 'Riproduzione in pausa.' };
  }
  if (/\b(play|ascolta|spiega|descrivi|leggi|continua|riprendi|parla)\b/.test(clean)) {
    return { type: 'AUDIO_PLAY', feedback: 'Avvio della guida audio...' };
  }
  if (/\b(dettagli|informazioni|scheda|apri|espandi)\b/.test(clean)) {
    return { type: 'UI_EXPAND', feedback: 'Apro i dettagli del capolavoro...' };
  }
  if (/\b(chiudi|nascondi|mappa|riduci)\b/.test(clean)) {
    return { type: 'UI_COLLAPSE', feedback: 'Torno alla vista mappa...' };
  }

  // 2. Services & Facilities
  if (/\b(bagno|toilette|wc|servizi|servizio igienico)\b/.test(clean)) {
    const toilet = pois.find(p => p.type === 'restroom') || { type: 'restroom', name: 'Toilette', layerId: 1, position: { x: -200, y: 5000 } };
    return { type: 'TELEPORT_FACILITY', target: toilet, feedback: 'Ti porto alla toilette più vicina.' };
  }
  if (/\b(bar|caff[eè]|caffetteria|ristoro|ristorante|mangiare|bere)\b/.test(clean)) {
    const bar = pois.find(p => p.type === 'restaurant') || { type: 'restaurant', name: 'Caffetteria', layerId: 1, position: { x: -3000, y: 1000 } };
    return { type: 'TELEPORT_FACILITY', target: bar, feedback: 'Ti porto alla caffetteria del museo.' };
  }
  if (/\b(uscita|esci|emergenza|via d'uscita|fuori)\b/.test(clean)) {
    const exit = pois.find(p => p.type === 'exit') || { type: 'exit', name: 'Ingresso Principale', layerId: 1, position: { x: 0, y: 3800 } };
    return { type: 'TELEPORT_FACILITY', target: exit, feedback: 'Ti guido verso l\'uscita.' };
  }

  // 3. Floor Navigation
  if (/\b(sali|piano sopra|piano superiore|primo piano|layer 2|l2)\b/.test(clean)) {
    return { type: 'CHANGE_LAYER', layerId: 2, feedback: 'Passaggio al Primo Piano (L2).' };
  }
  if (/\b(scendi|piano sotto|piano terra|piano inferiore|layer 1|l1)\b/.test(clean)) {
    return { type: 'CHANGE_LAYER', layerId: 1, feedback: 'Passaggio al Piano Terra (L1).' };
  }

  // 4. Accessibility
  if (/\b(facile|senza scale|accessibil[ei]|disabil[ei]|ascensor[ei]|barriere)\b/.test(clean)) {
    return { type: 'TOGGLE_ACCESSIBILITY', feedback: 'Attivazione del percorso senza barriere architettoniche.' };
  }
  if (/\b(aiuto|comandi|cosa posso dire|istruzioni)\b/.test(clean)) {
    return { type: 'SHOW_HELP', feedback: 'Ecco i comandi vocali disponibili.' };
  }

  // 5. Artwork Voice Search (Teletrasporto per nome/artista/titolo)
  const exhibits = pois.filter(p => p.type === 'exhibit');
  for (const exhibit of exhibits) {
    const nameMatch = exhibit.name && clean.includes(exhibit.name.toLowerCase());
    const artistMatch = exhibit.artist && exhibit.artist.toLowerCase().split(' ').some(word => word.length > 3 && clean.includes(word));
    
    // Check specific known artists
    if (nameMatch || artistMatch ||
        (clean.includes('bedoli') && exhibit.artworkId === 'Q126599960') ||
        (clean.includes('raffaello') && exhibit.artworkId === 'Q2453886') ||
        (clean.includes('guido reni') && exhibit.artworkId === 'Q3824424') ||
        (clean.includes('carracci') && (exhibit.artworkId === 'Q3627389' || exhibit.artworkId === 'Q3618174')) ||
        (clean.includes('giotto') && exhibit.artworkId === 'Q3907519') ||
        (clean.includes('perugino') && exhibit.artworkId === 'Q3842426') ||
        (clean.includes('parmigianino') && exhibit.artworkId === 'Q3842416') ||
        (clean.includes('guercino') && exhibit.artworkId === 'Q3947885') ||
        (clean.includes('vitale') && exhibit.artworkId === 'Q3947230')
    ) {
      return { 
        type: 'TELEPORT_EXHIBIT', 
        target: exhibit, 
        feedback: `Ti teletrasporto davanti a: ${exhibit.name} (${exhibit.artist || 'Pinacoteca'}).` 
      };
    }
  }

  return { 
    type: 'UNKNOWN', 
    text: clean, 
    feedback: `Comando non riconosciuto: "${clean}". Prova a dire "prossima opera", "dov'è il bagno" o "vai a Raffaello".` 
  };
}

export function useSpeechRecognition({ onCommand, pois = [], currentIndex = 0, itemsLength = 0 }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastFeedback, setLastFeedback] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'it-IT';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const text = event.results[current][0].transcript;
      setTranscript(text);

      if (event.results[current].isFinal) {
        const parsed = parseControlledVoiceCommand(text, pois, currentIndex, itemsLength);
        setLastFeedback(parsed.feedback);
        if (onCommand) {
          onCommand(parsed);
        }
      }
    };

    recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setLastFeedback("Permesso microfono non concesso nel browser.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onCommand, pois, currentIndex, itemsLength]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setLastFeedback(null);
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn("Speech recognition start failed:", e);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const executeManualCommand = useCallback((commandText) => {
    setTranscript(commandText);
    const parsed = parseControlledVoiceCommand(commandText, pois, currentIndex, itemsLength);
    setLastFeedback(parsed.feedback);
    if (onCommand) {
      onCommand(parsed);
    }
  }, [onCommand, pois, currentIndex, itemsLength]);

  return {
    isListening,
    transcript,
    lastFeedback,
    isSupported,
    startListening,
    stopListening,
    executeManualCommand
  };
}
