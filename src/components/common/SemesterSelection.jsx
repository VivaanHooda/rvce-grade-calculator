import React from 'react';

const SemesterSelection = ({ onSelect, onBack }) => {
    const semesters = [
        { id: 'sem3', name: '3rd Semester', emoji: '📚' },
        { id: 'sem4', name: '4th Semester', emoji: '🔒', disabled: true }
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={onBack}
                    className="text-blue-600 hover:text-blue-700 font-medium text-lg transition-colors"
                >
                    ← Back to Year Selection
                </button>
            </div>

            <div className="grid gap-6 max-w-lg mx-auto">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-900">Select Semester</h2>
                    <p className="text-gray-600">Choose your current semester</p>
                </div>
                {semesters.map((sem) => (
                    <button
                        key={sem.id}
                        onClick={() => !sem.disabled && onSelect(sem.id)}
                        disabled={sem.disabled}
                        className={`bg-white border border-gray-200 rounded-3xl p-8 transition-all duration-300 text-center group flex flex-col items-center gap-4 ${sem.disabled
                            ? 'opacity-60 cursor-not-allowed border-gray-100 grayscale'
                            : 'hover:border-blue-300 hover:shadow-xl transform hover:-translate-y-1'
                            }`}
                    >
                        <div className="text-5xl">{sem.emoji}</div>
                        <div>
                            <h3 className={`text-xl font-semibold transition-colors ${sem.disabled ? 'text-gray-400' : 'text-gray-900 group-hover:text-blue-600'}`}>
                                {sem.name}
                            </h3>
                            {sem.disabled && <p className="text-sm text-gray-500 mt-1">Coming Soon</p>}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SemesterSelection;
