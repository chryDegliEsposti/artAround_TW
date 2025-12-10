const express = require('express');
const router = express.Router();

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({});


// GET /api/ai/generate_author_description/:authorName
router.get('/generate_author_description/:authorName', async (req, res) => {
    try {
        const { authorName } = req.params;

        // Initialize client with key from env
        // Note: Make sure GEMINI_API_KEY is set in .env
        const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const prompt = `
            Generate a JSON object for the artist/author "${authorName}" with the following fields:
            - birthDate (format YYYY-MM-DD, null if unknown)
            - deathDate (format YYYY-MM-DD, null if alive/unknown)
            - birthPlace (string)
            - descriptionShort (string, max 200 characters)
            - descriptionLong (string, detailed biography)
            
            Return ONLY the JSON object, no markdown formatting.
        `;

        const response = await client.models.generateContent({
            model: 'gemini-2.0-flash-exp', // Or 'gemini-1.5-flash' depending on availability
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                responseMimeType: 'application/json'
            }
        });

        const jsonString = response.response.candidates[0].content.parts[0].text;
        const authorData = JSON.parse(jsonString);

        res.json(authorData);

    } catch (err) {
        console.error("AI Generation Error:", err);
        res.status(500).json({ message: "Failed to generate author details", error: err.message });
    }
});

module.exports = router;

