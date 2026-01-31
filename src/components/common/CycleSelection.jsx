import React from 'react';

const CycleSelection = ({ onSelect, onBack }) => {
    const cycles = [
        { id: 'physics', name: 'Physics Cycle', emoji: '⚡' },
        { id: 'chemistry', name: 'Chemistry Cycle', emoji: '🧪' }
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={onBack}
                    className="text-blue-600 hover:text-blue-700 font-medium text-lg transition-colors"
                >
                    ← Back to Modes
                </button>
            </div>

            <div className="grid gap-6 max-w-lg mx-auto">
                {cycles.map((cycle) => (
                    <button
                        key={cycle.id}
                        onClick={() => onSelect(cycle.id)}
                        className="bg-white border border-gray-200 rounded-3xl p-8 hover:border-blue-300 hover:shadow-xl transition-all duration-300 text-center group transform hover:-translate-y-1"
                    >
                        <div className="text-5xl mb-4">{cycle.emoji}</div>
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {cycle.name}
                        </h3>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CycleSelection;
