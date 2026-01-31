import React, { useState, useEffect } from 'react';
import { Info, Github } from 'lucide-react';

// Import utilities
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from './utils/storage';

// Import shell components
import YearSelection from './components/common/YearSelection';
import SemesterSelection from './components/common/SemesterSelection';
import Year1Calculator from './features/year1/Year1Calculator';
import Sem3Calculator from './features/sem3/Sem3Calculator';

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
    <div className="flex justify-center z-40" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="relative">
        <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 text-xs sm:text-sm font-medium">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          <span>Report Bugs / Contribute</span>
        </button>

        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 transition-all duration-300 ${showBugOptions ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}>
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-3 min-w-[180px]">
            <div className="space-y-2">
              <a
                href="https://github.com/VivaanHooda/rvce-grade-calculator"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <Github className="w-5 h-5 text-gray-700 group-hover:text-black" />
                <span className="text-gray-700 group-hover:text-black font-medium">GitHub</span>
              </a>
              <a
                href="mailto:vivaan.hooda@gmail.com"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <svg className="w-5 h-5 text-red-500 group-hover:text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span className="text-gray-700 group-hover:text-black font-medium">Gmail</span>
              </a>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 transform translate-y-full">
              <div className="w-3 h-3 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CGPACalculator = () => {
  const [currentYear, setCurrentYear] = useState(() => loadFromStorage(STORAGE_KEYS.CURRENT_YEAR, ''));
  const [currentSemester, setCurrentSemester] = useState(() => loadFromStorage(STORAGE_KEYS.CURRENT_SEMESTER, ''));

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CURRENT_YEAR, currentYear);
    saveToStorage(STORAGE_KEYS.CURRENT_SEMESTER, currentSemester);
  }, [currentYear, currentSemester]);

  const handleYearSelect = (year) => {
    setCurrentYear(year);
    setCurrentSemester('');
  };

  const handleSemesterSelect = (sem) => {
    setCurrentSemester(sem);
  };

  const handleBackToYear = () => {
    setCurrentYear('');
    setCurrentSemester('');
  };

  const handleBackToSemester = () => {
    setCurrentSemester('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <div className="flex-grow container mx-auto px-4 sm:px-6 pt-8 sm:pt-12 md:pt-16 pb-8 sm:pb-12 max-w-7xl">
        {!currentYear && <YearSelection onSelect={handleYearSelect} />}

        {currentYear === 'year1' && (
          <Year1Calculator onBack={handleBackToYear} />
        )}

        {currentYear === 'year2' && !currentSemester && (
          <SemesterSelection onSelect={handleSemesterSelect} onBack={handleBackToYear} />
        )}

        {currentYear === 'year2' && currentSemester === 'sem3' && (
          <Sem3Calculator onBack={handleBackToSemester} />
        )}

        {/* Disclaimer Footer and Bug Report - Only show on first page */}
        {!currentYear && (
          <>
            <div className="fixed bottom-32 left-0 right-0 sm:relative sm:bottom-auto sm:max-w-3xl sm:mx-auto sm:mt-12 sm:pt-8 sm:border-t sm:border-gray-200 pointer-events-none">
              <div className="flex items-center justify-center gap-1.5 px-3">
                <Info className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <p className="text-[10px] sm:text-xs text-gray-400 sm:text-gray-500 whitespace-nowrap sm:whitespace-normal">
                  <span className="font-semibold">Disclaimer:</span> Not official. No responsibility for discrepancies.
                </p>
              </div>
            </div>
            <div className="fixed bottom-16 left-0 right-0 sm:relative sm:bottom-auto sm:max-w-3xl sm:mx-auto sm:mt-4">
              <BugReportButton />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CGPACalculator;