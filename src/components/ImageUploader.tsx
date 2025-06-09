'use client';

import { useState, useRef } from 'react';
import { useGradeExtraction } from '@/lib/ai/useGradeExtraction';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { ImageIcon, UploadIcon, Loader2, XCircle, CheckCircle } from 'lucide-react';

interface ImageUploaderProps {
  onCoursesExtracted: (courses: any[]) => void;
  onClose: () => void;
}

export default function ImageUploader({ onCoursesExtracted, onClose }: ImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, extracting } = useGradeExtraction();
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select an image file');
      return;
    }
    
    setSelectedFile(file);
    setErrorMessage(null);
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    
    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select an image file');
      return;
    }
    
    setSelectedFile(file);
    setErrorMessage(null);
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };
  
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      setStatus('uploading');
      const extractedCourses = await uploadImage(selectedFile);
      setStatus('success');
      
      // Wait a moment to show success state before closing
      setTimeout(() => {
        onCoursesExtracted(extractedCourses);
      }, 1000);
      
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to process image');
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <Card className="w-full max-w-xl mx-auto border border-white/10 bg-black/40 backdrop-blur-xl shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-blue-400" />
          <span>Extract Grades from Image</span>
        </CardTitle>
        <CardDescription>
          Upload an image containing your grades to automatically extract the information
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange} 
        />
        
        {status === 'idle' && (
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center ${
              preview ? 'border-blue-500/50' : 'border-white/20'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {preview ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="relative w-full max-w-xs mx-auto aspect-video">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="rounded-md object-cover w-full h-full" 
                  />
                </div>
                <p className="text-sm text-slate-300">
                  {selectedFile?.name}
                </p>
              </div>
            ) : (
              <div 
                className="flex flex-col items-center justify-center h-32 cursor-pointer"
                onClick={triggerFileInput}
              >
                <UploadIcon className="h-8 w-8 text-white/50 mb-2" />
                <p className="text-white/80 mb-1">Drag and drop an image here or click to browse</p>
                <p className="text-xs text-white/50">Supports PNG, JPG, JPEG</p>
              </div>
            )}
          </div>
        )}
        
        {status === 'uploading' && (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="h-10 w-10 text-blue-400 animate-spin mb-4" />
            <p className="text-slate-300">Extracting grades from your image...</p>
            <p className="text-xs text-slate-400 mt-2">This may take a few moments</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="flex flex-col items-center justify-center py-10">
            <CheckCircle className="h-10 w-10 text-green-400 mb-4" />
            <p className="text-slate-300">Grades extracted successfully!</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="flex flex-col items-center justify-center py-10">
            <XCircle className="h-10 w-10 text-red-400 mb-4" />
            <p className="text-slate-300">Failed to extract grades</p>
            {errorMessage && (
              <p className="text-xs text-red-400 mt-2">{errorMessage}</p>
            )}
          </div>
        )}
        
        {errorMessage && status === 'idle' && (
          <p className="text-red-400 text-sm mt-2">{errorMessage}</p>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end gap-2 border-t border-white/10 pt-4">
        <Button
          variant="ghost"
          onClick={onClose}
          className="text-slate-300 hover:text-white hover:bg-white/10"
          disabled={status === 'uploading'}
        >
          Cancel
        </Button>
        
        {status === 'idle' && (
          <>
            {preview ? (
              <Button 
                onClick={handleUpload}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Extract Grades
              </Button>
            ) : (
              <Button
                onClick={triggerFileInput}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <UploadIcon className="mr-2 h-4 w-4" />
                Select Image
              </Button>
            )}
          </>
        )}
        
        {status === 'error' && (
          <Button
            onClick={() => setStatus('idle')}
            variant="outline"
            className="border-white/10 bg-white/5 hover:bg-white/10"
          >
            Try Again
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 