import React, { useMemo } from 'react';
import { Calculator, BookOpen, Award, ArrowRight } from 'lucide-react';

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
                    className="text-base font-medium transition-all duration-200 text-brand hover:text-brand-hover hover:-translate-x-1 sm:text-lg"
                >
                    ← Back to Year Selection
                </button>
            </div>

            <div className="grid gap-3 sm:gap-4 px-4 max-w-2xl mx-auto">
                {modes.map((mode) => (
                    <button
                        key={mode.id}
                        onClick={() => onSelect(mode.id)}
                        className="relative flex items-center gap-4 p-5 overflow-hidden text-left transition-all duration-300 bg-white border border-hairline rounded-card sm:p-6 shadow-card hover:border-brand/30 hover:shadow-card-hover group sm:gap-5 active:scale-[0.98]"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-r ${mode.color} opacity-0 group-hover:opacity-[0.05] transition-opacity duration-300`} />
                        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-card bg-gradient-to-br ${mode.color} text-white flex items-center justify-center shadow-float group-hover:shadow-card-hover group-hover:scale-105 transition-all duration-300 flex-shrink-0`}>
                            {mode.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold transition-colors duration-200 sm:text-lg text-ink group-hover:text-brand">
                                {mode.title}
                            </h3>
                        </div>
                        <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 transition-all duration-300 bg-gray-100 rounded-full sm:w-9 sm:h-9 text-ink-muted group-hover:bg-brand group-hover:text-white group-hover:translate-x-1">
                            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ModeSelection;
