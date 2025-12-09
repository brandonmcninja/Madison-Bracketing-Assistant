import { GoogleGenAI } from "@google/genai";
import { Competitor } from '../types';

export const analyzeOutliers = async (outliers: Competitor[]): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  // Sanitize data to send minimal necessary info to save tokens
  const outlierData = outliers.map(c => ({
    name: c.name,
    gender: c.gender,
    belt: c.belt,
    age: c.age,
    weight: c.weight,
    academy: c.academy
  }));

  const prompt = `
    You are an expert Jiu-Jitsu Tournament Director.
    I have a list of 'Outlier' competitors who could not be placed into standard brackets based on strict Madison Bracketing rules (weight/age gaps).
    
    Here is the list of unmatched competitors:
    ${JSON.stringify(outlierData)}

    Please analyze this list and suggest:
    1. Potential "Super Fights" (fair matches between 2 people who might be slightly outside standard weight/age limits but safe to fight).
    2. Suggested "Catch Weight" brackets (groups of 3 or 4) that might span belt colors (e.g., Purple/Brown mix) or age groups if safety permits.
    3. A brief summary of why these specific people were hard to match (e.g. "mostly heavyweights" or "mostly children").

    Format the output as a clean, markdown-formatted report.
  `;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 1024 } // Give it a moment to think about matches
      }
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return "Failed to analyze outliers. Please ensure the API key is valid and try again.";
  }
};