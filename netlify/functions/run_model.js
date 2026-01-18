// netlify/functions/run_model.js
// Using Google Gemini API

const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { baseImage, prompt, negativePrompt } = JSON.parse(event.body);

    if (!baseImage || !prompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

    if (!GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY not configured');
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    console.log('Starting Gemini image generation...');

    // Create the image part
    const imagePart = {
      inlineData: {
        data: baseImage,
        mimeType: 'image/jpeg',
      },
    };

    // Enhanced prompt for better results
    const fullPrompt = `You are an expert AI photo editor specializing in hairstyle transformations.

TASK: Transform ONLY the hair in this photo while preserving everything else.

STYLE TO APPLY: ${prompt}

CRITICAL RULES:
- Keep face, skin tone, expression EXACTLY the same
- Keep background, clothing, lighting EXACTLY the same  
- ONLY change the hair to match the style description
- Make it look natural and photorealistic
- Match the original photo's lighting and quality

AVOID: ${negativePrompt || 'blurry, unrealistic, changed face, artifacts, poor quality'}

Describe the exact hairstyle transformation you would make in technical detail.`;

    const result = await model.generateContent([fullPrompt, imagePart]);
    const response = await result.response;
    const description = response.text();
    
    console.log('Gemini response:', description);

    // IMPORTANT NOTE: Gemini doesn't actually generate/edit images
    // It only analyzes and describes them
    // For actual image editing, you need Imagen API or another service
    
    // For now, return the original image with a note
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        generatedImageBase64: baseImage,
        aiDescription: description,
        note: 'Gemini API can only analyze images, not edit them. For actual hairstyle changes, you need Google Imagen API or another image generation service.',
        success: false
      }),
    };

  } catch (error) {
    console.error('Error:', error.message);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to process image',
        details: error.message,
      }),
    };
  }
};
