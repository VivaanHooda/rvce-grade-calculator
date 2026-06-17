import React from 'react';
import { GraduationCap, Lock } from 'lucide-react';

const SemesterSelection = ({ year, onSelect, onBack }) => {
    const semesters = year === 'year3' ? [
        { id: 'sem5', name: '5th Semester', icon: Lock, disabled: true },
        { id: 'sem6', name: '6th Semester', icon: GraduationCap }
    ] : [
        { id: 'sem3', name: '3rd Semester', icon: GraduationCap },
        { id: 'sem4', name: '4th Semester', icon: GraduationCap }
    ];

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="flex items-center justify-between px-4 mb-6 sm:mb-8">
                <button
                    onClick={onBack}
                    className="text-base font-medium transition-all duration-200 text-brand hover:text-brand-hover hover:-translate-x-1 sm:text-lg"
                >
                    ← Back to Year Selection
                </button>
            </div>

            <div className="grid max-w-lg gap-4 px-4 mx-auto sm:gap-6">
                <div className="mb-4 text-center sm:mb-6">
                    <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Select Semester</h2>
                    <p className="text-sm text-ink-muted sm:text-base">Choose your current semester</p>
                </div>
                {semesters.map((sem) => {
                    const Icon = sem.icon;
                    return (
                        <button
                            key={sem.id}
                            onClick={() => !sem.disabled && onSelect(sem.id)}
                            disabled={sem.disabled}
                            className={`bg-white border rounded-card p-6 sm:p-8 transition-all duration-300 text-center group flex flex-col items-center gap-3 sm:gap-4 ${sem.disabled
                                ? 'opacity-60 cursor-not-allowed border-gray-100 grayscale shadow-card'
                                : 'border-hairline shadow-card hover:border-brand/40 hover:shadow-card-hover transform hover:-translate-y-1 active:scale-[0.98]'
                                }`}
                        >
                            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-card flex items-center justify-center transition-colors duration-300 ${sem.disabled ? 'bg-gray-100' : 'bg-brand-soft group-hover:bg-brand'}`}>
                                <Icon className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors duration-300 ${sem.disabled ? 'text-ink-subtle' : 'text-brand group-hover:text-white'}`} />
                            </div>
                            <div>
                                <h3 className={`text-lg sm:text-xl font-semibold transition-colors duration-200 ${sem.disabled ? 'text-ink-subtle' : 'text-ink group-hover:text-brand'}`}>
                                    {sem.name}
                                </h3>
                                {sem.disabled && <p className="mt-1 text-xs text-ink-muted sm:text-sm">Coming Soon</p>}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default SemesterSelection;
