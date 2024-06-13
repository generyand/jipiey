// import React from "react";
import { useState } from "react";
import SubjectForm from "./SubjectForm";
import SubjectList from "./SubjectList";
import { motion } from "framer-motion";



export default function GWACalculator() {
  const [subjects, setSubjects] = useState([]);

  const handleAddSubject = (newSubject) => {
    setSubjects([...subjects, newSubject]);
  };

  const handleRemoveSubject = (index) => {
    const updatedSubjects = subjects.filter((subject, i) => i !== index);
    // onRemoveSubject(index);
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
    <div className="max-w-2xl mx-auto my-[10vh]">
      <h1 className="mx-2 mb-1 text-center title">Calculate Your GWA</h1>
      <p className="mx-4 mb-4 text-center max-w-[40ch]: text-sm lg:text-base text-gray-600">
        Welcome to our GWA Calculator, Ga! This tool is designed for students in
        the University of Mindanao to calculate their General Weighted Average
        (GWA). Just input your subjects, units, and grades, and let the
        calculator do the rest! 🤗
      </p>
      <motion.div
        initial={{ height: "fit-content" }}
        animate={{ height: "auto" }}
        className="p-4 mx-2 transition-[height] bg-white rounded-md shadow-md"
      >
        <SubjectForm onAddSubject={handleAddSubject} subjects={subjects} />
        <SubjectList
          subjects={subjects}
          onRemoveSubject={handleRemoveSubject}
          calculateGWA={calculateGWA}
        />
      </motion.div>
    </div>
  );
}
