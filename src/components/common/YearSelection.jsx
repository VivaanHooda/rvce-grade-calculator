import React, { useState } from 'react';
import { Lock, Github } from 'lucide-react';

const YearSelection = ({ onSelect }) => {
    const [showBugOptions, setShowBugOptions] = useState(false);
    let bugOptionsTimeout = null;

    const clearBugOptionsTimeout = () => {
        if (bugOptionsTimeout) {
            clearTimeout(bugOptionsTimeout);
            bugOptionsTimeout = null;
        }
    };

    const handleMouseEnter = () => {
        clearBugOptionsTimeout();
        setShowBugOptions(true);
    };

    const handleMouseLeave = () => {
        clearBugOptionsTimeout();
        bugOptionsTimeout = setTimeout(() => setShowBugOptions(false), 120);
    };

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

                {/* RVCE Logo and Bug Report Buttons */}
                <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                    {/* RVCE Website Link */}
                    <a
                        href="https://rvce.edu.in/academics_and_examinations/rvce_scheme_syllabus/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-98 group flex items-center justify-center h-full"
                    >
                        <img
                            src="/rvce.png"
                            alt="RVCE"
                            className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                        />
                    </a>

                    {/* Bug Report Button */}
                    <div
                        className="relative h-full"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <button className="w-full h-full bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 hover:border-red-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-98 group flex items-center justify-center gap-2">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 group-hover:text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                Report Bugs
                            </span>
                        </button>

                        {/* Dropdown Menu */}
                        <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 transition-all duration-300 z-50 ${
                            showBugOptions ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'
                        }`}>
                            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-3 min-w-[200px]">
                                <div className="space-y-2">
                                    <a
                                        href="https://github.com/VivaanHooda/rvce-grade-calculator"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
                                    >
                                        <Github className="w-5 h-5 text-gray-700 group-hover:text-black" />
                                        <span className="text-gray-700 group-hover:text-black font-medium text-sm">GitHub</span>
                                    </a>
                                    <a
                                        href="mailto:padithya.ai24@rvce.edu.in,vivaanhooda.is24@rvce.edu.in"
                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
                                    >
                                        <svg className="w-5 h-5 text-red-500 group-hover:text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                        </svg>
                                        <span className="text-gray-700 group-hover:text-black font-medium text-sm">Gmail</span>
                                    </a>
                                </div>
                                {/* Triangle arrow */}
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                                    <div className="w-3 h-3 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default YearSelection;
