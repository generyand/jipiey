'use client';

import { useState } from 'react';
import { useGemini } from '@/lib/ai/useGemini';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Loader2, AlertCircle, XCircle } from 'lucide-react';

interface GeminiAnalysisProps {
  courses: any[];
  onClose: () => void;
}

export default function GeminiAnalysis({ courses, onClose }: GeminiAnalysisProps) {
  const { analyzing, error, analysis, analyzeGPA } = useGemini();
  const [hasRequested, setHasRequested] = useState(false);

  const handleAnalyze = async () => {
    setHasRequested(true);
    await analyzeGPA(courses);
  };

  return (
    <Card className="border border-white/10 bg-black/40 backdrop-blur-xl shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
          <Brain className="text-blue-400" size={20} />
          <span>AI GPA Analysis</span>
        </CardTitle>
        <CardDescription>
          Get personalized insights on your academic performance using AI
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!hasRequested ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-300 mb-6">
              Our AI will analyze your courses and grades to provide personalized insights and recommendations.
            </p>
            <Button
              onClick={handleAnalyze}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Brain className="mr-2 h-4 w-4" />
              Analyze My GPA
            </Button>
          </div>
        ) : analyzing ? (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <Loader2 className="h-10 w-10 text-blue-400 animate-spin mb-4" />
            <p className="text-center text-slate-300">
              Analyzing your academic performance...
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-400 mb-1">Analysis Error</h4>
                <p className="text-sm text-slate-300">{error.message}</p>
              </div>
            </div>
          </div>
        ) : analysis ? (
          <div className="prose prose-invert prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-slate-300 text-sm">
              {analysis}
            </div>
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="flex justify-end gap-2 border-t border-white/10 pt-4">
        {analysis && (
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="text-sm border-white/10 bg-white/5 hover:bg-white/10"
          >
            Start Over
          </Button>
        )}
        <Button
          onClick={onClose}
          variant="ghost"
          className="text-sm text-slate-300 hover:text-white hover:bg-white/10"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Close
        </Button>
      </CardFooter>
    </Card>
  );
} 