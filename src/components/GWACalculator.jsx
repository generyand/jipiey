// import React from "react";
import { useState } from "react";
import SubjectForm from "./SubjectForm";
import SubjectList from "./SubjectList";

// const GRADES = {
//     "4.0": 4.0,
//     "3.5": 3.5,
//     "3.0": 3.0,
//     "2.5": 2.5,
//     "2.0": 2.0,
// }

export default function GWACalculator() {
  const [subjects, setSubjects] = useState([]);

  const handleAddSubject = (newSubject) => {
    setSubjects([...subjects, newSubject]);
  };

  const handleRemoveSubject = (index) => {
    const updatedSubjects = subjects.filter((subject, i) => i !== index);
    setSubjects(updatedSubjects);
  };

  const calculateGWA = () => {
    let totalGradePoints = 0;
    let totalCredits = 0;

    subjects.forEach((subject) => {
      totalGradePoints += subject.grade * subject.credits;
      totalCredits += subject.credits;
    });


    return totalCredits === 0 ? 0 : totalGradePoints / totalCredits;
  };

  return (
    <div className="max-w-2xl mx-auto my-[12vh]">
      <h1 className="mb-4 text-center title">GWA Calculator</h1>
      <div className="p-4 mx-2 transition-[height] bg-white rounded-md shadow-md">
        <SubjectForm onAddSubject={handleAddSubject} subjects={subjects} />
        <SubjectList
          subjects={subjects}
          onRemoveSubject={handleRemoveSubject}
          calculateGWA={calculateGWA}
        />
      </div>
    </div>
  );
}
