import React from 'react';
import { Atom, FlaskConical } from 'lucide-react';

const CycleSelection = ({ onSelect, onBack }) => {
    const cycles = [
        { id: 'physics', name: 'Physics Cycle', icon: Atom },
        { id: 'chemistry', name: 'Chemistry Cycle', icon: FlaskConical }
    ];

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="flex items-center justify-between mb-6 sm:mb-8 px-4">
                <button
                    onClick={onBack}
                    className="text-base font-medium transition-all duration-200 text-brand hover:text-brand-hover hover:-translate-x-1 sm:text-lg"
                >
                    ← Back to Modes
                </button>
            </div>

            <div className="grid gap-4 sm:gap-6 max-w-lg mx-auto px-4">
                {cycles.map((cycle) => {
                    const Icon = cycle.icon;
                    return (
                    <button
                        key={cycle.id}
                        onClick={() => onSelect(cycle.id)}
                        className="flex flex-col items-center gap-3 p-6 text-center transition-all duration-300 transform bg-white border border-hairline rounded-card sm:gap-4 sm:p-8 shadow-card hover:border-brand/40 hover:shadow-card-hover hover:-translate-y-1 active:scale-[0.98] group"
                    >
                        <div className="flex items-center justify-center w-16 h-16 transition-colors duration-300 sm:w-20 sm:h-20 rounded-card bg-brand-soft group-hover:bg-brand">
                            <Icon className="w-8 h-8 transition-colors duration-300 sm:w-10 sm:h-10 text-brand group-hover:text-white" strokeWidth={1.75} />
                        </div>
                        <h3 className="text-lg font-semibold transition-colors duration-200 sm:text-xl text-ink group-hover:text-brand">
                            {cycle.name}
                        </h3>
                    </button>
                    );
                })}
            </div>
        </div>
    );
};

export default CycleSelection;
