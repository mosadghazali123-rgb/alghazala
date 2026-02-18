
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  constructor() {
    // API key is handled via process.env.API_KEY
  }

  async transformImage(base64Image: string, prompt: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-2.5-flash-image';
    
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: 'image/png',
              },
            },
            {
              text: prompt,
            },
          ],
        },
      });

      let resultImageUrl = '';
      if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64EncodeString = part.inlineData.data;
            resultImageUrl = `data:image/png;base64,${base64EncodeString}`;
            break;
          }
        }
      }

      if (!resultImageUrl) {
        throw new Error("No image was returned by the model.");
      }
      return resultImageUrl;
    } catch (error) {
      console.error("Image transform error:", error);
      throw error;
    }
  }

  async generateDescription(productName: string, category: string, lang: 'ar' | 'en', botanicalSource?: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-flash-preview';
    
    const botanicalPart = botanicalSource ? ` with botanical source "${botanicalSource}"` : "";
    const prompt = `Write a professional e-commerce product description for a product named "${productName}" in the category "${category}"${botanicalPart}. 
    The description should be in ${lang === 'ar' ? 'Arabic' : 'English'}. 
    Make it enticing, highlight natural quality (Al Ghazaly brand), and keep it under 100 words. 
    Focus on health benefits and purity.
    Return ONLY the description text without any titles, markdown headers, or extra talk.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: [{ parts: [{ text: prompt }] }],
    });

    return response.text?.trim() || "";
  }

  async generateVideo(prompt: string, config: { resolution: '720p' | '1080p', aspectRatio: '16:9' | '9:16' }, onProgress: (msg: string) => void): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    onProgress("Initiating magical generation...");
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: config.resolution,
        aspectRatio: config.aspectRatio
      }
    });

    onProgress("Weaving the pixels together...");
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      onProgress(this.getRandomReassuringMessage());
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed: No download link provided.");
    
    return `${downloadLink}&key=${process.env.API_KEY}`;
  }

  private getRandomReassuringMessage(): string {
    const messages = [
      "Still crafting your masterpiece...",
      "Polishing the golden details of your honey video...",
      "Almost there! Nature's beauty takes a moment to render...",
      "Adding the final touch of Al Ghazaly quality...",
      "Ensuring every drop looks pure and delicious..."
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
}

export const geminiService = new GeminiService();
