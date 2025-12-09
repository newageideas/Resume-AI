import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ResumeData, AnalysisResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const resumeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    fullName: { type: Type.STRING },
    title: { type: Type.STRING },
    contact: {
      type: Type.OBJECT,
      properties: {
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        location: { type: Type.STRING },
        linkedin: { type: Type.STRING },
        website: { type: Type.STRING },
        photo: { type: Type.STRING }
      },
      required: ["email"]
    },
    summary: { type: Type.STRING },
    experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          company: { type: Type.STRING },
          role: { type: Type.STRING },
          start: { type: Type.STRING },
          end: { type: Type.STRING },
          description: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      }
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          school: { type: Type.STRING },
          degree: { type: Type.STRING },
          year: { type: Type.STRING }
        }
      }
    },
    skills: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  }
};

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.INTEGER, description: "A score from 0 to 100 based on fit for the job description." },
    summary: { type: Type.STRING, description: "A 2-3 sentence summary of the resume's fit." },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 3-5 key strengths."
    },
    improvements: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 3-5 specific actionable improvements."
    },
    missingKeywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of important keywords from the JD missing in the resume."
    }
  }
};

const cleanJsonString = (str: string): string => {
  return str.replace(/```json\n?|\n?```/g, '').trim();
};

export const parseResumeFromText = async (text: string): Promise<ResumeData> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your configuration.");
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Parse the following resume text into a structured JSON format. 
      Text: "${text}"
      If specific fields are missing, leave them as empty strings or empty arrays.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: resumeSchema
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("AI returned empty response.");
    
    return JSON.parse(cleanJsonString(jsonText)) as ResumeData;
  } catch (error) {
    console.error("Error parsing resume:", error);
    throw new Error("Failed to parse resume content. Please ensure the text is clear and try again.");
  }
};

export const analyzeResumeFit = async (resume: ResumeData, jobDescription: string): Promise<AnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your configuration.");
  }

  try {
    const resumeStr = JSON.stringify(resume);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert hiring manager and resume coach. Analyze the following resume against the job description provided.
      
      Resume JSON:
      ${resumeStr}

      Job Description:
      ${jobDescription}

      Provide a strict and honest score (0-100), summary, strengths, specific improvements to tailor the resume to the JD, and missing keywords.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("AI returned empty response.");
    
    return JSON.parse(cleanJsonString(jsonText)) as AnalysisResult;
  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw new Error("Failed to analyze resume. Please try again.");
  }
};

export const generateExperienceSuggestions = async (role: string): Promise<string[]> => {
  if (!apiKey) throw new Error("API Key is missing.");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate 5 professional, impact-driven resume bullet points for the role of "${role}". 
      Focus on quantifiable achievements, strong action verbs, and specific skills.
      Return purely a JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("AI returned empty response.");
    
    return JSON.parse(cleanJsonString(jsonText)) as string[];
  } catch (error) {
    console.error("Error generating suggestions:", error);
    throw new Error("Failed to generate suggestions.");
  }
};