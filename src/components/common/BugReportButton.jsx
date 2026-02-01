import React, { useState } from 'react';
import { Github } from 'lucide-react';

const BugReportButton = () => {
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

    return (
        <div
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="relative">
                <button className="bg-red-500 hover:bg-red-600 text-white p-3 sm:px-4 sm:py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 text-sm font-medium">
                    <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="hidden sm:inline">Report Bugs / Contribute</span>
                </button>

                <div className={`absolute bottom-full right-0 mb-3 transition-all duration-300 ${showBugOptions ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'
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
                        <div className="absolute bottom-0 right-5 transform translate-y-1/2">
                            <div className="w-3 h-3 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BugReportButton;
