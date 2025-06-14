import { useState } from 'react';
import { GeminiService } from './gemini-service';
import { Course } from '@/types';

export interface GradeExtractionResult {
  success: boolean;
  error: string | null;
  message: string;
  courses: Course[];
  uncertain: boolean;
}

export function useGradeExtraction() {
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const geminiService = new GeminiService();
  
  const extractGrades = async (imageFile: File): Promise<GradeExtractionResult | null> => {
    setIsExtracting(true);
    setError(null);
    
    try {
      const result = await geminiService.extractCoursesFromImage(imageFile);
      
      // Convert CourseData to Course by adding IDs
      const coursesWithIds = result.courses.map(courseData => ({
        id: Math.random().toString(36).substring(2, 15) + 
            Math.random().toString(36).substring(2, 15),
        title: courseData.title,
        units: courseData.units,
        grade: courseData.grade
      }));
      
      return {
        success: result.success,
        error: result.error,
        message: result.message,
        courses: coursesWithIds,
        uncertain: result.uncertain
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to extract grades from image';
      setError(errorMessage);
      return null;
    } finally {
      setIsExtracting(false);
    }
  };
  
  return {
    extractGrades,
    isExtracting,
    error
  };
} 