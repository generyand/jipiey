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
          Analyze this image to extract course information from academic records, transcripts, or grade reports.
          
          FIRST: Determine if this image contains academic/educational content:
          - Look for course names, grades, units/credits, transcripts, grade reports
          - Academic tables with course information
          - Educational institution documents
          
          IF NO ACADEMIC CONTENT FOUND:
          Return this exact JSON:
          {
            "success": false,
            "error": "no_academic_content",
            "message": "This image does not appear to contain academic records or course information.",
            "courses": [],
            "uncertain": false
          }
          
          IF ACADEMIC CONTENT FOUND:
          Extract course information with these rules:
          
          MANDATORY COLUMN IDENTIFICATION RULES:
          
          1. DECIMAL DETECTION RULE (ABSOLUTE):
             - If you see ANY column with decimal values (like 3.5, 2.7, 4.0, 1.3), that column is AUTOMATICALLY the GRADES column
             - The other numerical column (with whole numbers) is AUTOMATICALLY the UNITS column
             - This rule is NON-NEGOTIABLE and overrides any other interpretation
          
          2. COLUMN PAIRING LOGIC (REQUIRED):
             - FIRST: Search the entire image for ANY column containing decimal values
             - IF found: Decimal column = GRADES, Other numerical column = UNITS
             - IF no decimal column exists: Look for two numerical columns and try to identify based on typical ranges
             - Units are typically 1-6 (whole numbers only)
             - Grades are typically 0.0-4.0 (can have decimals)
          
          3. UNCERTAINTY CONDITIONS (AUTOMATIC):
             - SET "uncertain": true if you find decimal values in what appears to be a units column
             - SET "uncertain": true if ALL numerical columns contain only whole numbers AND you cannot distinguish which is which
             - SET "uncertain": true if there are no clear numerical columns for both units and grades
             - SET "uncertain": true if the image layout is too unclear to identify columns
          
          4. DATA VALIDATION (STRICT):
             - Units MUST be whole numbers (1, 2, 3, 4, 5, 6) - NEVER decimals
             - Grades CAN be decimals (3.5, 2.7, 4.0) or whole numbers (3, 4, 2)
             - Convert letter grades (A, B, C, etc.) to numeric equivalent on 4.0 scale
             - Use null for any unclear values
          
          5. PROCESSING ORDER (MANDATORY):
             Step 1: Check if image contains academic content
             Step 2: Scan entire image for decimal values
             Step 3: If decimals found → Decimal column = Grades, Other = Units
             Step 4: If no decimals → Try to identify by typical ranges and context
             Step 5: If still unclear → Return "uncertain": true
          
          FOR SUCCESSFUL EXTRACTION, return this exact JSON format:
          {
            "success": true,
            "error": null,
            "message": "Successfully extracted course information.",
            "courses": [
              {
                "title": "Course name or null",
                "units": whole_number_only,
                "grade": numeric_grade_0_to_4
              }
            ],
            "uncertain": boolean
          }
          
          FOR UNCERTAIN EXTRACTION, return this exact JSON format:
          {
            "success": false,
            "error": "uncertain_data",
            "message": "Could not clearly distinguish between units and grades columns.",
            "courses": [],
            "uncertain": true
          }
          
          Return ONLY valid JSON, nothing else.
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

        console.log('Gemini API Response:', JSON.stringify(response, null, 2));
        
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
        
        try {
          const extractedData = JSON.parse(jsonText) as {
            success: boolean;
            error: string | null;
            message: string;
            courses: CourseData[];
            uncertain: boolean;
          };
          
          // Return the structured response directly
          return NextResponse.json({
            success: extractedData.success,
            error: extractedData.error,
            message: extractedData.message,
            courses: extractedData.courses,
            uncertain: extractedData.uncertain
          });
        } catch (parseError) {
          console.error('Error parsing JSON response:', parseError);
          return NextResponse.json({ 
            error: "Failed to parse AI response as valid JSON" 
          }, { status: 500 });
        }
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