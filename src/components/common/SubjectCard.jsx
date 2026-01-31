import React from 'react';
import { gradeOptions } from '../../data/constants';

const SubjectCard = ({ subject, gradeValue, onGradeChange }) => {
    return (
        <div key={subject.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex-1">
                <span className="font-medium text-gray-900 block">{subject.name}</span>
                <span className="text-sm text-gray-600">{subject.Credit} Credit</span>
            </div>
            <select
                value={gradeValue || ''}
                onChange={(e) => onGradeChange(subject.id, e.target.value)}
                className="ml-4 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white cursor-pointer"
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
