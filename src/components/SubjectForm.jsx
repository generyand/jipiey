import React from "react";
import { useState } from "react";
import { PlusIcon } from "@heroicons/react/20/solid";

export default function SubjectForm({ onAddSubject, subjects }) {
  const [subjectName, setSubjectName] = useState("");
  const [credits, setCredits] = useState("");
  const [grade, setGrade] = useState("4.0");

  const handleAddSubject = () => {
    if (credits > 0 && grade) {
      const newSubject = {
        subjectName,
        credits,
        grade,
      };

      onAddSubject(newSubject);
      setSubjectName("");
      setCredits("");
      setGrade("4.0");
    } else {
      alert("Please enter valid details.");
    }
  };

  return (
    <div className="form-container | flex gap-4 mb-8 w-full items-center">
      {/* Subject */}
      <div className="flex-3">
        <p>Title</p>
        <input
          className="rounded-md "
          placeholder={`Subject ${subjects.length + 1}`}
          type="text"
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
        />
      </div>

      {/* Credits */}
      <div className="flex-3">
        <p>Unit</p>
        <input
          className="rounded-md no-spinner"
          type="number"
          value={credits === 0 ? "" : credits}
          onChange={(e) => setCredits(Number(e.target.value))}
        />
      </div>

      {/* Grade */}
      <div className="">
        <p>Grade</p>
        <select
          className="flex px-4 py-2 rounded-md appearance-none outline outline-gray-400 outline-1"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
        >
          <option value="4.0">4.0</option>
          <option value="3.5">3.5</option>
          <option value="3.0">3.0</option>
          <option value="2.5">2.5</option>
          <option value="2.0">2.0</option>
        </select>
      </div>

      <div className="">
        <p className="opacity-0">-</p>
        <button
          className="p-2 text-white transition rounded-md bg-sky-500 active:bg-sky-400"
          onClick={handleAddSubject}
        >
          <PlusIcon className="w-6" />
        </button>
      </div>
    </div>
  );
}
