const express = require('express');
const router = express.Router();
const googleTTS = require('google-tts-api');
const aiService = require('../../services/ai.service');

/**
 * POST /api/v1/navigator/ai/generate-item
 * Generates an artwork Item explanation with multi-duration and language levels
 */
router.post('/generate-item', async (req, res) => {
    try {
        const { title, author, style, length, languageLevel } = req.body;
        const result = await aiService.generateItemDescription({ title, author, style, length, languageLevel });
        res.json(result);
    } catch (error) {
        console.error('Error in /generate-item:', error);
        res.status(500).json({ error: 'Errore durante la generazione dell\'item AI' });
    }
});

/**
 * POST /api/v1/navigator/ai/generate-visit
 * Generates an optimized visit tour with constraints (duration, audience, theme)
 */
router.post('/generate-visit', async (req, res) => {
    try {
        const { duration, targetAudience, theme, museumId } = req.body;
        const result = await aiService.generateVisitPlan({ duration, targetAudience, theme, museumId });
        res.json(result);
    } catch (error) {
        console.error('Error in /generate-visit:', error);
        res.status(500).json({ error: 'Errore durante la generazione del percorso visita AI' });
    }
});

/**
 * POST /api/v1/navigator/ai/translate
 * Real-time translation into target language
 */
router.post('/translate', async (req, res) => {
    try {
        const { text, targetLang, sourceLang } = req.body;
        const result = await aiService.translateText({ text, targetLang, sourceLang });
        res.json(result);
    } catch (error) {
        console.error('Error in /translate:', error);
        res.status(500).json({ error: 'Errore durante la traduzione' });
    }
});

/**
 * POST /api/v1/navigator/ai/adapt-tone
 * Real-time tone rewriting (infantile, elementare, medio, specialistico)
 */
router.post('/adapt-tone', async (req, res) => {
    try {
        const { text, targetLevel, title, artist } = req.body;
        const result = await aiService.adaptTone({ text, targetLevel, title, artist });
        res.json(result);
    } catch (error) {
        console.error('Error in /adapt-tone:', error);
        res.status(500).json({ error: 'Errore durante l\'adattamento del tono' });
    }
});

/**
 * POST /api/v1/navigator/ai/request/speak
 * Text-to-speech audio chunks via Google TTS API
 */
router.post('/request/speak', async (req, res) => {
    try {
        const { text, lang = 'it', slow = false } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const data = await googleTTS.getAllAudioBase64(text, {
            lang,
            slow,
            host: 'https://translate.google.com',
            timeout: 10000,
        });

        const audioChunks = data.map(chunk => `data:audio/mp3;base64,${chunk.base64}`);

        res.json({ chunks: audioChunks });
    } catch (error) {
        console.error('Error in TTS generation:', error);
        res.status(500).json({ error: 'Failed to generate speech' });
    }
});

module.exports = router;

