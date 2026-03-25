const express = require('express');
const router = express.Router();
const googleTTS = require('google-tts-api');

// POST /api/ai/request/speak
router.post('/request/speak', async (req, res) => {
    try {
        const { text, lang = 'en', slow = false } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        // getAllAudioBase64 supports strings > 200 chars by chunking them automatically
        const data = await googleTTS.getAllAudioBase64(text, {
            lang,
            slow,
            host: 'https://translate.google.com',
            timeout: 10000,
        });

        // getAllAudioBase64 returns an array of objects: { shortText, base64 }
        // For HTML Audio, we might need to stitch them or play them in sequence, 
        // but it's simpler to send the raw array to the frontend so it can play them in order.
        // Wait, alternatively, if it's not too long, getAudioBase64 might be simpler, 
        // but for descriptions, > 200 is very common.
        // Let's return the array of base64 chunks
        
        const audioChunks = data.map(chunk => `data:audio/mp3;base64,${chunk.base64}`);

        res.json({ chunks: audioChunks });
    } catch (error) {
        console.error('Error in TTS generation:', error);
        res.status(500).json({ error: 'Failed to generate speech' });
    }
});

module.exports = router;
