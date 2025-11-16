import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-2.5-flash-image';
// A more direct and simpler prompt for the model to improve reliability.
const restorationPrompt = `Restore this old photograph. Colorize the image, remove scratches and noise, and enhance the quality and sharpness. Output only the restored image.`;

export async function restorePhoto(base64Data: string, mimeType: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: restorationPrompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const firstPart = response.candidates?.[0]?.content?.parts?.[0];
    if (firstPart && firstPart.inlineData) {
      const restoredBase64 = firstPart.inlineData.data;
      const restoredMimeType = firstPart.inlineData.mimeType;
      return `data:${restoredMimeType};base64,${restoredBase64}`;
    } else {
      // If no image is returned, check for a text response which might explain why.
      const textResponse = response.text?.trim();
      if (textResponse) {
          console.error("Gemini API returned a text response instead of an image:", textResponse);
          throw new Error(`The model couldn't restore the photo and responded with: "${textResponse}"`);
      }
      throw new Error('No image data found in the API response. The model may have failed to process the request.');
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Failed to restore photo. The API call returned an error.");
  }
}
