import { useState } from 'react';
import { GeminiService } from './gemini-service';
import { Course } from './types';

interface UseGradeExtractionReturn {
  extracting: boolean;
  error: Error | null;
  uploadImage: (file: File) => Promise<Course[]>;
}

// Generate a random ID that works across all browsers
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

export function useGradeExtraction(): UseGradeExtractionReturn {
  const [extracting, setExtracting] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  const geminiService = new GeminiService();
  
  const uploadImage = async (file: File): Promise<Course[]> => {
    setExtracting(true);
    setError(null);
    
    try {
      const extractedCourses = await geminiService.extractCoursesFromImage(file);
      
      // Add IDs to the extracted courses
      const coursesWithIds = extractedCourses.map(course => ({
        ...course,
        id: generateId(),
        // Ensure grade is a number or null
        grade: typeof course.grade === 'number' ? course.grade : null,
        // Ensure units is a number
        units: typeof course.units === 'number' ? course.units : 0
      }));
      
      return coursesWithIds;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to extract grades from image');
      setError(error);
      throw error;
    } finally {
      setExtracting(false);
    }
  };
  
  return {
    extracting,
    error,
    uploadImage
  };
} 