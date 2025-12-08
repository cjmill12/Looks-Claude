// netlify/functions/tryon.js

// 🚨 FIX: Correctly import the GoogleGenAI constructor from the module object 
// to work around Netlify/esbuild bundling issues.
const genAIModule = require('@google/genai'); 
const GoogleGenAI = genAIModule.GoogleGenAI; 

// Helper function to create the Part object for image input
function base64ToGenerativePart(base64Data, mimeType) {
  return {
    inlineData: {
      data: base64Data,
      mimeType
    },
  };
}

exports.handler = async (event) => {
  // 🚨 FIX: Initialize the AI client INSIDE the handler.
  // This ensures 'ai' is scoped locally for each function invocation 
  // and uses the correctly resolved constructor.
  const ai = new GoogleGenAI({}); 

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
    
    // Extract the generated image (Base64 data) from the response
    // The image data is found in the first part of the first candidate
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
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Failed to process image with AI model: ${error.message}` }),
    };
  }
};
