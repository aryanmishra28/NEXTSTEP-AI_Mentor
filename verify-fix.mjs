
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

// Manual env file reading
const envPath = path.resolve('.env');
let apiKey = process.env.GEMINI_API_KEY;

if (!apiKey && fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split(/\r?\n/);
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('#') || trimmed === '') continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
            const key = trimmed.substring(0, eqIdx).trim();
            if (key === 'GEMINI_API_KEY') {
                let val = trimmed.substring(eqIdx + 1).trim();
                if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                    val = val.substring(1, val.length - 1);
                }
                apiKey = val;
            }
        }
    }
}

if (!apiKey) {
    console.error("No API Key found");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function testFix() {
    console.log("Testing gemini-2.0-flash...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await model.generateContent("Hello, can you confirm you are working?");
        console.log("Response:", result.response.text());
        console.log("✅ Verification Successful!");
    } catch (error) {
        console.error("❌ verification Failed:", error.message);
    }
}

testFix();
