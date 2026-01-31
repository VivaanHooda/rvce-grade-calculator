import React, { useMemo } from 'react';
import { Calculator, BookOpen, Award } from 'lucide-react';

const ModeSelection = ({ onSelect, onBack }) => {
    const modes = useMemo(() => [
        {
            id: 'cie-final',
            title: 'CIE Finalization & SEE Marks Required',
            icon: <Calculator className="w-6 h-6 sm:w-7 sm:h-7" />,
            color: 'from-blue-500 to-blue-600'
        },
        {
            id: 'final-grade',
            title: 'Final Grade Calculator',
            icon: <BookOpen className="w-6 h-6 sm:w-7 sm:h-7" />,
            color: 'from-purple-500 to-purple-600'
        },
        {
            id: 'final-cgpa',
            title: 'Final GPA Calculator',
            icon: <Award className="w-6 h-6 sm:w-7 sm:h-7" />,
            color: 'from-green-500 to-green-600'
        }
    ], []);

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="flex items-center justify-between mb-6 sm:mb-8 px-4">
                <button
                    onClick={onBack}
                    className="text-blue-600 hover:text-blue-700 font-medium text-base sm:text-lg transition-all duration-200 hover:-translate-x-1"
                >
                    ← Back to Year Selection
                </button>
            </div>

            <div className="grid gap-3 sm:gap-4 px-4 max-w-2xl mx-auto">
                {modes.map((mode) => (
                    <button
                        key={mode.id}
                        onClick={() => onSelect(mode.id)}
                        className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-left hover:border-blue-200 hover:shadow-apple-lg transition-all duration-300 group relative flex items-center gap-4 sm:gap-5 overflow-hidden active:scale-[0.98]"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-r ${mode.color} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300`} />
                        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${mode.color} text-white flex items-center justify-center shadow-apple-md group-hover:shadow-apple-lg group-hover:scale-105 transition-all duration-300 flex-shrink-0`}>
                            {mode.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                                {mode.title}
                            </h3>
                        </div>
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 flex-shrink-0 group-hover:translate-x-1">
                            <span className="text-lg">→</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ModeSelection;
