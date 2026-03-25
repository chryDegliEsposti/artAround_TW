import { useState, useEffect, useCallback } from 'react';

export function useSpeaker() {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Fallback to clear speaking state if it goes out of sync with the browser API
    const checkState = setInterval(() => {
      // Handle edge cases where window.speechSynthesis isn't immediately ready
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        if (!window.speechSynthesis.speaking && isSpeaking) {
          setIsSpeaking(false);
        }
      }
    }, 1000);

    return () => clearInterval(checkState);
  }, [isSpeaking]);

  const speak = useCallback((text) => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) {
      console.log("[DEBUG] no text in speech")
      return;
    }
    console.log("[DEBUG] text", text)
    // Stop any currently playing audio
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Set up standard callbacks
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    utterance.onstart = () => setIsSpeaking(true);

    // Speak the text
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking };
}
