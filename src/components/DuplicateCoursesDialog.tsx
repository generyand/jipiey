'use client';

import { useState } from 'react';
import { Course } from '@/types';
import { DuplicateStrategy } from '@/hooks/useDuplicateHandling';
import { findDuplicateCourses, normalizeCourseTitle } from '@/lib/courseUtils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { AlertTriangle, ArrowRight, RefreshCw, Plus, X, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

interface DuplicateCoursesDialogProps {
  open: boolean;
  existingCourses: Course[];
  newCourses: Course[];
  onConfirm: (strategy: DuplicateStrategy) => void;
  onCancel: () => void;
}

// Mobile Detail Dialog Component
interface MobileDetailDialogProps {
  open: boolean;
  duplicates: Array<{
    existingCourse: Course;
    newCourse: Course;
  }>;
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

function MobileDetailDialog({ 
  open, 
  duplicates, 
  currentIndex, 
  onClose, 
  onNext, 
  onPrev 
}: MobileDetailDialogProps) {
  if (duplicates.length === 0) return null;
  
  const duplicate = duplicates[currentIndex];
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-white/10 text-white w-[95vw] h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0 pb-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold text-white">
              Duplicate Details
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">
                {currentIndex + 1} of {duplicates.length}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 py-4">
          <ScrollArea className="h-full">
            <div className="space-y-4">
              {/* Current Course */}
              <Card className="bg-slate-800/30 border-slate-700/50 py-2">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                    <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
                      Current Course
                    </h4>
                  </div>
                  <div className="space-y-3">
                    <h5 className="text-white font-medium text-base leading-tight">
                      {duplicate.existingCourse.title || (
                        <span className="text-slate-400 italic">Untitled Course</span>
                      )}
                    </h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-slate-500 font-medium">UNITS</span>
                        <p className="text-white font-semibold text-lg">{duplicate.existingCourse.units}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 font-medium">GRADE</span>
                        <p className="text-white font-semibold text-lg">
                          {duplicate.existingCourse.grade ?? (
                            <span className="text-slate-400">None</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Arrow */}
              <div className="flex items-center justify-center py-2">
                <ArrowRight className="h-5 w-5 text-slate-500 rotate-90" />
              </div>

              {/* New Course from Image */}
              <Card className="bg-slate-800/30 border-slate-700/50 py-2">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-2 w-2 rounded-full bg-green-400"></div>
                    <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wider">
                      From Image
                    </h4>
                  </div>
                  <div className="space-y-3">
                    <h5 className="text-white font-medium text-base leading-tight">
                      {duplicate.newCourse.title || (
                        <span className="text-slate-400 italic">Untitled Course</span>
                      )}
                    </h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-slate-500 font-medium">UNITS</span>
                        <p className="text-white font-semibold text-lg">{duplicate.newCourse.units}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 font-medium">GRADE</span>
                        <p className="text-white font-semibold text-lg">
                          {duplicate.newCourse.grade ?? (
                            <span className="text-slate-400">None</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </div>

        {/* Navigation Footer */}
        <div className="flex-shrink-0 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onPrev}
              disabled={currentIndex === 0}
              className="text-slate-400 hover:text-white hover:bg-white/10 h-10"
            >
              <ChevronLeft size={16} className="mr-1" />
              Previous
            </Button>
            
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-slate-400 hover:text-white hover:bg-white/10 h-10"
            >
              Close
            </Button>
            
            <Button
              variant="ghost"
              onClick={onNext}
              disabled={currentIndex === duplicates.length - 1}
              className="text-slate-400 hover:text-white hover:bg-white/10 h-10"
            >
              Next
              <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function DuplicateCoursesDialog({
  open,
  existingCourses,
  newCourses,
  onConfirm,
  onCancel
}: DuplicateCoursesDialogProps) {
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [mobileDetailIndex, setMobileDetailIndex] = useState(0);
  
  const duplicates = findDuplicateCourses(existingCourses, newCourses);
  
  if (duplicates.length === 0) {
    return null;
  }

  const nonDuplicateCount = newCourses.length - duplicates.length;

  const handleViewDetails = (index: number) => {
    setMobileDetailIndex(index);
    setShowMobileDetail(true);
  };

  const handleMobileDetailNext = () => {
    if (mobileDetailIndex < duplicates.length - 1) {
      setMobileDetailIndex(mobileDetailIndex + 1);
    }
  };

  const handleMobileDetailPrev = () => {
    if (mobileDetailIndex > 0) {
      setMobileDetailIndex(mobileDetailIndex - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-6xl w-[95vw] h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0 pb-4 border-b border-white/10">
          {/* Desktop Header */}
          <div className="hidden md:flex items-start gap-4">
            <div className="flex-shrink-0 p-2 rounded-full bg-orange-500/10">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-bold text-white mb-2">
                Duplicate Courses Found
              </DialogTitle>
              <DialogDescription className="text-slate-300 text-sm leading-relaxed">
                Found {duplicates.length} course{duplicates.length !== 1 ? 's' : ''} that may already exist in your calculator.
              </DialogDescription>
              
              {/* Summary Badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                {nonDuplicateCount > 0 && (
                  <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                    {nonDuplicateCount} new course{nonDuplicateCount !== 1 ? 's' : ''}
                  </Badge>
                )}
                <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">
                  {duplicates.length} potential duplicate{duplicates.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="md:hidden">
            {/* Title Section */}
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 p-2 rounded-full bg-orange-500/10">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
              </div>
              <DialogTitle className="text-lg font-bold text-white leading-tight">
                Duplicate Courses
              </DialogTitle>
            </div>
            
            {/* Badges Section */}
            <div className="flex items-center gap-2 mb-3 ml-11">
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs font-medium">
                {duplicates.length} duplicate{duplicates.length !== 1 ? 's' : ''}
              </Badge>
              {nonDuplicateCount > 0 && (
                <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30 text-xs font-medium">
                  {nonDuplicateCount} new
                </Badge>
              )}
            </div>
            
            {/* Description Section */}
            <DialogDescription className="text-slate-300 text-sm leading-relaxed ml-11 text-left">
              Review courses that may already exist in your calculator
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Scrollable Content Area */}
        <div className="flex-1 min-h-0 py-4">
          <ScrollArea className="h-full">
            <div className="space-y-4 pr-4">
              {duplicates.map((duplicate, index) => (
                <Card key={index} className="bg-slate-800/30 border-slate-700/50">
                  <CardContent className="p-0">
                    {/* Desktop Layout */}
                    <div className="hidden md:block">
                      <div className="grid grid-cols-12 divide-x divide-slate-700/50">
                        {/* Current Course - Left Side */}
                        <div className="col-span-5 p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                            <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                              Current Course
                            </h4>
                          </div>
                          <div className="space-y-3">
                            <h5 className="text-white font-medium text-base leading-tight">
                              {duplicate.existingCourse.title || (
                                <span className="text-slate-400 italic">Untitled Course</span>
                              )}
                            </h5>
                            <div className="flex gap-4">
                              <div>
                                <span className="text-xs text-slate-500 font-medium">UNITS</span>
                                <p className="text-white font-semibold">{duplicate.existingCourse.units}</p>
                              </div>
                              <div>
                                <span className="text-xs text-slate-500 font-medium">GRADE</span>
                                <p className="text-white font-semibold">
                                  {duplicate.existingCourse.grade ?? (
                                    <span className="text-slate-400">None</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="col-span-2 flex items-center justify-center p-4">
                          <div className="flex flex-col items-center gap-1">
                            <ArrowRight className="h-5 w-5 text-slate-500" />
                            <span className="text-xs text-slate-500 font-medium">vs</span>
                          </div>
                        </div>

                        {/* New Course - Right Side */}
                        <div className="col-span-5 p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="h-2 w-2 rounded-full bg-green-400"></div>
                            <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wider">
                              From Image
                            </h4>
                          </div>
                          <div className="space-y-3">
                            <h5 className="text-white font-medium text-base leading-tight">
                              {duplicate.newCourse.title || (
                                <span className="text-slate-400 italic">Untitled Course</span>
                              )}
                            </h5>
                            <div className="flex gap-4">
                              <div>
                                <span className="text-xs text-slate-500 font-medium">UNITS</span>
                                <p className="text-white font-semibold">{duplicate.newCourse.units}</p>
                              </div>
                              <div>
                                <span className="text-xs text-slate-500 font-medium">GRADE</span>
                                <p className="text-white font-semibold">
                                  {duplicate.newCourse.grade ?? (
                                    <span className="text-slate-400">None</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="md:hidden">
                      <div className="px-4 py-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-orange-400"></div>
                            <h4 className="text-sm font-semibold text-orange-400 uppercase tracking-wider">
                              Duplicate #{index + 1}
                            </h4>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(index)}
                            className="border-slate-600 bg-slate-800/50 hover:bg-slate-700 text-white h-8 px-3"
                          >
                            <Eye size={14} className="mr-1" />
                            View Details
                          </Button>
                        </div>
                        
                        <div className="text-white font-medium text-base leading-tight">
                          {duplicate.existingCourse.title || duplicate.newCourse.title || 'Untitled Course'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Action Buttons */}
        <DialogFooter className="flex-shrink-0 pt-4 border-t border-white/10">
          <div className="w-full space-y-3">
            {/* Help Text - Desktop Only */}
            <div className="hidden md:block w-full bg-slate-800/30 rounded-lg p-3 text-xs text-slate-400">
              <div className="flex flex-col md:flex-row md:justify-center md:gap-8 gap-2 text-center md:text-left">
                <p><strong className="text-slate-300">Skip:</strong> Ignore duplicates</p>
                <p><strong className="text-slate-300">Update:</strong> Update with image info</p>
                <p><strong className="text-slate-300">Add:</strong> Add all courses</p>
              </div>
            </div>
          
            {/* Buttons */}
            <div className="flex flex-col md:flex-row gap-2 w-full">
              <div className="flex flex-col md:flex-row gap-2 flex-1">
                {/* Skip Duplicates Button */}
                <Tooltip>
                  <TooltipTrigger asChild className="md:hidden">
                    <Button
                      variant="outline"
                      onClick={() => onConfirm('skip_duplicates')}
                      className="flex-1 border-slate-600 bg-slate-800 hover:bg-slate-700 text-white h-10"
                    >
                      <X size={16} className="mr-2" />
                      Skip Duplicates
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top" 
                    className="bg-slate-800 border-slate-700 text-slate-200 md:hidden"
                  >
                    Ignore duplicates and only add new courses
                  </TooltipContent>
                </Tooltip>
                
                {/* Desktop Skip Button (no tooltip) */}
                <Button
                  variant="outline"
                  onClick={() => onConfirm('skip_duplicates')}
                  className="hidden md:flex flex-1 border-slate-600 bg-slate-800 hover:bg-slate-700 text-white h-10"
                >
                  <X size={16} className="mr-2" />
                  Skip Duplicates
                </Button>

                {/* Update Existing Button */}
                <Tooltip>
                  <TooltipTrigger asChild className="md:hidden">
                    <Button
                      variant="outline"
                      onClick={() => onConfirm('update_duplicates')}
                      className="flex-1 border-blue-600/50 bg-blue-950/30 hover:bg-blue-900/40 text-blue-300 h-10"
                    >
                      <RefreshCw size={16} className="mr-2" />
                      Update Existing
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top" 
                    className="bg-slate-800 border-slate-700 text-slate-200 md:hidden"
                  >
                    Update existing courses with image information
                  </TooltipContent>
                </Tooltip>
                
                {/* Desktop Update Button (no tooltip) */}
                <Button
                  variant="outline"
                  onClick={() => onConfirm('update_duplicates')}
                  className="hidden md:flex flex-1 border-blue-600/50 bg-blue-950/30 hover:bg-blue-900/40 text-blue-300 h-10"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Update Existing
                </Button>

                {/* Add Anyway Button */}
                <Tooltip>
                  <TooltipTrigger asChild className="md:hidden">
                    <Button
                      variant="outline"
                      onClick={() => onConfirm('add_anyway')}
                      className="flex-1 border-purple-600/50 bg-purple-950/30 hover:bg-purple-900/40 text-purple-300 h-10"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Anyway
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top" 
                    className="bg-slate-800 border-slate-700 text-slate-200 md:hidden"
                  >
                    Add all courses including duplicates
                  </TooltipContent>
                </Tooltip>
                
                {/* Desktop Add Button (no tooltip) */}
                <Button
                  variant="outline"
                  onClick={() => onConfirm('add_anyway')}
                  className="hidden md:flex flex-1 border-purple-600/50 bg-purple-950/30 hover:bg-purple-900/40 text-purple-300 h-10"
                >
                  <Plus size={16} className="mr-2" />
                  Add Anyway
                </Button>
              </div>

              <Button
                variant="ghost"
                onClick={onCancel}
                className="text-slate-400 hover:text-white hover:bg-white/10 h-10"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Mobile Detail Dialog */}
      <MobileDetailDialog
        open={showMobileDetail}
        duplicates={duplicates}
        currentIndex={mobileDetailIndex}
        onClose={() => setShowMobileDetail(false)}
        onNext={handleMobileDetailNext}
        onPrev={handleMobileDetailPrev}
      />
    </Dialog>
  );
}