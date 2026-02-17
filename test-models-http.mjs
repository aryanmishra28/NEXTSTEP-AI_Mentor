
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

console.log("Fetching models list...");

async function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`HTTP Error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error("Response:", text);
            return;
        }
        const data = await response.json();
        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                console.log(`- ${m.name} (${m.displayName})`);
                if (m.supportedGenerationMethods) {
                    console.log(`  Methods: ${m.supportedGenerationMethods.join(', ')}`);
                }
            });
        } else {
            console.log("No models found in response:", data);
        }
    } catch (err) {
        console.error("Fetch error:", err);
    }
}

listModels();
