import { useState, useCallback } from 'react';
import { Course } from '@/types';
import { mergeCourses, DuplicateHandlingResult } from '@/lib/courseUtils';

export type DuplicateStrategy = 'skip_duplicates' | 'update_duplicates' | 'add_anyway';

interface UseDuplicateHandlingOptions {
  defaultStrategy?: DuplicateStrategy;
}

export function useDuplicateHandling(options: UseDuplicateHandlingOptions = {}) {
  const { defaultStrategy = 'skip_duplicates' } = options;
  
  const [strategy, setStrategy] = useState<DuplicateStrategy>(defaultStrategy);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [pendingCourses, setPendingCourses] = useState<{
    existing: Course[];
    new: Course[];
    onConfirm: (result: DuplicateHandlingResult) => void;
    onCancel: () => void;
  } | null>(null);

  const handleCourseAddition = useCallback((
    existingCourses: Course[],
    newCourses: Course[],
    onConfirm: (result: DuplicateHandlingResult) => void,
    onCancel?: () => void
  ) => {
    const result = mergeCourses(existingCourses, newCourses, { strategy });
    
    // If no duplicates found, directly confirm
    if (result.duplicatesFound.length === 0) {
      onConfirm(result);
      return;
    }
    
    // If strategy is set to always apply (not ask user), apply directly
    if (strategy === 'update_duplicates' || strategy === 'add_anyway') {
      onConfirm(result);
      return;
    }
    
    // Show dialog for user to decide
    setPendingCourses({
      existing: existingCourses,
      new: newCourses,
      onConfirm,
      onCancel: onCancel || (() => {})
    });
    setShowDuplicateDialog(true);
  }, [strategy]);

  const confirmDuplicateHandling = useCallback((selectedStrategy: DuplicateStrategy) => {
    if (!pendingCourses) return;
    
    const result = mergeCourses(
      pendingCourses.existing, 
      pendingCourses.new, 
      { strategy: selectedStrategy }
    );
    
    pendingCourses.onConfirm(result);
    setShowDuplicateDialog(false);
    setPendingCourses(null);
  }, [pendingCourses]);

  const cancelDuplicateHandling = useCallback(() => {
    if (pendingCourses) {
      pendingCourses.onCancel();
    }
    setShowDuplicateDialog(false);
    setPendingCourses(null);
  }, [pendingCourses]);

  return {
    strategy,
    setStrategy,
    showDuplicateDialog,
    pendingCourses,
    handleCourseAddition,
    confirmDuplicateHandling,
    cancelDuplicateHandling
  };
} 