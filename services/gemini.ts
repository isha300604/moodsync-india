
import { GoogleGenAI, Type } from "@google/genai";
import { UserInputData, MoodAnalysis } from "../types";

export const analyzeMoodAndRecommend = async (data: UserInputData): Promise<MoodAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `You are an expert AI psychologist and Indian lifestyle concierge. 
    Analyze the following detailed user profile to determine their precise mood and provide hyper-personalized recommendations.
    
    User Context:
    - Primary Thoughts: "${data.text}"
    - Gender Identity: ${data.gender}
    - Energy Level (1-5): ${data.energyLevel}
    - Social Context: ${data.socialContext}
    - Current Activity: ${data.activityContext}
    - Primary Goal: ${data.primaryGoal}
    - User Location: "${data.location}"

    Instructions:
    - Perform deep NLP-based sentiment analysis on the text combined with the provided context.
    - Classify mood into exactly one: Happy, Sad, Stressed, Excited, Neutral.
    - Provide recommendations specific to INDIA.
    - IMPORTANT: Use Gender Identity to tailor Shopping (Clothes/Makeup) and Lifestyle picks.
    - Use Indian platforms: Amazon.in, Myntra, Nykaa, Flipkart, Swiggy, Zomato, Blinkit, Zepto, Spotify, YouTube.
    - DO NOT provide any URLs or direct links. Just provide the name of the service/product and the platform where it can be found.
    - Tailor food suggestions based on activity and energy level.
    - Ensure all suggestions are relevant for the location: "${data.location}".
    - Output MUST be valid JSON matching the specified schema.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          mood: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          explanation: { type: Type.STRING },
          recommendations: {
            type: Type.OBJECT,
            properties: {
              shopping: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    platform: { type: Type.STRING }
                  },
                  required: ["title", "reason", "platform"]
                }
              },
              food: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    platform: { type: Type.STRING },
                    deliveryTime: { type: Type.STRING }
                  },
                  required: ["title", "reason", "platform"]
                }
              },
              music: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    platform: { type: Type.STRING }
                  },
                  required: ["title", "reason", "platform"]
                }
              },
              books: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    platform: { type: Type.STRING }
                  },
                  required: ["title", "reason", "platform"]
                }
              }
            },
            required: ["shopping", "food", "music", "books"]
          }
        },
        required: ["mood", "confidence", "explanation", "recommendations"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};
