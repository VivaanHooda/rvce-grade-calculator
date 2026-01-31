import React from 'react';
import { GraduationCap, Lock } from 'lucide-react';

const SemesterSelection = ({ onSelect, onBack }) => {
    const semesters = [
        { id: 'sem3', name: '3rd Semester', icon: GraduationCap },
        { id: 'sem4', name: '4th Semester', icon: Lock, disabled: true }
    ];

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="flex items-center justify-between mb-6 sm:mb-8 px-4">
                <button
                    onClick={onBack}
                    className="text-blue-600 hover:text-blue-700 font-medium text-base sm:text-lg transition-colors"
                >
                    ← Back to Year Selection
                </button>
            </div>

            <div className="grid gap-4 sm:gap-6 max-w-lg mx-auto px-4">
                <div className="text-center mb-4 sm:mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Select Semester</h2>
                    <p className="text-sm sm:text-base text-gray-600">Choose your current semester</p>
                </div>
                {semesters.map((sem) => {
                    const Icon = sem.icon;
                    return (
                        <button
                            key={sem.id}
                            onClick={() => !sem.disabled && onSelect(sem.id)}
                            disabled={sem.disabled}
                            className={`bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-all duration-300 text-center group flex flex-col items-center gap-3 sm:gap-4 ${sem.disabled
                                ? 'opacity-60 cursor-not-allowed border-gray-100 grayscale'
                                : 'hover:border-blue-300 hover:shadow-xl transform hover:-translate-y-1 active:scale-98'
                                }`}
                        >
                            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center ${sem.disabled ? 'bg-gray-100' : 'bg-blue-100 group-hover:bg-blue-600 transition-colors'}`}>
                                <Icon className={`w-8 h-8 sm:w-10 sm:h-10 ${sem.disabled ? 'text-gray-400' : 'text-blue-600 group-hover:text-white transition-colors'}`} />
                            </div>
                            <div>
                                <h3 className={`text-lg sm:text-xl font-semibold transition-colors ${sem.disabled ? 'text-gray-400' : 'text-gray-900 group-hover:text-blue-600'}`}>
                                    {sem.name}
                                </h3>
                                {sem.disabled && <p className="text-xs sm:text-sm text-gray-500 mt-1">Coming Soon</p>}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default SemesterSelection;
