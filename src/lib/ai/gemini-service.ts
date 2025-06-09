import { GoogleGenAI, createUserContent } from "@google/genai";
import { getAIConfig, GEMINI_MODEL } from "./config";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = getAIConfig();
  }

  /**
   * Generate text content using the Gemini API
   * @param prompt The text prompt to send to Gemini
   * @returns The generated text response
   */
  async generateContent(prompt: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [createUserContent(prompt)]
      });
      
      if (!response.text) {
        throw new Error('Empty response from Gemini API');
      }
      
      return response.text;
    } catch (error) {
      console.error('Error generating content with Gemini:', error);
      throw error;
    }
  }

  /**
   * Analyze GPA data and provide insights using the Gemini API
   * @param courses Array of course objects with units and grades
   * @returns Analysis and recommendations based on the course data
   */
  async analyzeGPA(courses: any[]): Promise<string> {
    try {
      // Format the courses data for the prompt
      const courseData = courses.map((course, index) => {
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
      
      const response = await this.ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [createUserContent(prompt)]
      });
      
      if (!response.text) {
        throw new Error('Empty response from Gemini API');
      }
      
      return response.text;
    } catch (error) {
      console.error('Error analyzing GPA with Gemini:', error);
      throw error;
    }
  }

  /**
   * Extract course information from an uploaded image
   * @param imageFile The image file containing grade information
   * @returns Array of extracted courses with title, units, and grades
   */
  async extractCoursesFromImage(imageFile: File): Promise<any[]> {
    try {
      // For vision tasks, use the multimodal model (gemini-2.0-flash is multimodal)
      const model = GEMINI_MODEL; // Use the same model as defined in config.ts

      // Convert file to base64 to send to the API
      const base64Data = await this.fileToBase64(imageFile);
      
      const prompt = `
        Please extract course information from this image containing grades or academic records.
        For each course, identify:
        1. Course Title (if available)
        2. Units/Credits
        3. Grade (as a number between 0-4)
        
        Return your answer as a JSON array with objects in this format:
        [
          {
            "title": "Course name",
            "units": number of units (as a number),
            "grade": numeric grade (as a number between 0-4)
          }
        ]

        Important: 
        - Make sure to convert any letter grades (A, B, C, etc.) to their numeric equivalent on a 4.0 scale
        - If you're unsure about any value, use null
        - Only return the JSON array, nothing else
        - Make sure the JSON is valid and properly formatted
        - If there are no column headers, note that units/credits are typically whole numbers (like 3, 4), while grades often have decimal points (like 3.0, 3.5, 2.7)
        - Units typically range from 1-6, while grades typically range from 0-4
      `;

      // Create content with image and prompt
      const response = await this.ai.models.generateContent({
        model: model,
        contents: [{
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { data: base64Data, mimeType: imageFile.type } }
          ]
        }]
      });

      if (!response.text) {
        throw new Error('Empty response from Gemini API');
      }

      // Parse the JSON response - Use a more compatible regex
      let jsonText = response.text;
      
      // Remove any text before the first '[' and after the last ']'
      const startIndex = jsonText.indexOf('[');
      const endIndex = jsonText.lastIndexOf(']');
      
      if (startIndex === -1 || endIndex === -1) {
        throw new Error('Could not find valid JSON in API response');
      }
      
      jsonText = jsonText.substring(startIndex, endIndex + 1);
      const courses = JSON.parse(jsonText);

      return courses;
    } catch (error) {
      console.error('Error extracting courses from image:', error);
      throw error;
    }
  }

  /**
   * Helper function to convert File to base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the prefix like "data:image/jpeg;base64," to get just the base64 data
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to read file as data URL'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsDataURL(file);
    });
  }
} 