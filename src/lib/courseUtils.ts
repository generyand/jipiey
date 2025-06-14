import { Course } from '@/types';

export interface DuplicateHandlingResult {
  coursesToAdd: Course[];
  duplicatesFound: Array<{
    existingCourse: Course;
    newCourse: Course;
    action: 'skip' | 'update' | 'add_anyway';
  }>;
  message?: string;
}

/**
 * Detects duplicate courses based on normalized title comparison
 */
export function findDuplicateCourses(
  existingCourses: Course[],
  newCourses: Course[]
): Array<{ existingCourse: Course; newCourse: Course }> {
  const duplicates: Array<{ existingCourse: Course; newCourse: Course }> = [];
  
  newCourses.forEach(newCourse => {
    const normalizedNewTitle = normalizeCourseTitle(newCourse.title);
    
    const existingCourse = existingCourses.find(existing => 
      normalizeCourseTitle(existing.title) === normalizedNewTitle
    );
    
    if (existingCourse && normalizedNewTitle.length > 0) {
      duplicates.push({ existingCourse, newCourse });
    }
  });
  
  return duplicates;
}

/**
 * Normalizes course title for comparison by:
 * - Converting to lowercase
 * - Removing extra spaces
 * - Removing common course code patterns
 * - Removing special characters
 */
export function normalizeCourseTitle(title: string): string {
  if (!title || typeof title !== 'string') return '';
  
  return title
    .toLowerCase()
    .trim()
    // Remove course codes (e.g., "CS101", "MATH-203", "ENG 101")
    .replace(/^[a-z]{2,4}[-\s]?\d{2,4}[a-z]?\s*[-:]?\s*/i, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Remove special characters but keep letters, numbers, and spaces
    .replace(/[^\w\s]/g, '')
    .trim();
}

/**
 * Handles duplicate courses with different strategies
 */
export function handleDuplicateCourses(
  existingCourses: Course[],
  newCourses: Course[],
  strategy: 'skip_duplicates' | 'update_duplicates' | 'ask_user' | 'add_anyway' = 'skip_duplicates'
): DuplicateHandlingResult {
  const duplicates = findDuplicateCourses(existingCourses, newCourses);
  
  if (duplicates.length === 0) {
    return {
      coursesToAdd: newCourses,
      duplicatesFound: [],
      message: `Adding ${newCourses.length} new course${newCourses.length !== 1 ? 's' : ''}.`
    };
  }
  
  const duplicateNewCourseIds = new Set(duplicates.map(d => d.newCourse.id));
  const nonDuplicateCourses = newCourses.filter(course => !duplicateNewCourseIds.has(course.id));
  
  let coursesToAdd: Course[] = [...nonDuplicateCourses];
  let message = '';
  
  const duplicateActions = duplicates.map(({ existingCourse, newCourse }) => {
    let action: 'skip' | 'update' | 'add_anyway';
    
    switch (strategy) {
      case 'skip_duplicates':
        action = 'skip';
        break;
      case 'update_duplicates':
        action = 'update';
        // Update the existing course with new data if it has better information
        if (shouldUpdateCourse(existingCourse, newCourse)) {
          coursesToAdd.push({
            ...existingCourse,
            units: newCourse.units || existingCourse.units,
            grade: newCourse.grade !== null ? newCourse.grade : existingCourse.grade,
          });
        }
        break;
      case 'add_anyway':
        action = 'add_anyway';
        coursesToAdd.push(newCourse);
        break;
      default:
        action = 'skip';
    }
    
    return { existingCourse, newCourse, action };
  });
  
  // Generate appropriate message
  const skippedCount = duplicateActions.filter(d => d.action === 'skip').length;
  const updatedCount = duplicateActions.filter(d => d.action === 'update').length;
  const addedAnywayCount = duplicateActions.filter(d => d.action === 'add_anyway').length;
  
  const messageParts: string[] = [];
  
  if (nonDuplicateCourses.length > 0) {
    messageParts.push(`${nonDuplicateCourses.length} new course${nonDuplicateCourses.length !== 1 ? 's' : ''} added`);
  }
  
  if (skippedCount > 0) {
    messageParts.push(`${skippedCount} duplicate${skippedCount !== 1 ? 's' : ''} skipped`);
  }
  
  if (updatedCount > 0) {
    messageParts.push(`${updatedCount} existing course${updatedCount !== 1 ? 's' : ''} updated`);
  }
  
  if (addedAnywayCount > 0) {
    messageParts.push(`${addedAnywayCount} duplicate${addedAnywayCount !== 1 ? 's' : ''} added anyway`);
  }
  
  message = messageParts.join(', ') + '.';
  
  return {
    coursesToAdd,
    duplicatesFound: duplicateActions,
    message
  };
}

/**
 * Determines if an existing course should be updated with new course data
 */
function shouldUpdateCourse(existingCourse: Course, newCourse: Course): boolean {
  // Update if the new course has a grade and the existing doesn't
  if (newCourse.grade !== null && existingCourse.grade === null) {
    return true;
  }
  
  // Update if the new course has a better title (longer, more descriptive)
  if (newCourse.title.length > existingCourse.title.length && newCourse.title.trim().length > 0) {
    return true;
  }
  
  // Update if the new course has units and the existing doesn't have meaningful units
  if (newCourse.units > 0 && existingCourse.units <= 0) {
    return true;
  }
  
  return false;
}

/**
 * Merges courses from image extraction with existing courses, handling duplicates
 */
export function mergeCourses(
  existingCourses: Course[],
  extractedCourses: Course[],
  options: {
    strategy?: 'skip_duplicates' | 'update_duplicates' | 'add_anyway';
    allowEmptyTitles?: boolean;
  } = {}
): DuplicateHandlingResult {
  const { strategy = 'skip_duplicates', allowEmptyTitles = false } = options;
  
  // Filter out courses with empty titles unless explicitly allowed
  const validExtractedCourses = allowEmptyTitles 
    ? extractedCourses 
    : extractedCourses.filter(course => course.title && course.title.trim().length > 0);
  
  return handleDuplicateCourses(existingCourses, validExtractedCourses, strategy);
} 