import React from 'react';
import { gradeOptions } from '../../data/constants';

const SubjectCard = ({ subject, gradeValue, onGradeChange }) => {
    return (
        <div key={subject.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200 gap-3 sm:gap-4">
            <div className="grid grid-cols-[1fr_auto] gap-3 items-start flex-1 min-w-0">
                <span className="font-medium text-gray-900 text-sm sm:text-base">{subject.name}</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                    {subject.Credit} Credit
                </span>
            </div>
            <select
                value={gradeValue || ''}
                onChange={(e) => onGradeChange(subject.id, e.target.value)}
                className="w-full sm:w-auto sm:ml-4 px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white cursor-pointer text-sm sm:text-base"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                }}
            >
                <option value="">Select Grade</option>
                {gradeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default SubjectCard;
