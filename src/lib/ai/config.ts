import { GoogleGenAI } from "@google/genai";

// Initialize the Google GenAI client with API key
// The API key should be stored in an environment variable
export const getAIConfig = () => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("Missing Gemini API Key. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment variables.");
  }
  
  return new GoogleGenAI({ apiKey });
};

// Define the model to use
export const GEMINI_MODEL = "gemini-2.0-flash";

// Base URL for API requests
export const API_BASE_URL = "/api/gemini"; 