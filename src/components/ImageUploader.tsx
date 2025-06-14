'use client';

import { useState, useRef, useEffect } from 'react';
import { useGradeExtraction, GradeExtractionResult } from '@/lib/ai/useGradeExtraction';
import { Course } from '@/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { ImageIcon, UploadIcon, Loader2, XCircle, CheckCircle, X, AlertTriangle, Upload } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface ImageUploaderProps {
  onCoursesExtracted: (courses: Course[]) => void;
  onClose: () => void;
}

export default function ImageUploader({ onCoursesExtracted, onClose }: ImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [extractionResult, setExtractionResult] = useState<GradeExtractionResult | null>(null);
  const [showUncertainError, setShowUncertainError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { extractGrades, isExtracting, error } = useGradeExtraction();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setExtractionResult(null);
      setShowUncertainError(false);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExtract = async () => {
    if (!selectedFile) return;
    
    const result = await extractGrades(selectedFile);
    if (result) {
      setExtractionResult(result);
      
      // If extraction is certain, automatically add courses
      if (!result.uncertain && result.courses.length > 0) {
        onCoursesExtracted(result.courses);
        
        // Show success toast
        toast.success(`Successfully extracted ${result.courses.length} course${result.courses.length !== 1 ? 's' : ''}!`, {
          description: "Courses have been added to your calculator.",
          duration: 3000,
        });
        
        // Auto-close after successful extraction
        setTimeout(() => {
          onClose();
        }, 1500);
      } else if (result.uncertain) {
        // Show error for uncertain results
        setShowUncertainError(true);
      }
    }
  };

  const handleTryAgain = () => {
    setSelectedFile(null);
    setPreview(null);
    setExtractionResult(null);
    setShowUncertainError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Modal Dialog for both mobile and desktop */}
      <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-xl">
        <Card className="w-full h-auto bg-slate-900/95 border border-slate-700 text-white flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 px-4 sm:px-6 pb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium text-white">Extract Grades from Image</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-400 hover:text-white h-7 w-7 shrink-0 rounded-full hover:bg-white/10"
              >
                <X size={16} />
              </Button>
            </div>
          </div>
          
          {/* Scrollable Content */}
          <CardContent className="overflow-y-auto px-4 sm:px-6 py-5 space-y-5 max-h-[calc(90vh-80px)]">
            {/* File Upload Section */}
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full h-32 sm:h-32 border-2 border-dashed border-slate-600 bg-slate-800/30 hover:bg-slate-700/40 text-slate-300 transition-all duration-200 hover:border-slate-500"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="p-2 rounded-full bg-slate-700/50">
                    <Upload size={20} />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-sm">Tap to upload grade image</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG, JPEG up to 10MB</p>
                  </div>
                </div>
              </Button>
            </div>

            {/* Image Preview Section */}
            {preview && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wide">Preview</h3>
                  <div className="relative max-h-56 sm:max-h-64 overflow-hidden rounded-xl border border-slate-600 bg-slate-800/30">
                    <Image
                      src={preview}
                      alt="Grade preview"
                      width={500}
                      height={300}
                      className="w-full h-auto object-contain"
                      unoptimized
                    />
                  </div>
                </div>
                
                {!extractionResult && (
                  <Button
                    onClick={handleExtract}
                    disabled={isExtracting}
                    className="w-full bg-blue-600 hover:bg-blue-700 h-10 text-sm font-medium rounded-lg transition-all duration-200"
                  >
                    {isExtracting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        <span>Extracting course information...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Upload size={16} />
                        <span>Extract Course Information</span>
                      </div>
                    )}
                  </Button>
                )}
              </div>
            )}

            {/* Error Display */}
            {error && (
              <Alert variant="destructive" className="border-red-500/50 bg-red-950/30">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="text-sm font-medium">Extraction Failed</AlertTitle>
                <AlertDescription className="text-xs mt-1 leading-relaxed">{error}</AlertDescription>
              </Alert>
            )}

            {/* Uncertainty Error */}
            {showUncertainError && (
              <Alert variant="destructive" className="border-red-500/50 bg-red-950/30">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="text-red-300 text-sm font-medium">Image Quality Issue</AlertTitle>
                <AlertDescription className="text-red-200 text-xs mt-1 leading-relaxed space-y-2">
                  <p>The AI couldn't clearly distinguish between Units and Grade columns in your image.</p>
                  <div className="bg-red-900/30 p-2 rounded-md">
                    <p className="font-medium text-red-100 mb-1 text-xs">To improve accuracy, please:</p>
                    <ul className="space-y-0.5 text-xs">
                      <li>• Ensure the image is clear and well-lit</li>
                      <li>• Make sure column headers are visible</li>
                      <li>• Crop the image to focus on the grade table</li>
                      <li>• Verify Units and Grades are in separate columns</li>
                    </ul>
                  </div>
                  <Button
                    onClick={handleTryAgain}
                    variant="outline"
                    className="w-full mt-2 border-red-400/50 text-red-300 hover:bg-red-500/10 h-8 text-xs"
                  >
                    Try Another Image
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Success Message */}
            {extractionResult && !extractionResult.uncertain && (
              <Alert className="border-green-500/50 bg-green-950/30 text-green-200">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle className="text-green-300 text-sm font-medium">Success!</AlertTitle>
                <AlertDescription className="text-green-200 text-xs mt-1 leading-relaxed">
                  <p>Successfully extracted {extractionResult.courses.length} course{extractionResult.courses.length !== 1 ? 's' : ''} from your image.</p>
                  <p className="mt-1 text-green-300">Adding courses to your calculator...</p>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 