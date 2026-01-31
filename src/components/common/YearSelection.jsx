import React from 'react';
import { Calculator } from 'lucide-react';

const YearSelection = ({ onSelect }) => {
    const years = [
        { id: 'year1', title: '1st Year', description: 'Physics & Chemistry Cycles', icon: '⚡' },
        { id: 'year2', title: '2nd Year', description: '3rd & 4th Semesters', icon: '📚' },
        { id: 'year3', title: '3rd Year', description: 'Coming Soon', icon: '🔒', disabled: true },
        { id: 'year4', title: '4th Year', description: 'Coming Soon', icon: '🔒', disabled: true }
    ];

    return (
        <div className="space-y-12">
            <div className="text-center">
                <h1 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                    RVCE <span className="text-blue-600">Grade</span> Calculator
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    An advanced academic tracking tool for RVCE students
                </p>
            </div>

            <div className="grid gap-8 max-w-2xl mx-auto">
                {years.map((year) => (
                    <button
                        key={year.id}
                        onClick={() => !year.disabled && onSelect(year.id)}
                        disabled={year.disabled}
                        className={`bg-white border border-gray-200 rounded-3xl p-8 transition-all duration-300 text-left group flex items-center gap-6 ${year.disabled
                            ? 'opacity-60 cursor-not-allowed border-gray-100 grayscale'
                            : 'hover:border-blue-300 hover:shadow-xl transform hover:-translate-y-1'
                            }`}
                    >
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-colors ${year.disabled ? 'bg-gray-100' : 'bg-blue-50 group-hover:bg-blue-100'}`}>
                            {year.icon}
                        </div>
                        <div>
                            <h3 className={`text-2xl font-bold transition-colors ${year.disabled ? 'text-gray-400' : 'text-gray-900 group-hover:text-blue-600'}`}>
                                {year.title}
                            </h3>
                            <p className="text-gray-600">{year.description}</p>
                        </div>
                        {!year.disabled && (
                            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
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
