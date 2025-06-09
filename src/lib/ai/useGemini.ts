import { useState } from 'react';
import { GeminiService } from './gemini-service';
import { Course } from './types';

interface UseGeminiReturn {
  analyzing: boolean;
  error: Error | null;
  analysis: string | null;
  analyzeGPA: (courses: Course[]) => Promise<void>;
  resetAnalysis: () => void;
}

export function useGemini(): UseGeminiReturn {
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  
  const geminiService = new GeminiService();
  
  const analyzeGPA = async (courses: Course[]) => {
    if (courses.length === 0) {
      setError(new Error('No courses to analyze'));
      return;
    }
    
    try {
      setAnalyzing(true);
      setError(null);
      const result = await geminiService.analyzeGPA(courses);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      setAnalysis(null);
    } finally {
      setAnalyzing(false);
    }
  };
  
  const resetAnalysis = () => {
    setAnalysis(null);
    setError(null);
  };
  
  return {
    analyzing,
    error,
    analysis,
    analyzeGPA,
    resetAnalysis
  };
} 