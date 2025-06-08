'use client'

import { useState, useEffect } from 'react';
import { Trash2, PlusCircle, Calculator, X, Check } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';

interface Course {
  id: string;
  title: string;
  units: number;
  grade: number | null;
}

// Generate a random ID that works across all browsers
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

export default function GPACalculator() {
  const [courses, setCourses] = useState<Course[]>([
    { id: generateId(), title: '', units: 3, grade: 0.0 }
  ]);
  
  const [gpa, setGpa] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

  const addCourse = () => {
    setCourses([
      ...courses,
      { id: generateId(), title: '', units: 3, grade: 0.0 }
    ]);
  };

  const confirmDelete = (id: string) => {
    setCourseToDelete(id);
    setShowDeleteDialog(true);
  };

  const cancelDelete = () => {
    setCourseToDelete(null);
    setShowDeleteDialog(false);
  };

  const removeCourse = () => {
    if (courses.length > 1 && courseToDelete) {
      setCourses(courses.filter(course => course.id !== courseToDelete));
      setDeletingId(null);
      setShowDeleteDialog(false);
      setCourseToDelete(null);
    }
  };

  const updateCourse = (id: string, field: keyof Course, value: any) => {
    setCourses(courses.map(course => {
      if (course.id === id) {
        return { ...course, [field]: value };
      }
      return course;
    }));
  };

  const calculateGPA = () => {
    let totalPoints = 0;
    let totalUnits = 0;

    courses.forEach(course => {
      if (course.units > 0 && course.grade !== null) {
        totalPoints += course.units * course.grade;
        totalUnits += course.units;
      }
    });

    if (totalUnits === 0) return null;
    return totalPoints / totalUnits;
  };

  useEffect(() => {
    setGpa(calculateGPA());
  }, [courses]);

  // Handle grade input change with support for empty values
  const handleGradeChange = (id: string, value: string) => {
    if (value === '') {
      updateCourse(id, 'grade', null);
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        updateCourse(id, 'grade', numValue);
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 sm:px-8 space-y-6 sm:space-y-8">
      <Card className="border-none bg-transparent">
        <CardHeader className="text-center px-0 pb-2 sm:pb-4">
          <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            GPA Calculator
          </CardTitle>
          <CardDescription className="text-slate-300 text-sm sm:text-base max-w-lg mx-auto">
            Add your courses, units, and grades to calculate your GPA
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-0 mt-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl overflow-hidden">
            {/* Desktop View with Table */}
            <div className="hidden sm:block">
              <Table>
                <TableHeader className="bg-black/20 border-b border-white/10">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="text-white/90 font-medium py-4 px-5">Course Title (optional)</TableHead>
                    <TableHead className="text-white/90 font-medium text-center py-4">Units</TableHead>
                    <TableHead className="text-white/90 font-medium text-center py-4">Grade</TableHead>
                    <TableHead className="text-white/90 font-medium text-center py-4 w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id} className="hover:bg-white/5 border-white/5">
                      <TableCell className="text-white/90 py-4 px-5">
                        <Input
                          type="text"
                          value={course.title}
                          onChange={(e) => updateCourse(course.id, 'title', e.target.value)}
                          placeholder="Course Title (optional)"
                          className="bg-white/5 border-white/10 focus-visible:ring-blue-500 text-white placeholder:text-white/50 h-10"
                        />
                      </TableCell>
                      <TableCell className="text-center text-white/90 py-4">
                        <Input
                          type="number"
                          min="0"
                          max="6"
                          value={course.units}
                          onChange={(e) => updateCourse(course.id, 'units', parseFloat(e.target.value) || 0)}
                          className="bg-white/5 border-white/10 text-center w-full focus-visible:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-white h-10 mx-auto max-w-24"
                        />
                      </TableCell>
                      <TableCell className="text-center text-white/90 py-4">
                        <Input
                          type="number"
                          min="0"
                          max="4"
                          step="0.1"
                          value={course.grade === null ? '' : course.grade}
                          onChange={(e) => handleGradeChange(course.id, e.target.value)}
                          placeholder="Enter grade"
                          className="bg-white/5 border-white/10 text-center w-full focus-visible:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-white placeholder:text-white/50 h-10 mx-auto max-w-24"
                        />
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => confirmDelete(course.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-10 w-10 rounded-full"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Mobile View */}
            <div className="sm:hidden divide-y divide-white/5">
              {courses.map((course) => (
                <div key={course.id} className="flex flex-col gap-3 p-4 items-start">
                  {/* Mobile field labels */}
                  <div className="w-full flex flex-wrap gap-2 mb-1">
                    <span className="text-xs font-medium text-white/70">Course Title (optional)</span>
                  </div>
                  <div className="w-full mb-3">
                    <Input
                      type="text"
                      value={course.title}
                      onChange={(e) => updateCourse(course.id, 'title', e.target.value)}
                      placeholder="Course Title (optional)"
                      className="bg-white/5 border-white/10 focus-visible:ring-blue-500 text-white placeholder:text-white/50 h-10"
                    />
                  </div>
                  
                  <div className="w-full flex flex-wrap justify-between mb-1">
                    <span className="text-xs font-medium text-white/70">Units</span>
                    <span className="text-xs font-medium text-white/70">Grade</span>
                  </div>
                  <div className="flex w-full justify-between gap-4 mb-3">
                    <div className="w-1/2">
                      <Input
                        type="number"
                        min="0"
                        max="6"
                        value={course.units}
                        onChange={(e) => updateCourse(course.id, 'units', parseFloat(e.target.value) || 0)}
                        className="bg-white/5 border-white/10 text-center focus-visible:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-white h-10"
                      />
                    </div>
                    <div className="w-1/2">
                      <Input
                        type="number"
                        min="0"
                        max="4"
                        step="0.1"
                        value={course.grade === null ? '' : course.grade}
                        onChange={(e) => handleGradeChange(course.id, e.target.value)}
                        placeholder="Enter grade"
                        className="bg-white/5 border-white/10 text-center focus-visible:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-white placeholder:text-white/50 h-10"
                      />
                    </div>
                  </div>
                  
                  <div className="w-full flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => confirmDelete(course.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-10 w-10 rounded-full"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-t border-white/5">
              <Button
                variant="ghost"
                onClick={addCourse}
                className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm text-blue-400 hover:text-blue-300 bg-blue-500/10 sm:bg-transparent py-2 px-4 sm:px-3 rounded-lg sm:rounded-md h-10"
              >
                <PlusCircle size={16} className="mr-1" /> Add Course
              </Button>
              
              <div className="flex items-center justify-center w-full sm:w-auto">
                <div className="flex items-center gap-3 bg-blue-600/20 px-5 py-3 rounded-lg w-full sm:w-auto justify-center sm:justify-start">
                  <Calculator size={18} className="text-blue-400" />
                  <div>
                    <div className="text-xs text-blue-300 mb-0.5">Your GPA</div>
                    <div className="font-bold text-lg text-white">
                      {gpa !== null ? gpa.toFixed(2) : '—'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="text-xs text-center text-white/70 mt-6 justify-center p-0">
          GPA is calculated by dividing total grade points by total units.
        </CardFooter>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-xs sm:max-w-md mx-auto">
          <DialogHeader className="space-y-3 pb-2">
            <DialogTitle className="text-xl">Delete Course</DialogTitle>
            <DialogDescription className="text-slate-300">
              Are you sure you want to delete this course? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex sm:justify-end gap-3 mt-6 pt-2 border-t border-white/10">
            <Button
              variant="outline"
              onClick={cancelDelete}
              className="border-white/10 hover:bg-white/5 text-white h-10"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={removeCourse}
              className="bg-red-600 hover:bg-red-700 h-10"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 