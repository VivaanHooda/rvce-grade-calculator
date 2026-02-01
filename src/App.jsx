import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';

// Import utilities
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from './utils/storage';

// Import shell components
import YearSelection from './components/common/YearSelection';
import SemesterSelection from './components/common/SemesterSelection';
import Year1Calculator from './features/year1/Year1Calculator';
import Sem3Calculator from './features/sem3/Sem3Calculator';
import BugReportButton from './components/common/BugReportButton';

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

        {/* Disclaimer Footer - Only show on first page */}
        {!currentYear && (
          <div className="fixed bottom-32 left-0 right-0 sm:relative sm:bottom-auto sm:max-w-3xl sm:mx-auto sm:mt-12 sm:pt-8 sm:border-t sm:border-gray-200 pointer-events-none">
            <div className="flex items-center justify-center gap-1.5 px-3">
              <Info className="w-3 h-3 text-gray-400 flex-shrink-0" />
              <p className="text-[10px] sm:text-xs text-gray-400 sm:text-gray-500 whitespace-nowrap sm:whitespace-normal">
                <span className="font-semibold">Disclaimer:</span> Not official. No responsibility for discrepancies.
              </p>
            </div>
          </div>
        )}

        {/* Global Floating Bug Report Button */}
        <BugReportButton />
      </div>
    </div>
  );
};

export default CGPACalculator;