'use client';

import { useState, useRef } from 'react';
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

interface ImageUploaderProps {
  onCoursesExtracted: (courses: Course[]) => void;
  onClose: () => void;
}

export default function ImageUploader({ onCoursesExtracted, onClose }: ImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [extractionResult, setExtractionResult] = useState<GradeExtractionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { extractGrades, isExtracting, error } = useGradeExtraction();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setExtractionResult(null);
      
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
    }
  };

  const handleConfirm = () => {
    if (extractionResult?.courses) {
      onCoursesExtracted(extractionResult.courses);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
    setExtractionResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <Card className="w-full max-w-2xl max-h-[95vh] overflow-y-auto bg-slate-900/95 border-slate-700 text-white">
        <CardHeader className="pb-3 sm:pb-4 sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg sm:text-xl">Extract Grades from Image</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-white h-8 w-8 shrink-0"
            >
              <X size={16} />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
          {/* File Upload */}
          <div>
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
              className="w-full h-24 sm:h-32 border-dashed border-slate-600 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 text-sm sm:text-base"
            >
              <div className="flex flex-col items-center gap-1 sm:gap-2">
                <Upload size={20} className="sm:hidden" />
                <Upload size={24} className="hidden sm:block" />
                <span className="font-medium">Tap to upload grade image</span>
                <span className="text-xs text-slate-400">PNG, JPG, JPEG up to 10MB</span>
              </div>
            </Button>
          </div>

          {/* Image Preview */}
          {preview && (
            <div className="space-y-3">
              <div className="relative max-h-48 sm:max-h-64 overflow-hidden rounded-lg border border-slate-600 bg-slate-800/30">
                <Image
                  src={preview}
                  alt="Grade preview"
                  width={500}
                  height={300}
                  className="w-full h-auto object-contain"
                  unoptimized
                />
              </div>
              
              {!extractionResult && (
                <Button
                  onClick={handleExtract}
                  disabled={isExtracting}
                  className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-sm sm:text-base font-medium"
                >
                  {isExtracting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Extracting...</span>
                    </div>
                  ) : (
                    'Extract Course Information'
                  )}
                </Button>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive" className="text-sm">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-sm">Extraction Failed</AlertTitle>
              <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {/* Uncertainty Warning - Condensed for Mobile */}
          {extractionResult?.uncertain && (
            <Alert variant="warning" className="border-yellow-500/50 bg-yellow-950/30 text-yellow-200">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-yellow-300 text-sm">Data May Be Inaccurate</AlertTitle>
              <AlertDescription className="text-yellow-200 text-xs sm:text-sm">
                <div className="space-y-1">
                  <p>The AI couldn't clearly distinguish between Units and Grade columns.</p>
                  <p className="hidden sm:block">
                    Please review carefully: <strong>Units</strong> are whole numbers (1-6), <strong>Grades</strong> are decimals (0.0-4.0).
                  </p>
                  <p className="sm:hidden">
                    <strong>Check:</strong> Units = whole numbers, Grades = decimals
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Extraction Results */}
          {extractionResult && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle size={16} />
                <h3 className="font-medium text-sm sm:text-base">Extracted Courses</h3>
              </div>
              
              <div className="space-y-2 max-h-40 sm:max-h-48 overflow-y-auto">
                {extractionResult.courses.map((course, index) => (
                  <div
                    key={index}
                    className="p-3 bg-slate-800/50 rounded-lg border border-slate-600"
                  >
                    {/* Mobile Layout - Stacked */}
                    <div className="sm:hidden space-y-2">
                      <div>
                        <span className="text-slate-400 text-xs">Course:</span>
                        <p className="text-white text-sm font-medium truncate">{course.title || 'Untitled'}</p>
                      </div>
                      <div className="flex justify-between">
                        <div>
                          <span className="text-slate-400 text-xs">Units:</span>
                          <p className="text-white text-sm font-medium">{course.units}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 text-xs">Grade:</span>
                          <p className="text-white text-sm font-medium">{course.grade ?? 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Desktop Layout - Grid */}
                    <div className="hidden sm:grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-slate-400">Course:</span>
                        <p className="text-white truncate">{course.title || 'Untitled'}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Units:</span>
                        <p className="text-white">{course.units}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Grade:</span>
                        <p className="text-white">{course.grade ?? 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button
                  onClick={handleConfirm}
                  className="flex-1 bg-green-600 hover:bg-green-700 h-11 text-sm sm:text-base font-medium"
                >
                  <CheckCircle size={16} className="mr-2" />
                  Confirm & Add Courses
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 h-11 text-sm sm:text-base font-medium sm:w-32"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 