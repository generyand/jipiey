export interface Course {
  id: string;
  title: string;
  units: number;
  grade: number | null;
}

export interface CourseData {
  title: string;
  units: number;
  grade: number | null;
} 