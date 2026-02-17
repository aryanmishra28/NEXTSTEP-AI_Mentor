
require('dotenv').config({ path: '.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        // Note: listModels is on the genAI instance or model manager depending on SDK version?
        // In SDK 0.21.0, it's usually via a specific manager, but let's check basic usage or standard google pattern.
        // Actually, looking at docs, there isn't a direct 'listModels' on the main class in some versions,
        // but usually it's `genAI.getGenerativeModel` directly.
        // Wait, the error message itself says "Call ListModels to see the list of available models."

        // There isn't a direct helper in the high-level SDK for listModels sometimes, it might need the raw API.
        // However, let's try to infer or just try a standard alternative model first in a script to see if IT works.

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log("Attempting to generate content with gemini-1.5-flash...");
        const result = await model.generateContent("Hello");
        console.log("Success with gemini-1.5-flash:", result.response.text());
    } catch (error) {
        console.error("Error with gemini-1.5-flash:", error.message);
    }

    try {
        const model2 = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        console.log("Attempting to generate content with gemini-1.5-flash-latest...");
        const result2 = await model2.generateContent("Hello");
        console.log("Success with gemini-1.5-flash-latest:", result2.response.text());
    } catch (error) {
        console.error("Error with gemini-1.5-flash-latest:", error.message);
    }

    try {
        const model3 = genAI.getGenerativeModel({ model: "gemini-pro" });
        console.log("Attempting to generate content with gemini-pro...");
        const result3 = await model3.generateContent("Hello");
        console.log("Success with gemini-pro:", result3.response.text());
    } catch (error) {
        console.error("Error with gemini-pro:", error.message);
    }
}

listModels();
