// netlify/functions/tryon.mjs

// 1. Use ES Module syntax for reliable import/export
import { GoogleGenAI } from '@google/genai';

// Helper function to create the Part object for image input
function base64ToGenerativePart(base64Data, mimeType) {
  return {
    inlineData: {
      data: base64Data,
      mimeType
    },
  };
}

// Handler must be exported as a named 'handler' function for Netlify
export async function handler(event) {
  
  // 2. FIX: Explicitly pass the API key from the environment to the constructor.
  // This resolves the "Could not load the default credentials" error.
  const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY 
  }); 

  // Basic method check
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { baseImage, prompt } = JSON.parse(event.body);

    if (!baseImage || !prompt) {
      return { statusCode: 400, body: 'Missing baseImage or prompt in request body.' };
    }

    // Prepare the image part (Gemini 2.5 Flash supports inline Base64)
    const imagePart = base64ToGenerativePart(baseImage, "image/jpeg");

    // Call the Nano Banana (Gemini 2.5 Flash Image) model
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // The model ID for image generation/editing
      contents: [
        imagePart,
        { text: prompt }, // The instruction for the AI (apply new hairstyle)
      ],
    });
    
    // Extract the generated image (Base64 data)
    const generatedImageBase64 = response.candidates[0].content.parts[0].inlineData.data;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        generatedImageBase64: generatedImageBase64,
      }),
    };

  } catch (error) {
    console.error('AI Processing Error:', error);
    // Return a 500 status with the error message
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `AI Processing Failed: ${error.message}. Check Netlify function logs for stack trace.` }),
    };
  }
}
