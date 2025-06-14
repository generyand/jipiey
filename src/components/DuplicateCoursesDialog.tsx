'use client';

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
import { AlertTriangle, ArrowRight, RefreshCw, Plus, X } from 'lucide-react';

interface DuplicateCoursesDialogProps {
  open: boolean;
  existingCourses: Course[];
  newCourses: Course[];
  onConfirm: (strategy: DuplicateStrategy) => void;
  onCancel: () => void;
}

export default function DuplicateCoursesDialog({
  open,
  existingCourses,
  newCourses,
  onConfirm,
  onCancel
}: DuplicateCoursesDialogProps) {
  const duplicates = findDuplicateCourses(existingCourses, newCourses);
  
  if (duplicates.length === 0) {
    return null;
  }

  const nonDuplicateCount = newCourses.length - duplicates.length;

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-orange-500/10">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <DialogTitle className="text-xl text-white">
                Duplicate Courses Found
              </DialogTitle>
              <DialogDescription className="text-slate-300 mt-1">
                Found {duplicates.length} course{duplicates.length !== 1 ? 's' : ''} that may already exist in your calculator.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 max-h-[50vh] overflow-y-auto">
          {/* Summary */}
          <div className="flex flex-wrap gap-2 pb-2">
            {nonDuplicateCount > 0 && (
              <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                {nonDuplicateCount} new course{nonDuplicateCount !== 1 ? 's' : ''}
              </Badge>
            )}
            <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
              {duplicates.length} potential duplicate{duplicates.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {/* Duplicate Course Pairs */}
          <div className="space-y-3">
            {duplicates.map((duplicate, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Existing Course */}
                    <div className="flex-1 space-y-1">
                      <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                        Current
                      </div>
                      <div className="text-sm text-white font-medium">
                        {duplicate.existingCourse.title || 'Untitled Course'}
                      </div>
                      <div className="flex gap-3 text-xs text-slate-400">
                        <span>Units: {duplicate.existingCourse.units}</span>
                        <span>Grade: {duplicate.existingCourse.grade ?? 'None'}</span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex justify-center sm:justify-start">
                      <ArrowRight className="h-4 w-4 text-slate-500 rotate-90 sm:rotate-0" />
                    </div>

                    {/* New Course */}
                    <div className="flex-1 space-y-1">
                      <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                        From Image
                      </div>
                      <div className="text-sm text-white font-medium">
                        {duplicate.newCourse.title || 'Untitled Course'}
                      </div>
                      <div className="flex gap-3 text-xs text-slate-400">
                        <span>Units: {duplicate.newCourse.units}</span>
                        <span>Grade: {duplicate.newCourse.grade ?? 'None'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Matching Info */}
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <div className="text-xs text-slate-500">
                      <span className="font-medium">Normalized match:</span>{' '}
                      "{normalizeCourseTitle(duplicate.existingCourse.title)}"
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-white/10">
          <div className="flex flex-col sm:flex-row gap-2 flex-1">
            {/* Skip Duplicates */}
            <Button
              variant="outline"
              onClick={() => onConfirm('skip_duplicates')}
              className="flex-1 border-slate-600 bg-slate-800 hover:bg-slate-700 text-white h-10 text-sm"
            >
              <div className="flex items-center gap-2">
                <X size={16} />
                <span>Skip Duplicates</span>
              </div>
            </Button>

            {/* Update Existing */}
            <Button
              variant="outline"
              onClick={() => onConfirm('update_duplicates')}
              className="flex-1 border-blue-600/50 bg-blue-950/30 hover:bg-blue-900/40 text-blue-300 hover:text-blue-200 h-10 text-sm"
            >
              <div className="flex items-center gap-2">
                <RefreshCw size={16} />
                <span>Update Existing</span>
              </div>
            </Button>

            {/* Add Anyway */}
            <Button
              variant="outline"
              onClick={() => onConfirm('add_anyway')}
              className="flex-1 border-purple-600/50 bg-purple-950/30 hover:bg-purple-900/40 text-purple-300 hover:text-purple-200 h-10 text-sm"
            >
              <div className="flex items-center gap-2">
                <Plus size={16} />
                <span>Add Anyway</span>
              </div>
            </Button>
          </div>

          <Button
            variant="ghost"
            onClick={onCancel}
            className="text-slate-400 hover:text-white hover:bg-white/10 h-10 text-sm"
          >
            Cancel
          </Button>
        </DialogFooter>

        {/* Help Text */}
        <div className="text-xs text-slate-500 space-y-1 mt-2">
          <p><strong>Skip:</strong> Only add new courses, ignore duplicates</p>
          <p><strong>Update:</strong> Keep existing courses but update with better info from image</p>
          <p><strong>Add Anyway:</strong> Add all courses, including duplicates</p>
        </div>
      </DialogContent>
    </Dialog>
  );
} 