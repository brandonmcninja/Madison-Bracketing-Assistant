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
    You are an expert Jiu-Jitsu Tournament Director helping to clean up 'Outliers'.
    
    Here is the list of unmatched competitors:
    ${JSON.stringify(outlierData)}

    Please analyze this list and suggest specific matches or strategies to place them.
    Focus on these specific strategies:
    1. **Bumping Up Age:** Suggest moving older teens (13-15) into Adult divisions if weights align.
    2. **Dropping Down Age:** Suggest moving Masters (35+) down to Adult (16+) if weights align.
    3. **Bumping Up Skill:** Suggest combining belt levels (e.g. Purple vs Brown) for a "Super Fight" or mixed bracket.
    4. **Catch Weights:** Identify 2-4 people who are safe to fight despite being outside standard brackets.

    Format the output as a clean, actionable markdown report.
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