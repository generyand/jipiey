import { Course, CourseData } from "@/types";
import { API_BASE_URL } from "./config";

export class GeminiService {
  /**
   * Generate text content using the Gemini API
   * @param prompt The text prompt to send to Gemini
   * @returns The generated text response
   */
  async generateContent(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generateContent',
          data: { prompt }
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate content');
      }
      
      const data = await response.json();
      return data.result;
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
  async analyzeGPA(courses: Course[]): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'analyzeGPA',
          data: { courses }
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to analyze GPA');
      }
      
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Error analyzing GPA with Gemini:', error);
      throw error;
    }
  }

  /**
   * Extract course information from an uploaded image
   * @param imageFile The image file containing grade information
   * @returns Object containing structured response with success, error, message, courses, and uncertainty flag
   */
  async extractCoursesFromImage(imageFile: File): Promise<{ success: boolean, error: string | null, message: string, courses: CourseData[], uncertain: boolean }> {
    try {
      // Convert file to base64 to send to the API
      const base64Data = await this.fileToBase64(imageFile);
      
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'extractGrades',
          data: { 
            imageBase64: base64Data, 
            mimeType: imageFile.type
          }
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to extract courses from image');
      }
      
      const data = await response.json();
      
      // The API now returns the structured response directly
      return {
        success: data.success || false,
        error: data.error || null,
        message: data.message || 'Extraction completed',
        courses: data.courses || [],
        uncertain: data.uncertain || false
      };
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