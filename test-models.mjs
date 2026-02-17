
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

// Manual env file reading
const envPath = path.resolve('.env');
console.log("Reading .env from:", envPath);
let apiKey = process.env.GEMINI_API_KEY;

if (!apiKey && fs.existsSync(envPath)) {
    console.log(".env file found.");
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split(/\r?\n/); // Handle Windows line endings
    for (const line of lines) {
        // Basic parsing: KEY=VALUE or KEY="VALUE"
        const trimmed = line.trim();
        if (trimmed.startsWith('#') || trimmed === '') continue;

        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
            const key = trimmed.substring(0, eqIdx).trim();
            let val = trimmed.substring(eqIdx + 1).trim();

            // Remove quotes if present
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                val = val.substring(1, val.length - 1);
            }

            if (key === 'GEMINI_API_KEY') {
                apiKey = val;
                console.log("Found GEMINI_API_KEY in .env");
            }
        }
    }
} else if (apiKey) {
    console.log("GEMINI_API_KEY found in process.env");
} else {
    console.log(".env not found or empty.");
}

if (!apiKey) {
    console.error("Could not find GEMINI_API_KEY.");
    // process.exit(1); 
    // Let's try to proceed? No, API needs key.
} else {
    console.log("API Key loaded (length: " + apiKey.length + ")");
}

const genAI = new GoogleGenerativeAI(apiKey);

async function testModel(modelName) {
    console.log(`\nTesting model: ${modelName}`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, just checking availability.");
        console.log(`✅ Success with ${modelName}:`, result.response.text());
    } catch (error) {
        console.error(`❌ Error with ${modelName}:`, error.message);
    }
}

async function run() {
    if (apiKey) {
        await testModel("gemini-2.5-flash");
        await testModel("gemini-2.0-flash");
        await testModel("gemini-flash-latest");
        await testModel("gemini-pro-latest");
    }
}

run();
