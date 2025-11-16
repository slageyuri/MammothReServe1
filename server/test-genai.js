import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load .env(.local)
dotenv.config({ path: '.env.local' });
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;

async function main() {
    if (!API_KEY) {
        console.error('No GEMINI_API_KEY found in environment. Please set it in .env.local or .env');
        process.exit(1);
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
        console.log('Sending test request to Gemini...');
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Provide a one-sentence summary: "Small test message."',
            config: { responseMimeType: 'text/plain', temperature: 0 },
        });

        console.log('Raw response object:', response);
        try {
            const text = typeof response.text === 'function' ? await response.text() : response.text;
            console.log('Response text:', text);
        } catch (e) {
            console.warn('Could not read response.text():', e);
        }

        console.log('Test request complete. If you see text above, the API key and client are working.');
    } catch (err) {
        console.error('Test request failed:', err && (err.stack || err));
        process.exit(1);
    }
}

main();
