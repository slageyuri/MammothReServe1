
import type { AIAnalysis } from '../types';

// The Google GenAI client depends on Node runtime features and should not be
// imported at module load time for browser bundles. We lazily import it only
// when running in a Node environment (server-side) so Vite doesn't attempt to
// bundle it for the client.

const API_KEY = typeof process !== 'undefined' ? (process.env.API_KEY || process.env.GEMINI_API_KEY) : undefined;

const createSchemas = (Type: any) => {
  const alertResponseSchema = {
    type: Type.OBJECT,
    properties: {
      alertMessage: {
        type: Type.STRING,
        description: "A concise, urgent, and friendly alert message for food banks and students. Include the food item and quantity.",
      },
    },
    required: ["alertMessage"],
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
    required: ["foodName", "summary", "observations", "estimatedServings", "estimatedWeightLbs"],
  };

  return { alertResponseSchema, imageAnalysisSchema };
};

export const generateAlertMessage = async (
  foodItem: string,
  servings: number
): Promise<{ alertMessage: string }> => {
  // If we don't have an API key or we're running in the browser, return a sensible fallback.
  // In the browser, route requests to the local proxy server (recommended).
  if (typeof window !== 'undefined') {
    try {
      // Try same-origin first (works if you proxy '/api' to the server).
      let resp = await fetch('/api/genai/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodItem, servings }),
      });

      if (!resp.ok) {
        // Fallback to explicit localhost server in dev
        resp = await fetch('http://localhost:5174/api/genai/alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ foodItem, servings }),
        });
      }

      if (!resp.ok) throw new Error('Server returned ' + resp.status);
      const data = await resp.json();
      return { alertMessage: data.alertMessage };
    } catch (err) {
      console.warn('Falling back to local alert message; server may be unavailable.', err);
      return {
        alertMessage: `Alert: ${servings} servings of ${foodItem} are available for pickup now! Please collect within the hour.`,
      };
    }
  }

  if (!API_KEY) {
    console.warn('Gemini API key not set; using fallback alert message.');
    return {
      alertMessage: `Alert: ${servings} servings of ${foodItem} are available for pickup now! Please collect within the hour.`,
    };
  }

  try {
    const mod: any = await import('@google/genai');
    const GoogleGenAI = mod.GoogleGenAI;
    const Type = mod.Type;
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const { alertResponseSchema } = createSchemas(Type);

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

    const jsonText = (response as any).text?.trim?.() ?? '';
    const data = jsonText ? JSON.parse(jsonText) : {};

    return {
      alertMessage: data.alertMessage || `Alert: ${servings} servings of ${foodItem} are available for pickup now!`,
    };
  } catch (error) {
    console.error('Error calling Gemini API for alert:', error);
    return {
      alertMessage: `Alert: ${servings} servings of ${foodItem} are available for pickup now! Please collect within the hour.`,
    };
  }
};

export const analyzeFoodImage = async (base64Image: string): Promise<AIAnalysis> => {
  // If we're in the browser, call the local proxy server. If that fails, fall back.
  if (typeof window !== 'undefined') {
    try {
      // Try same-origin first, then localhost fallback for dev server
      let resp = await fetch('/api/genai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Image }),
      });
      if (!resp.ok) {
        resp = await fetch('http://localhost:5174/api/genai/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64Image }),
        });
      }

      if (!resp.ok) throw new Error('Server returned ' + resp.status);
      const data = await resp.json();
      return {
        foodName: data.foodName || '',
        summary: data.summary || 'AI analysis could not be performed on the image.',
        observations: data.observations || ['Please describe the food manually.'],
        estimatedServings: data.estimatedServings ?? undefined,
        estimatedWeightLbs: data.estimatedWeightLbs ?? undefined,
      };
    } catch (err) {
      console.warn('Image analysis proxy unavailable, falling back.', err);
      return {
        foodName: '',
        summary: 'AI analysis could not be performed on the image.',
        observations: ['Please describe the food manually.'],
        estimatedServings: undefined,
        estimatedWeightLbs: undefined,
      };
    }
  }

  if (!API_KEY) {
    console.warn('Gemini API key not set; skipping image analysis.');
    return {
      foodName: '',
      summary: 'AI analysis could not be performed on the image.',
      observations: ['Please describe the food manually.'],
      estimatedServings: undefined,
      estimatedWeightLbs: undefined,
    };
  }

  try {
    const mod: any = await import('@google/genai');
    const GoogleGenAI = mod.GoogleGenAI;
    const Type = mod.Type;
    const { imageAnalysisSchema } = createSchemas(Type);
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image,
      },
    };

    const textPart = {
      text: "Analyze this image of surplus food. Follow these steps for a consistent result: 1. Identify the container (e.g., 'full standard catering tray'). 2. Identify the food itself. 3. Based on the container, food type, and standard portion sizes, provide a logical, integer estimate of the number of servings. 4. Based on the food type, density, and volume, provide a logical, float estimate of the food's total weight in pounds (lbs). 5. Provide a brief summary. 6. List 2-3 visual observations. Your response must be valid JSON matching the schema."
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

    const jsonText = (response as any).text?.trim?.() ?? '';
    const data = jsonText ? JSON.parse(jsonText) : {};

    return {
      foodName: data.foodName || 'Analysis failed',
      summary: data.summary || 'Could not generate summary.',
      observations: data.observations || ['No specific observations available.'],
      estimatedServings: data.estimatedServings ?? undefined,
      estimatedWeightLbs: data.estimatedWeightLbs ?? undefined,
    };
  } catch (error) {
    console.error('Error calling Gemini API for image analysis:', error);
    return {
      foodName: '',
      summary: 'AI analysis could not be performed on the image.',
      observations: ['Please describe the food manually.'],
      estimatedServings: undefined,
      estimatedWeightLbs: undefined,
    };
  }
};