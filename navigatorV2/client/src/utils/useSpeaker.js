import { useState, useCallback, useRef, useEffect } from 'react';

export function useSpeaker() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  const abortControllerRef = useRef(null);
  const currentTextRef = useRef(null);

  // Initialize the audio element once (run in browser environment only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio();
      audioRef.current = audio;

      const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
      };
      const handleEnded = () => setIsSpeaking(false);
      const handlePlay = () => setIsSpeaking(true);
      const handlePause = () => setIsSpeaking(false);
      const handleError = (e) => {
        if (!audio.src || audio.src === window.location.href || audio.src.endsWith('/')) return;
        console.error("Audio playback error:", e);
        setIsSpeaking(false);
      };

      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('error', handleError);

      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('error', handleError);
      };
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.currentTime = 0;
    }
    currentTextRef.current = null;
    currentIdRef.current = null;
    setIsSpeaking(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const seek = useCallback((time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const currentIdRef = useRef(null);

  const speak = useCallback(async (text, id = null) => {
    if (!text || typeof window === 'undefined') {
      return;
    }

    const identifier = id !== null ? id : text;

    if (identifier === currentIdRef.current && audioRef.current && audioRef.current.src) {
      audioRef.current.play().catch(e => {
        console.error("Audio playback error:", e);
        setIsSpeaking(false);
      });
      return;
    }

    // Unlock audio instantly inside the synchronous execution stack of the user gesture
    if (audioRef.current) {
      const p = audioRef.current.play();
      if (p !== undefined) p.catch(() => {});
    }

    // Stop current audio and abort any pending fetches
    stop();
    currentTextRef.current = text;
    currentIdRef.current = identifier;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsSpeaking(true);

    try {
      const response = await fetch('/api/ai/request/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang: 'en', slow: false }),
        signal: controller.signal
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      
      if (data.chunks && data.chunks.length > 0) {
        // Stitch base64 array into a single Uint8Array for the blob
        const byteArrays = data.chunks.map(chunk => {
          const b64 = chunk.split(',')[1];
          const binStr = window.atob(b64);
          const arr = new Uint8Array(binStr.length);
          for (let i = 0; i < binStr.length; i++) {
            arr[i] = binStr.charCodeAt(i);
          }
          return arr;
        });

        const blob = new Blob(byteArrays, { type: 'audio/mp3' });
        const url = URL.createObjectURL(blob);
        
        const audio = audioRef.current;
        audio.src = url;
        audio.play().catch(e => {
          console.error("Audio playback error:", e);
          setIsSpeaking(false);
        });
      } else {
        setIsSpeaking(false);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('TTS Error:', error);
        setIsSpeaking(false);
      }
    }
  }, [stop]);

  return { speak, pause, stop, seek, isSpeaking, currentTime, duration };
}
