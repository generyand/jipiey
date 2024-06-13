import { TrashIcon } from "@heroicons/react/20/solid";
import React from "react";
import { motion } from "framer-motion";

export default function SubjectList({
  subjects,
  onRemoveSubject,
  calculateGWA,
}) {
  return (
    <div className="transition">
      <div className="">
        <h2 className="subtitle">Subject List</h2>
        <ul className="flex gap-4 py-2 font-medium border-b border-b-gray-200 ">
          <li className="flex-[5_5_0%]">Title</li>
          <li className="flex-[3_3_0%]">Unit</li>
          <li className="flex-[3_3_0%]">Grade</li>
          <li className="flex-[3_3_0%]">Action</li>
        </ul>
        {subjects.map((subject, index) => (
          <motion.ul
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-4 py-2 border-b border-b-gray-200"
            key={index}
          >
            <li className="flex-[5_5_0%] truncate">
              {subject.subjectName
                ? subject.subjectName
                : `Subject ${index + 1}`}
            </li>
            <li className="flex-[3_3_0%] truncate">{subject.credits}</li>
            <li className="flex-[3_3_0%] truncate">{subject.grade}</li>
            <li className="flex-[3_3_0%] truncate">
              <button
                className="px-4 py-2 text-white transition bg-red-500 rounded-md active:bg-red-400"
                onClick={() => onRemoveSubject(index)}
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </li>
          </motion.ul>
        ))}
      </div>
      <div>
        <p className="mt-4 text-base font-bold">
          GWA: {calculateGWA().toFixed(2)}
        </p>
      </div>
    </div>
  );
}
