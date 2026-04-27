import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface BrandIdentity {
  name: string;
  tagline: string;
  description: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  imagePrompt: string;
}

export async function generateBrandDetails(businessIdea: string): Promise<BrandIdentity> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Create a comprehensive brand identity for this business idea: "${businessIdea}". 
    The identity should include a catchy brand name, a compelling tagline, a short mission description, 
    a professional color palette (hex codes), and a detailed prompt for an AI image generator to create a professional, minimal logo.
    
    The image prompt should describe a professional, high-quality, minimal logo on a clean white background. 
    It should focus on vector style, clean lines, and symbolic representation of the business.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Professional brand name" },
          tagline: { type: Type.STRING, description: "Short, catchy tagline" },
          description: { type: Type.STRING, description: "Brief mission or description of the business" },
          colorPalette: {
            type: Type.OBJECT,
            properties: {
              primary: { type: Type.STRING, description: "Primary brand color hex code" },
              secondary: { type: Type.STRING, description: "Secondary brand color hex code" },
              accent: { type: Type.STRING, description: "Accent brand color hex code" },
              background: { type: Type.STRING, description: "A neutral background color hex code that works with the palette" },
              text: { type: Type.STRING, description: "A high-contrast text color hex code" }
            },
            required: ["primary", "secondary", "accent", "background", "text"]
          },
          imagePrompt: { type: Type.STRING, description: "Detailed prompt for generating the logo image" }
        },
        required: ["name", "tagline", "description", "colorPalette", "imagePrompt"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Failed to generate brand details: Empty response from AI");
  }

  return JSON.parse(response.text.trim()) as BrandIdentity;
}

export async function generateLogo(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: [{ text: `Create a professional, high-end, minimal vector logo. ${prompt}. Clean white background, centered, sharp lines, commercial quality.` }],
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (!part || !part.inlineData) {
    throw new Error("Failed to generate logo image");
  }

  return `data:image/png;base64,${part.inlineData.data}`;
}
