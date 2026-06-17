import React, { useState } from 'react';
import { Lock, Github, ArrowRight } from 'lucide-react';
import LiquidGlassCard from './LiquidGlassCard';

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
        { id: 'year3', title: '3rd Year', description: '5th & 6th Semesters', number: '3' },
        { id: 'year4', title: '4th Year', description: 'Coming Soon', disabled: true }
    ];

    return (
        <div className="space-y-8 sm:space-y-12">
            <LiquidGlassCard
                href="https://codingclubrvce.com"
                className="max-w-2xl mx-auto"
                contentClassName="px-6 py-9 sm:px-12 sm:py-11 text-center"
            >
                <div className="flex justify-center mb-4 sm:mb-5">
                    <img src="/cclogo.png" alt="Coding Club Logo" className="object-contain w-auto h-16 sm:h-20 md:h-24" />
                </div>
                <h1 className="mb-3 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl text-ink sm:mb-4">
                    RVCE <span className="text-brand">Grade</span> Calculator
                </h1>
                <div className="flex items-center justify-center w-full px-2">
                    <p className="text-[clamp(0.7rem,3.2vw,1.15rem)] text-ink-muted whitespace-nowrap">
                        An advanced academic tracking tool for RVCE students
                    </p>
                </div>
            </LiquidGlassCard>

            <div className="grid gap-4 sm:gap-6 md:gap-8 max-w-2xl mx-auto px-4">
                {years.map((year) => (
                    <button
                        key={year.id}
                        onClick={() => !year.disabled && onSelect(year.id)}
                        disabled={year.disabled}
                        className={`bg-white border rounded-card p-5 sm:p-6 md:p-8 transition-all duration-300 text-left group flex items-center gap-4 sm:gap-6 ${year.disabled
                            ? 'opacity-60 cursor-not-allowed border-gray-100 grayscale shadow-card'
                            : 'border-hairline shadow-card hover:shadow-card-hover hover:border-brand/40 transform hover:-translate-y-1 active:scale-[0.98]'
                            }`}
                    >
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-card flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-semibold transition-colors duration-300 ${year.disabled
                            ? 'bg-gray-100 text-ink-subtle'
                            : 'bg-brand-soft text-brand group-hover:bg-brand group-hover:text-white'
                            }`}>
                            {year.disabled ? <Lock className="w-5 h-5 sm:w-6 sm:h-6" /> : year.number}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className={`text-lg sm:text-xl md:text-2xl font-bold transition-colors duration-200 ${year.disabled ? 'text-ink-subtle' : 'text-ink group-hover:text-brand'}`}>
                                {year.title}
                            </h3>
                            <p className="text-sm truncate sm:text-base text-ink-muted">{year.description}</p>
                        </div>
                        {!year.disabled && (
                            <div className="hidden ml-auto transition-all duration-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 sm:flex">
                                <ArrowRight className="w-5 h-5 text-brand" strokeWidth={2.5} />
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
                        className="flex items-center justify-center h-full p-4 transition-all duration-300 transform bg-white border border-hairline rounded-card sm:p-6 shadow-card hover:border-brand/40 hover:shadow-card-hover hover:-translate-y-1 active:scale-[0.98] group"
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
                        <button className="flex items-center justify-center w-full h-full gap-2 p-4 transition-all duration-300 transform bg-white border border-hairline rounded-card sm:p-6 shadow-card hover:border-red-300 hover:shadow-card-hover hover:-translate-y-1 active:scale-[0.98] group">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 group-hover:text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-ink">
                                Report Bugs
                            </span>
                        </button>

                        {/* Dropdown Menu */}
                        <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 transition-all duration-300 z-dropdown ${
                            showBugOptions ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'
                        }`}>
                            <div className="bg-white rounded-card shadow-float border border-hairline p-3 min-w-[200px]">
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
                                    <div className="w-3 h-3 bg-white border-r border-b border-hairline transform rotate-45"></div>
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
