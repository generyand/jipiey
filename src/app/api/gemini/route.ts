import { GoogleGenAI, createUserContent } from "@google/genai";
import { NextResponse } from "next/server";
import { Course, CourseData } from "@/types";

// Initialize the Gemini API client with server-side API key
const initGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("Missing Gemini API key");
  }
  
  return new GoogleGenAI({ apiKey });
};

// Define types for API requests
interface AnalyzeGPARequest {
  courses: Course[];
}

interface ExtractGradesRequest {
  imageBase64: string;
  mimeType: string;
}

interface GenerateContentRequest {
  prompt: string;
}

type RequestData = {
  action: "analyzeGPA";
  data: AnalyzeGPARequest;
} | {
  action: "extractGrades";
  data: ExtractGradesRequest;
} | {
  action: "generateContent";
  data: GenerateContentRequest;
};

export async function POST(request: Request) {
  try {
    const requestData = await request.json() as RequestData;
    const { action, data } = requestData;
    const gemini = initGeminiClient();
    
    // Default model
    const model = "gemini-2.0-flash";
    
    // Handle different actions
    switch (action) {
      case "generateContent": {
        const { prompt } = data;
        
        const response = await gemini.models.generateContent({
          model,
          contents: [createUserContent(prompt)]
        });
        
        if (!response.text) {
          return NextResponse.json({ error: "Empty response from Gemini API" }, { status: 500 });
        }
        
        return NextResponse.json({ result: response.text });
      }
      
      case "analyzeGPA": {
        const { courses } = data;
        
        // Format the courses data for the prompt
        const courseData = courses.map((course: Course, index: number) => {
          return `${index + 1}. ${course.title || 'Untitled Course'} (${course.units} units): Grade ${course.grade || 'N/A'}`;
        }).join('\n');
        
        const prompt = `
          I have the following courses and grades:
          ${courseData}
          
          Please analyze this data and provide:
          1. Brief analysis of the current performance
          2. Suggestions for potential areas of improvement
          3. Any patterns you observe in the grades
          4. Tips for maintaining or improving my GPA
        `;
        
        const response = await gemini.models.generateContent({
          model,
          contents: [createUserContent(prompt)]
        });
        
        if (!response.text) {
          return NextResponse.json({ error: "Empty response from Gemini API" }, { status: 500 });
        }
        
        return NextResponse.json({ result: response.text });
      }
        
      case "extractGrades": {
        const { imageBase64, mimeType } = data;
        
        const prompt = `
          Please extract course information from this image containing grades or academic records.
          For each course, identify:
          1. Course Title (if available)
          2. Units/Credits
          3. Grade (as a number between 0-4)
          
          Return your answer as a JSON object with this format:
          {
            "courses": [
              {
                "title": "Course name",
                "units": number of units (as a number),
                "grade": numeric grade (as a number between 0-4)
              }
            ],
            "uncertain": boolean (true if you cannot clearly distinguish between units and grades columns)
          }

          Important: 
          - Make sure to convert any letter grades (A, B, C, etc.) to their numeric equivalent on a 4.0 scale
          - If you're unsure about any value, use null
          - Make sure the JSON is valid and properly formatted
          - CRITICAL DISTINCTION: Units MUST be whole numbers (integers like 1, 2, 3, 4) WITHOUT ANY decimal places
          - Units are almost always between 1-6
          - Grades CAN and OFTEN DO have decimal places (like 3.0, 3.5, 2.7, 4.0) 
          - Grades typically range from 0.0 to 4.0
          - If you see a column with decimal numbers, those are almost certainly grades, NOT units
          - If you're unsure which column is which, units are ALWAYS whole numbers without decimals
          - SET "uncertain": true if you cannot clearly distinguish which column contains units vs grades
          - SET "uncertain": true if the data layout is confusing or ambiguous
          - Only return the JSON object, nothing else
        `;
        
        const response = await gemini.models.generateContent({
          model,
          contents: [{
            role: "user",
            parts: [
              { text: prompt },
              { inlineData: { data: imageBase64, mimeType } }
            ]
          }]
        });
        
        if (!response.text) {
          return NextResponse.json({ error: "Empty response from Gemini API" }, { status: 500 });
        }
        
        // Extract JSON from response
        let jsonText = response.text;
        const startIndex = jsonText.indexOf('{');
        const endIndex = jsonText.lastIndexOf('}');
        
        if (startIndex === -1 || endIndex === -1) {
          return NextResponse.json({ error: "Could not find valid JSON in API response" }, { status: 500 });
        }
        
        jsonText = jsonText.substring(startIndex, endIndex + 1);
        const extractedData = JSON.parse(jsonText) as { courses: CourseData[], uncertain?: boolean };
        
        return NextResponse.json({ 
          result: extractedData.courses,
          uncertain: extractedData.uncertain || false
        });
      }
        
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in Gemini API route:", error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 