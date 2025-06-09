/**
 * Course with ID - Used for courses already added to the calculator
 */
export interface Course {
  id: string;
  title: string;
  units: number;
  grade: number | null;
}

/**
 * Course data without ID - Used when extracting course info from images
 */
export interface CourseData {
  title: string;
  units: number;
  grade: number | null;
} 