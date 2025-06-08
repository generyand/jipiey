'use client'

import { useState, useEffect } from 'react';
import { Trash2, PlusCircle, Calculator } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  units: number;
  grade: number | null;
}

export default function GPACalculator() {
  const [courses, setCourses] = useState<Course[]>([
    { id: crypto.randomUUID(), title: '', units: 3, grade: 0.0 }
  ]);
  
  const [gpa, setGpa] = useState<number | null>(null);

  const addCourse = () => {
    setCourses([
      ...courses,
      { id: crypto.randomUUID(), title: '', units: 3, grade: 0.0 }
    ]);
  };

  const removeCourse = (id: string) => {
    if (courses.length > 1) {
      setCourses(courses.filter(course => course.id !== id));
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
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          GPA Calculator
        </h1>
        <p className="text-slate-500 mt-2">
          Add your courses, units, and grades to calculate your GPA
        </p>
      </div>
      
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 font-medium text-sm border-b border-white/10 bg-black/20">
          <div className="col-span-5">Course Title (optional)</div>
          <div className="col-span-2 text-center">Units</div>
          <div className="col-span-3 text-center">Grade</div>
          <div className="col-span-2 text-center">Actions</div>
        </div>
        
        <div className="divide-y divide-white/5">
          {courses.map((course) => (
            <div key={course.id} className="grid grid-cols-12 gap-4 p-4 items-center">
              <div className="col-span-5">
                <input
                  type="text"
                  value={course.title}
                  onChange={(e) => updateCourse(course.id, 'title', e.target.value)}
                  placeholder="Course Title (optional)"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  min="0"
                  max="6"
                  value={course.units}
                  onChange={(e) => updateCourse(course.id, 'units', parseFloat(e.target.value) || 0)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="col-span-3">
                <input
                  type="number"
                  min="0"
                  max="4"
                  step="0.1"
                  value={course.grade === null ? '' : course.grade}
                  onChange={(e) => handleGradeChange(course.id, e.target.value)}
                  placeholder="Enter grade"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="col-span-2 text-center">
                <button
                  onClick={() => removeCourse(course.id)}
                  className="p-2 text-red-400 hover:text-red-300 transition rounded-full hover:bg-red-500/10"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 flex justify-between items-center bg-gradient-to-r from-blue-900/20 to-purple-900/20">
          <button
            onClick={addCourse}
            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition"
          >
            <PlusCircle size={16} /> Add Course
          </button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-blue-600/20 px-4 py-2 rounded-lg">
              <Calculator size={18} className="text-blue-400" />
              <div>
                <div className="text-xs text-blue-300">Your GPA</div>
                <div className="font-bold text-lg">
                  {gpa !== null ? gpa.toFixed(2) : '—'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-xs text-center text-slate-500 mt-6">
        GPA is calculated by dividing total grade points by total units.
      </div>
    </div>
  );
} 