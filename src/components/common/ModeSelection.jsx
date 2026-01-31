import React, { useMemo } from 'react';
import { Calculator, BookOpen, Award } from 'lucide-react';

const ModeSelection = ({ onSelect, onBack }) => {
    const modes = useMemo(() => [
        {
            id: 'cie-final',
            title: 'CIE Finalization & SEE Marks Required',
            description: 'Calculate your Continuous Internal Evaluation final marks',
            icon: <Calculator className="w-6 h-6" />,
            color: 'from-blue-500 to-blue-600'
        },
        {
            id: 'final-grade',
            title: 'Final Grade Calculator',
            description: 'Complete grade calculation with predicted SEE marks',
            icon: <BookOpen className="w-6 h-6" />,
            color: 'from-purple-500 to-purple-600'
        },
        {
            id: 'final-cgpa',
            title: 'Final GPA Calculator',
            description: 'Calculate GPA across both Physics and Chemistry cycles',
            icon: <Award className="w-6 h-6" />,
            color: 'from-green-500 to-green-600'
        }
    ], []);

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

            <div className="grid gap-6">
                {modes.map((mode) => (
                    <button
                        key={mode.id}
                        onClick={() => onSelect(mode.id)}
                        className="bg-white border border-gray-200 rounded-3xl p-6 text-left hover:border-transparent hover:shadow-xl transition-all duration-300 group relative flex items-center gap-6 overflow-hidden"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-r ${mode.color} opacity-0 group-hover:opacity-[0.03] transition-opacity`} />
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${mode.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            {mode.icon}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                {mode.title}
                            </h3>
                            <p className="text-gray-600">{mode.description}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                            →
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ModeSelection;
