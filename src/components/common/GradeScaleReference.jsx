import React from 'react';

const GradeScaleReference = () => {
    const grades = [
        { point: 10, letter: 'O' },
        { point: 9, letter: 'A+' },
        { point: 8, letter: 'A' },
        { point: 7, letter: 'B+' },
        { point: 6, letter: 'B' },
        { point: 5, letter: 'C' },
        { point: 4, letter: 'P' },
        { point: '<4', letter: 'F' }
    ];

    return (
        <div className="mt-6 sm:mt-8 bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
            <h4 className="text-sm sm:text-base font-semibold text-gray-700 mb-3 sm:mb-4">Grade Scale Reference</h4>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
                {grades.map((grade, index) => (
                    <div
                        key={index}
                        className="bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center"
                    >
                        <div className="text-base sm:text-lg font-bold text-gray-900">{grade.point}</div>
                        <div className="text-xs sm:text-sm text-gray-500">{grade.letter}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GradeScaleReference;
