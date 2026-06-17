import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';

// Import utilities
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from './utils/storage';

// Import shell components
import YearSelection from './components/common/YearSelection';
import SemesterSelection from './components/common/SemesterSelection';
import Year1Calculator from './features/year1/Year1Calculator';
import Sem3Calculator from './features/sem3/Sem3Calculator';
import Sem4Calculator from './features/sem4/Sem4Calculator';
import Sem6Calculator from './features/sem6/Sem6Calculator';
import AmbientBackground from './components/common/AmbientBackground';

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
    <div className="relative flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Ambient background — calm layered depth (replaces the old animated grid) */}
      <AmbientBackground />
      <div className="container relative z-10 flex-grow px-4 pt-8 pb-8 mx-auto pointer-events-none sm:px-6 sm:pt-12 md:pt-16 sm:pb-12 max-w-7xl">
        <div className="pointer-events-auto">
        {!currentYear && <YearSelection onSelect={handleYearSelect} />}

        {currentYear === 'year1' && (
          <Year1Calculator onBack={handleBackToYear} />
        )}

        {currentYear === 'year2' && !currentSemester && (
          <SemesterSelection year={currentYear} onSelect={handleSemesterSelect} onBack={handleBackToYear} />
        )}

        {currentYear === 'year2' && currentSemester === 'sem3' && (
          <Sem3Calculator onBack={handleBackToSemester} />
        )}

        {currentYear === 'year2' && currentSemester === 'sem4' && (
          <Sem4Calculator onBack={handleBackToSemester} />
        )}

        {currentYear === 'year3' && !currentSemester && (
          <SemesterSelection year={currentYear} onSelect={handleSemesterSelect} onBack={handleBackToYear} />
        )}

        {currentYear === 'year3' && currentSemester === 'sem6' && (
          <Sem6Calculator onBack={handleBackToSemester} />
        )}

        {/* Disclaimer Footer - Only show on first page */}
        {!currentYear && (
          <div className="max-w-3xl pt-6 mx-auto mt-8 border-t border-hairline sm:mt-12 sm:pt-8">
            <div className="flex items-center justify-center gap-1.5 px-2">
              <Info className="flex-shrink-0 w-3 h-3 text-gray-400" />
              <p className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap">
                <span className="font-semibold">Disclaimer:</span> Not official. No responsibility for discrepancies.
              </p>
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
};

export default CGPACalculator;