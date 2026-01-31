import React from 'react';
import { Lock } from 'lucide-react';

const YearSelection = ({ onSelect }) => {
    const years = [
        { id: 'year1', title: '1st Year', description: 'Physics & Chemistry Cycles', number: '1' },
        { id: 'year2', title: '2nd Year', description: '3rd & 4th Semesters', number: '2' },
        { id: 'year3', title: '3rd Year', description: 'Coming Soon', disabled: true },
        { id: 'year4', title: '4th Year', description: 'Coming Soon', disabled: true }
    ];

    return (
        <div className="space-y-8 sm:space-y-12">
            <div className="text-center px-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-3 sm:mb-4 tracking-tight">
                    RVCE <span className="text-blue-600">Grade</span> Calculator
                </h1>
                <div className="flex justify-center items-center w-full px-2">
                    <p className="text-gray-600 whitespace-nowrap" style={{ fontSize: 'clamp(0.65rem, 3.5vw, 1.25rem)' }}>
                        An advanced academic tracking tool for RVCE students
                    </p>
                </div>
            </div>

            <div className="grid gap-4 sm:gap-6 md:gap-8 max-w-2xl mx-auto px-4">
                {years.map((year) => (
                    <button
                        key={year.id}
                        onClick={() => !year.disabled && onSelect(year.id)}
                        disabled={year.disabled}
                        className={`bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 transition-all duration-300 text-left group flex items-center gap-4 sm:gap-6 ${year.disabled
                            ? 'opacity-60 cursor-not-allowed border-gray-100 grayscale'
                            : 'hover:border-blue-300 hover:shadow-xl transform hover:-translate-y-1 active:scale-98'
                            }`}
                    >
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-bold transition-all ${year.disabled
                            ? 'bg-gray-100 text-gray-400'
                            : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white group-hover:shadow-lg group-hover:scale-105'
                            }`}>
                            {year.disabled ? <Lock className="w-5 h-5 sm:w-6 sm:h-6" /> : year.number}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className={`text-lg sm:text-xl md:text-2xl font-bold transition-colors ${year.disabled ? 'text-gray-400' : 'text-gray-900 group-hover:text-blue-600'}`}>
                                {year.title}
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 truncate">{year.description}</p>
                        </div>
                        {!year.disabled && (
                            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex">
                                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg">
                                    →
                                </div>
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default YearSelection;
