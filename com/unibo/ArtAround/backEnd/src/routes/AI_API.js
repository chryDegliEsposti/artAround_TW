const express = require('express');
const router = express.Router();
const fetch = require('node-fetch'); // Ensure node-fetch is available or use native fetch in newer Node

// GET /api/ai/generate_author_description/:authorName
router.get('/generate_author_description/:authorName', async (req, res) => {
    try {
        const { authorName } = req.params;
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ message: "OPENROUTER_API_KEY is missing in .env" });
        }

        const prompt = `
            Generate a JSON object for the artist/author "${authorName}" with the following fields:
            - birthDate (format YYYY-MM-DD, null if unknown)
            - deathDate (format YYYY-MM-DD, null if alive/unknown)
            - birthPlace (string)
            - descriptionShort (string, max 200 characters)
            - descriptionLong (string, detailed biography)
            
            Return ONLY the JSON object, no markdown formatting.
        `;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-flash-exp:free",
                "messages": [
                    { "role": "user", "content": prompt }
                ]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || "OpenRouter API Error");
        }

        let jsonString = data.choices[0].message.content;
        // Clean cleanup markdown block if present
        jsonString = jsonString.replace(/```json\n?|```/g, '').trim();

        const authorData = JSON.parse(jsonString);
        console.log(authorData);
        res.json(authorData);

    } catch (err) {
        console.error("AI Generation Error:", err);
        res.status(500).json({ message: "Failed to generate author details", error: err.message });
    }
});


// POST /api/ai/generate_item_descriptions
router.post('/generate_item_descriptions', async (req, res) => {
    try {
        const { title, author } = req.body;
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }
        if (!apiKey) {
            return res.status(500).json({ message: "OPENROUTER_API_KEY is missing in .env" });
        }

        const prompt = `
            Generate 9 descriptions for the art item "${title}" by author "${author || 'unknown'}".
            The descriptions must vary by length (short, medium, long) and complexity/difficulty (easy, medium, hard).
            The descriptions must be in Italian.
            
            Return a JSON object with exactly these keys:
            - description_short_easy
            - description_short_medium
            - description_short_hard
            - description_medium_easy
            - description_medium_medium
            - description_medium_hard
            - description_long_easy
            - description_long_medium
            - description_long_hard

            "short": ~1-2 sentences.
            "medium": ~3-4 sentences.
            "long": ~5-8 sentences.
            "easy": simple vocabulary, for children or general audience.
            "medium": standard vocabulary.
            "hard": academic/technical vocabulary.

            Return ONLY the JSON object, no markdown.
        `;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-flash-exp:free",
                "messages": [
                    { "role": "user", "content": prompt }
                ]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || "OpenRouter API Error");
        }

        let jsonString = data.choices[0].message.content;
        jsonString = jsonString.replace(/```json\n?|```/g, '').trim();

        const descriptions = JSON.parse(jsonString);
        res.json(descriptions);

    } catch (err) {
        console.error("AI Generation Error:", err);
        res.status(500).json({ message: "Failed to generate item descriptions", error: err.message });
    }
});

module.exports = router;

