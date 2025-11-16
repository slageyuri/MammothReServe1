import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';

// Load environment: prefer .env.local (if present), then fall back to .env
dotenv.config({ path: '.env.local' });
dotenv.config();

const PORT = process.env.PORT || 5174;
const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;

if (!API_KEY) {
    console.error('GEMINI_API_KEY not set. Set it in your environment before starting the server.');
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const createSchemas = (Type) => {
    const alertResponseSchema = {
        type: Type.OBJECT,
        properties: {
            alertMessage: { type: Type.STRING },
        },
        required: ['alertMessage'],
    };

    const imageAnalysisSchema = {
        type: Type.OBJECT,
        properties: {
            foodName: { type: Type.STRING },
            summary: { type: Type.STRING },
            observations: { type: Type.ARRAY, items: { type: Type.STRING } },
            estimatedServings: { type: Type.NUMBER },
            estimatedWeightLbs: { type: Type.NUMBER },
        },
        required: ['foodName', 'summary', 'observations', 'estimatedServings', 'estimatedWeightLbs'],
    };

    return { alertResponseSchema, imageAnalysisSchema };
};

const { alertResponseSchema, imageAnalysisSchema } = createSchemas(Type);

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// If running in production, serve the built frontend from `dist`
if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// During development redirect the root to the Vite dev server so visiting
// http://localhost:<PORT> in a browser brings up the UI automatically.
if (process.env.NODE_ENV !== 'production') {
    app.get('/', (_req, res) => res.redirect('http://localhost:3000/'));
}

app.post('/api/genai/alert', async (req, res) => {
    try {
        const { foodItem, servings } = req.body || {};
        if (!foodItem || typeof servings !== 'number') {
            return res.status(400).json({ error: 'Missing foodItem or servings (number).' });
        }

        const prompt = `A university dining hall has a surplus of ${servings} servings of "${foodItem}". Generate a concise, urgent, and friendly alert message for local charities and students.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: alertResponseSchema,
                temperature: 0.7,
            },
        });

        // Debug: log raw SDK response and text for diagnosis
        try {
            console.log('GenAI alert raw response:', response);
            console.log('GenAI alert response.text:', typeof response?.text === 'function' ? response.text() : response?.text);
        } catch (logErr) {
            console.warn('Failed to log full GenAI alert response:', logErr);
        }

        const jsonText = (response).text?.trim?.() ?? '';
        const data = jsonText ? JSON.parse(jsonText) : {};
        return res.json({ alertMessage: data.alertMessage || `Alert: ${servings} servings of ${foodItem} are available for pickup now!` });
    } catch (err) {
        console.error('Alert generation error', err);
        return res.status(500).json({ error: 'Failed to generate alert.' });
    }
});

app.post('/api/genai/analyze', async (req, res) => {
    try {
        const { base64Image } = req.body || {};
        if (!base64Image) return res.status(400).json({ error: 'Missing base64Image in body.' });

        // Allow callers to send either a raw base64 string or a data URL
        // e.g. "data:image/png;base64,iVBOR...". Strip any data URL prefix
        // so we always pass raw base64 to the GenAI SDK and correctly detect mime.
        const rawBase64 = String(base64Image).replace(/^data:.*;base64,/, '');

        // Detect common base64 image signatures to set the correct mimeType
        let mimeType = 'application/octet-stream';
        if (rawBase64.startsWith('/9j/') || rawBase64.startsWith('/9j')) {
            mimeType = 'image/jpeg';
        } else if (rawBase64.startsWith('iVBOR') || rawBase64.startsWith('iVBORw')) {
            mimeType = 'image/png';
        }

        const imagePart = {
            inlineData: { mimeType, data: rawBase64 },
        };

        const textPart = {
            text: "Analyze this image of surplus food. Provide JSON with keys: foodName, summary, observations (array), estimatedServings (integer), estimatedWeightLbs (float).",
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [textPart, imagePart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: imageAnalysisSchema,
                temperature: 0,
            },
        });

        // Debug: log raw SDK response and text for diagnosis
        try {
            console.log('GenAI analyze raw response:', response);
            console.log('GenAI analyze response.text:', typeof response?.text === 'function' ? response.text() : response?.text);
        } catch (logErr) {
            console.warn('Failed to log full GenAI analyze response:', logErr);
        }

        const jsonText = (response).text?.trim?.() ?? '';
        const data = jsonText ? JSON.parse(jsonText) : {};

        return res.json({
            foodName: data.foodName || '',
            summary: data.summary || '',
            observations: data.observations || [],
            estimatedServings: data.estimatedServings ?? null,
            estimatedWeightLbs: data.estimatedWeightLbs ?? null,
        });
    } catch (err) {
        console.error('Image analysis error', err && (err.stack || err));
        return res.status(500).json({ error: 'Failed to analyze image.' });
    }
});

app.listen(PORT, () => {
    console.log(`Gemini proxy server listening on http://localhost:${PORT}`);
});
