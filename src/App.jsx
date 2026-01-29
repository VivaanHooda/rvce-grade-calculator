import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Calculator, BookOpen, Award, BarChart3, ChevronRight, Lock, Unlock, X, Copy, Info, Github, ChevronLeft } from 'lucide-react';

// Import utilities
import { STORAGE_KEYS, saveToStorage, loadFromStorage, clearAllStorage } from './utils/storage';
import { getMaxValue } from './utils/calculations';

// Import popup components
import SEERequirementsPopup from './components/common/SEERequirementsPopup';
import CGPAResultsPopup from './components/common/CGPAResultsPopup';
import SGPAResultsPopup from './components/common/SGPAResultsPopup';

// Import form components
import SGPAInput from './components/forms/SGPAInput';

// Module-level variable to hold form data - this prevents focus loss
let updatedFormData = {};
let updatedSgpaValues = {};

// Grade options constant
const gradeOptions = [
  { value: 10, label: 'O  (10)' },
  { value: 9, label: 'A+ (9)' },
  { value: 8, label: 'A  (8)' },
  { value: 7, label: 'B+ (7)' },
  { value: 6, label: 'B  (6)' },
  { value: 5, label: 'C  (5)' },
  { value: 4, label: 'P  (4)' },
  { value: 0, label: 'F  (0)' }
];

// 3rd Sem subjects constant
const sem3SubjectsCGPA_CSECore = [
  { id: 'math-sem3', name: 'Mathematics', Credit: 4, type: 'math' },
  { id: 'dsa-sem3', name: 'DSA', Credit: 4, type: 'regular' },
  { id: 'adld-sem3', name: 'ADLD', Credit: 4, type: 'regular' },
  { id: 'os-sem3', name: 'Operating Systems', Credit: 4, type: 'regular' },
  { id: 'basket-sem3', name: 'Basket Course', Credit: 3, type: 'regular' },
  { id: 'dtl-sem3', name: 'DTL', Credit: 2, type: 'regular' }
];

const sem3SubjectsCGPA_AIML = [
  { id: 'math-sem3', name: 'Mathematics', Credit: 4, type: 'math' },
  { id: 'dsa-sem3', name: 'DSA', Credit: 4, type: 'regular' },
  { id: 'cps-sem3', name: 'Cyber Physical Systems', Credit: 4, type: 'regular' },
  { id: 'stats-sem3', name: 'Statistics', Credit: 4, type: 'regular' },
  { id: 'basket-sem3', name: 'Basket Course', Credit: 3, type: 'regular' },
  { id: 'dtl-sem3', name: 'DTL', Credit: 2, type: 'regular' }
];

const sem3SubjectsCGPA_ISE = [
  { id: 'math-sem3', name: 'Mathematics', Credit: 4, type: 'math' },
  { id: 'dsa-sem3', name: 'DSA', Credit: 4, type: 'regular' },
  { id: 'os-sem3', name: 'Operating Systems', Credit: 4, type: 'regular' },
  { id: 'ldco-sem3', name: 'LDCO', Credit: 4, type: 'regular' },
  { id: 'basket-sem3', name: 'Basket Course', Credit: 3, type: 'regular' },
  { id: 'dtl-sem3', name: 'DTL', Credit: 2, type: 'regular' }
];

// Physics and Chemistry cycle subjects for 1st year
const physicsSubjectsCGPA = [
  { id: 'math', name: 'Mathematics', Credit: 4, type: 'math' },
  { id: 'phy', name: 'Physics', Credit: 4, type: 'lab' },
  { id: 'esc-p', name: 'ESC', Credit: 3, type: 'regular' },
  { id: 'etc', name: 'ETC', Credit: 3, type: 'regular' },
  { id: 'core', name: 'Core', Credit: 3, type: 'regular' },
  { id: 'idea-lab', name: 'IDEA Lab', Credit: 1, type: 'regular' },
  { id: 'comm-eng-p', name: 'Communicative English', Credit: 1, type: 'regular' },
  { id: 'kannada', name: 'Kannada', Credit: 1, type: 'regular' }
];

const chemistrySubjectsCGPA = [
  { id: 'math-c', name: 'Mathematics', Credit: 4, type: 'math' },
  { id: 'chem', name: 'Chemistry', Credit: 4, type: 'lab' },
  { id: 'esc-c', name: 'ESC', Credit: 3, type: 'regular' },
  { id: 'plc', name: 'PLC', Credit: 3, type: 'lab' },
  { id: 'caeg', name: 'Computer Aided Engineering Graphics', Credit: 3, type: 'regular' },
  { id: 'comm-eng-c', name: 'Communicative English', Credit: 1, type: 'regular' },
  { id: 'constitution', name: 'Fundamentals of Indian Constitution', Credit: 1, type: 'regular' },
  { id: 'yoga', name: 'Yoga', Credit: 1, type: 'regular' }
];

// Move FinalCGPAView outside to prevent recreation
const FinalCGPAView = React.memo(({
  finalCGPAGrades,
  setFinalCGPAGrades,
  firstYearCGPA,
  setFirstYearCGPA,
  handleSetCurrentMode,
  handleSGPACompute,
  handleFinalCGPACompute,
  currentBranch,
  currentYear,
  subjectGrades // Add this to access already-calculated grades
}) => {
  // Get the correct subjects array based on branch (for year2)
  const sem3SubjectsCGPA = currentBranch === 'cse-aiml' ? sem3SubjectsCGPA_AIML :
    currentBranch === 'ise' ? sem3SubjectsCGPA_ISE :
      sem3SubjectsCGPA_CSECore;

  // Auto-populate grades from Final Grade Calculator when component mounts
  useEffect(() => {
    if (!subjectGrades || Object.keys(subjectGrades).length === 0) return;

    const newGrades = { ...finalCGPAGrades };
    let hasChanges = false;

    if (currentYear === 'year1') {
      // For year1, map physics and chemistry subjects
      physicsSubjectsCGPA.forEach(subject => {
        const grade = subjectGrades[subject.id];
        if (grade && grade.gradePoint !== undefined && (!finalCGPAGrades.physics || !finalCGPAGrades.physics[subject.id])) {
          if (!newGrades.physics) newGrades.physics = {};
          newGrades.physics[subject.id] = grade.gradePoint;
          hasChanges = true;
        }
      });

      chemistrySubjectsCGPA.forEach(subject => {
        const grade = subjectGrades[subject.id];
        if (grade && grade.gradePoint !== undefined && (!finalCGPAGrades.chemistry || !finalCGPAGrades.chemistry[subject.id])) {
          if (!newGrades.chemistry) newGrades.chemistry = {};
          newGrades.chemistry[subject.id] = grade.gradePoint;
          hasChanges = true;
        }
      });
    } else {
      // For year2, map sem3 subjects
      sem3SubjectsCGPA.forEach(subject => {
        const grade = subjectGrades[subject.id];
        if (grade && grade.gradePoint !== undefined && (!finalCGPAGrades.sem3 || !finalCGPAGrades.sem3[subject.id])) {
          if (!newGrades.sem3) newGrades.sem3 = {};
          newGrades.sem3[subject.id] = grade.gradePoint;
          hasChanges = true;
        }
      });
    }

    if (hasChanges) {
      setFinalCGPAGrades(newGrades);
    }
  }, [currentYear, currentBranch]); // Only run on mount or when year/branch changes

  const handleGradeChange = useCallback((semester, subjectId, grade) => {
    setFinalCGPAGrades(prev => ({
      ...prev,
      [semester]: {
        ...prev[semester],
        [subjectId]: grade === '' ? undefined : parseInt(grade)
      }
    }));
  }, [setFinalCGPAGrades]);

  const handleFirstYearCGPAChange = useCallback((e) => {
    const value = e.target.value;
    const numericRegex = /^[0-9]*\.?[0-9]*$/;
    if (value === '' || numericRegex.test(value)) {
      const numValue = parseFloat(value) || 0;
      if (value === '' || (numValue >= 0 && numValue <= 10)) {
        setFirstYearCGPA(value);
      }
    }
  }, [setFirstYearCGPA]);

  const renderSubjectCard = useCallback((subject, semester) => (
    <div key={subject.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
      <div className="flex-1">
        <span className="font-medium text-gray-900 block">{subject.name}</span>
        <span className="text-sm text-gray-600">{subject.Credit} Credit</span>
      </div>
      <select
        value={(finalCGPAGrades[semester] && finalCGPAGrades[semester][subject.id]) || ''}
        onChange={(e) => handleGradeChange(semester, subject.id, e.target.value)}
        className="ml-4 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white cursor-pointer"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 0.5rem center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '1.5em 1.5em',
          paddingRight: '2.5rem'
        }}
      >
        <option value="">Select Grade</option>
        {gradeOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  ), [finalCGPAGrades, handleGradeChange]);

  // For Year 1: Show Physics and Chemistry cycles
  if (currentYear === 'year1') {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => handleSetCurrentMode('')}
            className="text-blue-600 hover:text-blue-700 font-medium text-lg transition-colors"
          >
            ← Back
          </button>
          <div className="w-32"></div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Physics Cycle */}
          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                ⚡ Physics Cycle
              </h3>
              <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                20 Credits
              </span>
            </div>
            <div className="space-y-3">
              {physicsSubjectsCGPA.map((subject) => renderSubjectCard(subject, 'physics'))}
            </div>
            {/* Compute SGPA Button */}
            <button
              onClick={() => handleSGPACompute('physics')}
              className="w-full mt-4 py-3 px-4 rounded-xl font-medium transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Compute SGPA
            </button>
          </div>

          {/* Chemistry Cycle */}
          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                🧪 Chemistry Cycle
              </h3>
              <span className="inline-block bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                20 Credits
              </span>
            </div>
            <div className="space-y-3">
              {chemistrySubjectsCGPA.map((subject) => renderSubjectCard(subject, 'chemistry'))}
            </div>
            {/* Compute SGPA Button */}
            <button
              onClick={() => handleSGPACompute('chemistry')}
              className="w-full mt-4 py-3 px-4 rounded-xl font-medium transition-all bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Compute SGPA
            </button>
          </div>
        </div>

        {/* Compute CGPA Button */}
        <div className="text-center">
          <button
            onClick={handleFinalCGPACompute}
            className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-xl font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
          >
            Compute CGPA
          </button>
        </div>
      </div>
    );
  }

  // For Year 2: Show 3rd Sem + 1st Year CGPA Input
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => handleSetCurrentMode('')}
          className="text-blue-600 hover:text-blue-700 font-medium text-lg transition-colors"
        >
          ← Back
        </button>
        <div className="w-32"></div>
      </div>

      {/* Single Column for 3rd Sem */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              📚 3rd Sem SGPA
            </h3>
            <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              21 Credits
            </span>
          </div>
          <div className="space-y-3">
            {sem3SubjectsCGPA.map((subject) => renderSubjectCard(subject, 'sem3'))}
          </div>
          {/* Compute SGPA Button */}
          <button
            onClick={() => handleSGPACompute('sem3')}
            className="w-full mt-4 py-3 px-4 rounded-xl font-medium transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Compute SGPA
          </button>

          {/* Debug info */}
          <div className="mt-2 text-xs text-gray-500">
            Selected grades: {Object.keys(finalCGPAGrades.sem3 || {}).length} / {sem3SubjectsCGPA.length}
          </div>
        </div>

        {/* 1st Year CGPA Input */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">1st Year CGPA</h3>
            <span className="inline-block bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
              40 Credits
            </span>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
            <label className="text-purple-900 font-medium block mb-2">Enter your 1st Year CGPA</label>
            <input
              type="text"
              value={firstYearCGPA}
              onChange={handleFirstYearCGPAChange}
              placeholder="Enter CGPA (0-10)"
              className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white text-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Compute CGPA Button */}
      <div className="text-center">
        <div className="mb-4">
          <p className="text-gray-600 text-sm">
            Total: <span className="font-semibold">61 Credits</span> (40 from 1st Year + 21 from 3rd Sem)
          </p>
        </div>
        {!firstYearCGPA || parseFloat(firstYearCGPA) === 0 ? (
          <div className="space-y-2">
            <button
              disabled
              className="bg-gray-400 text-white py-4 px-8 rounded-xl font-medium text-lg shadow-lg cursor-not-allowed opacity-60"
            >
              Compute CGPA
            </button>
            <p className="text-red-600 text-sm font-medium">⚠️ Please enter 1st Year CGPA first</p>
          </div>
        ) : (
          <button
            onClick={handleFinalCGPACompute}
            className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-xl font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
          >
            Compute CGPA
          </button>
        )}
      </div>
    </div>
  );
});

// Move components outside of the main component to prevent re-creation on each render
const SubjectForm = ({ subject, formData, currentMode, onCalculate, subjectGrades, getGradeLetter, onShowSEERequirements }) => {
  const data = formData[subject.id] || {};
  const result = subjectGrades[subject.id];
  const [validationMessage, setValidationMessage] = useState({ show: false, field: '', message: '' });
  const [inputValues, setInputValues] = useState(() => {
    // Initialize with existing data from localStorage or props
    const existingData = updatedFormData[subject.id] || data;
    return {
      q1: existingData.q1 || '',
      q2: existingData.q2 || '',
      t1: existingData.t1 || '',
      t2: existingData.t2 || '',
      matlab: existingData.matlab || '',
      el: existingData.el || '',
      lab: existingData.lab || '',
      see: existingData.see || '',
      labSee: existingData.labSee || ''
    };
  });

  // Refs for keyboard navigation (one for each possible field)
  const refs = {
    q1: useRef(),
    q2: useRef(),
    t1: useRef(),
    t2: useRef(),
    matlab: useRef(),
    el: useRef(),
    lab: useRef(),
    see: useRef(),
    labSee: useRef()
  };
  // Order for navigation
  let navOrder = ['q1', 'q2', 't1', 't2'];
  if (subject.type === 'math') navOrder.push('matlab', 'el');
  if (subject.type === 'lab') navOrder.push('lab', 'el');
  if (subject.type === 'dsa-lab') navOrder.push('lab', 'el');
  if (subject.type === 'regular') navOrder.push('el');
  if (currentMode === 'final-grade') {
    if (subject.type === 'dsa-lab') {
      navOrder.push('labSee', 'see');
    } else {
      navOrder.push('see');
    }
  }
  // Remove duplicates
  navOrder = navOrder.filter((v, i, arr) => arr.indexOf(v) === i);

  // Keyboard navigation handler
  const handleKeyDown = (e, field) => {
    const idx = navOrder.indexOf(field);
    const colCount = 2;
    if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      let nextIdx = idx;
      if (e.key === 'ArrowRight') nextIdx = (idx + 1) % navOrder.length;
      if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + navOrder.length) % navOrder.length;
      if (e.key === 'ArrowDown') nextIdx = (idx + colCount) < navOrder.length ? idx + colCount : idx;
      if (e.key === 'ArrowUp') nextIdx = (idx - colCount) >= 0 ? idx - colCount : idx;
      if (nextIdx !== idx && refs[navOrder[nextIdx]] && refs[navOrder[nextIdx]].current) {
        refs[navOrder[nextIdx]].current.focus();
      }
    }
  };

  const handleInputChange = (field, value) => {
    // Validate input - only allow numbers, decimal points, and empty string
    const numericRegex = /^[0-9]*\.?[0-9]*$/;

    // Allow empty string or valid numeric input
    if (value === '' || numericRegex.test(value)) {
      // Check maximum value limits
      const numValue = parseFloat(value) || 0;
      let isValidRange = true;

      // Get maximum value using the utility function for consistency
      const maxValue = getMaxValue(field, subject.type);

      // Check if value exceeds maximum
      if (numValue > maxValue) {
        isValidRange = false;
        setValidationMessage({
          show: true,
          field: field,
          message: `Maximum value allowed is ${maxValue}`
        });

        // Auto-hide after 3 seconds
        setTimeout(() => {
          setValidationMessage(prev => {
            if (prev.field === field) {
              return { show: false, field: '', message: '' };
            }
            return prev;
          });
        }, 3000);
      }

      // Only update if value is within range
      if (isValidRange) {
        // Update both local state and module-level variable
        setInputValues(prev => ({ ...prev, [field]: value }));

        if (!updatedFormData[subject.id]) {
          updatedFormData[subject.id] = {};
        }
        updatedFormData[subject.id][field] = value;

        // Save to localStorage
        saveToStorage(STORAGE_KEYS.FORM_DATA, updatedFormData);

        // Hide validation message if it was showing for this field
        if (validationMessage.show && validationMessage.field === field) {
          setValidationMessage({ show: false, field: '', message: '' });
        }
      }
    } else {
      // Show validation message for invalid input
      setValidationMessage({
        show: true,
        field: field,
        message: 'Enter numeric Values Only'
      });

      // Auto-hide after 3 seconds
      setTimeout(() => {
        setValidationMessage(prev => {
          if (prev.field === field) {
            return { show: false, field: '', message: '' };
          }
          return prev;
        });
      }, 3000);
    }
  };

  const hasCIEResult = result && result.type === 'cie';

  // Update input values when localStorage data changes
  useEffect(() => {
    const existingData = updatedFormData[subject.id] || data;
    setInputValues({
      q1: existingData.q1 || '',
      q2: existingData.q2 || '',
      t1: existingData.t1 || '',
      t2: existingData.t2 || '',
      matlab: existingData.matlab || '',
      el: existingData.el || '',
      lab: existingData.lab || '',
      see: existingData.see || ''
    });
  }, [updatedFormData, subject.id, data]);

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
          {subject.name}
          <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
            {subject.Credit} Credit
          </span>
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Quiz 1 (Max: 10)</label>
          <input
            type="text"
            value={inputValues.q1}
            onChange={(e) => handleInputChange('q1', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center text-lg font-medium outline-none bg-white text-gray-900"
            placeholder=""
            ref={refs.q1}
            onKeyDown={(e) => handleKeyDown(e, 'q1')}
          />
          {validationMessage.show && validationMessage.field === 'q1' && (
            <div className="absolute top-full left-0 mt-1 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm shadow-lg z-10 animate-fade-in">
              {validationMessage.message}
            </div>
          )}
        </div>
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Quiz 2 (Max: 10)</label>
          <input
            type="text"
            value={inputValues.q2}
            onChange={(e) => handleInputChange('q2', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center text-lg font-medium outline-none bg-white text-gray-900"
            placeholder=""
            ref={refs.q2}
            onKeyDown={(e) => handleKeyDown(e, 'q2')}
          />
          {validationMessage.show && validationMessage.field === 'q2' && (
            <div className="absolute top-full left-0 mt-1 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm shadow-lg z-10 animate-fade-in">
              {validationMessage.message}
            </div>
          )}
        </div>
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Test 1 (Max: 50)</label>
          <input
            type="text"
            value={inputValues.t1}
            onChange={(e) => handleInputChange('t1', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center text-lg font-medium outline-none bg-white text-gray-900"
            placeholder=""
            ref={refs.t1}
            onKeyDown={(e) => handleKeyDown(e, 't1')}
          />
          {validationMessage.show && validationMessage.field === 't1' && (
            <div className="absolute top-full left-0 mt-1 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm shadow-lg z-10 animate-fade-in">
              {validationMessage.message}
            </div>
          )}
        </div>
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Test 2 (Max: 50)</label>
          <input
            type="text"
            value={inputValues.t2}
            onChange={(e) => handleInputChange('t2', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center text-lg font-medium outline-none bg-white text-gray-900"
            placeholder=""
            ref={refs.t2}
            onKeyDown={(e) => handleKeyDown(e, 't2')}
          />
          {validationMessage.show && validationMessage.field === 't2' && (
            <div className="absolute top-full left-0 mt-1 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm shadow-lg z-10 animate-fade-in">
              {validationMessage.message}
            </div>
          )}
        </div>
      </div>
      {/* Subject-specific fields */}
      {subject.type === 'math' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">MATLAB (Max: 20)</label>
            <input
              type="text"
              value={inputValues.matlab}
              onChange={(e) => handleInputChange('matlab', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center text-lg font-medium outline-none bg-white text-gray-900"
              placeholder=""
              ref={refs.matlab}
              onKeyDown={(e) => handleKeyDown(e, 'matlab')}
            />
            {validationMessage.show && validationMessage.field === 'matlab' && (
              <div className="absolute top-full left-0 mt-1 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm shadow-lg z-10 animate-fade-in">
                {validationMessage.message}
              </div>
            )}
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">EL (Max: 20)</label>
            <input
              type="text"
              value={inputValues.el}
              onChange={(e) => handleInputChange('el', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center text-lg font-medium outline-none bg-white text-gray-900"
              placeholder=""
              ref={refs.el}
              onKeyDown={(e) => handleKeyDown(e, 'el')}
            />
            {validationMessage.show && validationMessage.field === 'el' && (
              <div className="absolute top-full left-0 mt-1 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm shadow-lg z-10 animate-fade-in">
                {validationMessage.message}
              </div>
            )}
          </div>
        </div>
      )}
      {subject.type === 'lab' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Lab Internals (Max: 30)</label>
            <input
              type="text"
              value={inputValues.lab}
              onChange={(e) => handleInputChange('lab', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center text-lg font-medium outline-none bg-white text-gray-900"
              placeholder=""
              ref={refs.lab}
              onKeyDown={(e) => handleKeyDown(e, 'lab')}
            />
            {validationMessage.show && validationMessage.field === 'lab' && (
              <div className="absolute top-full left-0 mt-1 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm shadow-lg z-10 animate-fade-in">
                {validationMessage.message}
              </div>
            )}
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">EL (Max: 30)</label>
            <input
              type="text"
              value={inputValues.el}
              onChange={(e) => handleInputChange('el', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center text-lg font-medium outline-none bg-white text-gray-900"
              placeholder=""
              ref={refs.el}
              onKeyDown={(e) => handleKeyDown(e, 'el')}
            />
            {validationMessage.show && validationMessage.field === 'el' && (
              <div className="absolute top-full left-0 mt-1 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm shadow-lg z-10 animate-fade-in">
                {validationMessage.message}
              </div>
            )}
          </div>
        </div>
      )}
      {subject.type === 'regular' && (
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">EL (Max: 40)</label>
          <input
            type="text"
            value={inputValues.el}
            onChange={(e) => handleInputChange('el', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center text-lg font-medium outline-none bg-white text-gray-900"
            placeholder=""
            ref={refs.el}
            onKeyDown={(e) => handleKeyDown(e, 'el')}
          />
          {validationMessage.show && validationMessage.field === 'el' && (
            <div className="absolute top-full left-0 mt-1 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm shadow-lg z-10 animate-fade-in">
              {validationMessage.message}
            </div>
          )}
        </div>
      )}
      {subject.type === 'dsa-lab' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Lab Marks (Max: 50)</label>
            <input
              type="text"
              value={inputValues.lab}
              onChange={(e) => handleInputChange('lab', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center text-lg font-medium outline-none bg-white text-gray-900"
              placeholder=""
              ref={refs.lab}
              onKeyDown={(e) => handleKeyDown(e, 'lab')}
            />
            {validationMessage.show && validationMessage.field === 'lab' && (
              <div className="absolute top-full left-0 mt-1 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm shadow-lg z-10 animate-fade-in">
                {validationMessage.message}
              </div>
            )}
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">EL (Max: 40)</label>
            <input
              type="text"
              value={inputValues.el}
              onChange={(e) => handleInputChange('el', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center text-lg font-medium outline-none bg-white text-gray-900"
              placeholder=""
              ref={refs.el}
              onKeyDown={(e) => handleKeyDown(e, 'el')}
            />
            {validationMessage.show && validationMessage.field === 'el' && (
              <div className="absolute top-full left-0 mt-1 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm shadow-lg z-10 animate-fade-in">
                {validationMessage.message}
              </div>
            )}
          </div>
        </div>
      )}
      {currentMode === 'final-grade' && subject.type === 'dsa-lab' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Lab SEE (Max: 50)</label>
            <input
              type="text"
              value={inputValues.labSee}
              onChange={(e) => handleInputChange('labSee', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center text-lg font-medium outline-none bg-white text-gray-900"
              placeholder="0"
              ref={refs.labSee}
              onKeyDown={(e) => handleKeyDown(e, 'labSee')}
            />
            {validationMessage.show && validationMessage.field === 'labSee' && (
              <div className="absolute top-full left-0 mt-1 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm shadow-lg z-10 animate-fade-in">
                {validationMessage.message}
              </div>
            )}
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">SEE Exam (Max: 100)</label>
            <input
              type="text"
              value={inputValues.see}
              onChange={(e) => handleInputChange('see', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center text-lg font-medium outline-none bg-white text-gray-900"
              placeholder="0"
              ref={refs.see}
              onKeyDown={(e) => handleKeyDown(e, 'see')}
            />
            {validationMessage.show && validationMessage.field === 'see' && (
              <div className="absolute top-full left-0 mt-1 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm shadow-lg z-10 animate-fade-in">
                {validationMessage.message}
              </div>
            )}
          </div>
        </div>
      )}
      {currentMode === 'final-grade' && subject.type !== 'dsa-lab' && (
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">SEE Marks (Max: 100)</label>
          <input
            type="text"
            value={inputValues.see}
            onChange={(e) => handleInputChange('see', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center text-lg font-medium outline-none bg-white text-gray-900"
            placeholder="0"
            ref={refs.see}
            onKeyDown={(e) => handleKeyDown(e, 'see')}
          />
          {validationMessage.show && validationMessage.field === 'see' && (
            <div className="absolute top-full left-0 mt-1 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm shadow-lg z-10 animate-fade-in">
              {validationMessage.message}
            </div>
          )}
        </div>
      )}
      <div className="space-y-4">
        <button
          onClick={() => onCalculate(subject)}
          className="w-full bg-black text-white py-4 rounded-xl hover:bg-gray-900 transition-all font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Calculate {currentMode === 'cie-final' ? 'CIE' : 'Grade'}
        </button>

        {currentMode === 'cie-final' && (
          <button
            onClick={() => onShowSEERequirements(subject, result?.cieTotal)}
            disabled={!hasCIEResult}
            className={`w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${hasCIEResult
              ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
              : 'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed'
              }`}
          >
            {hasCIEResult ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            SEE Marks Required
          </button>
        )}
      </div>

      {result && (
        <div className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
          {currentMode === 'cie-final' ? (
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                CIE: {result.cieTotal}
              </div>
              <div className="text-gray-600">out of {subject.type === 'dsa-lab' ? '150' : '100'}</div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                Grade: {result.gradePoint} ({getGradeLetter(result.gradePoint)})
              </div>
              {subject.type === 'dsa-lab' ? (
                <div className="text-gray-600">
                  <div>CIE: {result.cieTotal} | Lab SEE: {result.labSee || 0} | SEE: {result.see}</div>
                  <div className="mt-1 font-semibold">Total: {result.cieTotal + (result.labSee || 0) + result.see}/300</div>
                </div>
              ) : (
                <div className="text-gray-600">
                  CIE: {result.cieTotal} | Total: {((result.cieTotal + result.see) / 2).toFixed(2)}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CGPACalculator = () => {
  const [currentYear, setCurrentYear] = useState('');
  const [currentCluster, setCurrentCluster] = useState('');
  const [currentSemester, setCurrentSemester] = useState('');
  const [currentBranch, setCurrentBranch] = useState('');
  const [currentMode, setCurrentMode] = useState('');
  const [currentCycle, setCurrentCycle] = useState('');
  const [subjectGrades, setSubjectGrades] = useState({});
  const [formData, setFormData] = useState({});
  const [seePopup, setSeePopup] = useState({ isOpen: false, subject: null, cieTotal: 0 });
  const [finalCGPAGrades, setFinalCGPAGrades] = useState({
    physics: {},
    chemistry: {},
    sem3: {}
  });
  const [sgpaToggle, setSgpaToggle] = useState({
    sem3: false
  });
  const [firstYearCGPA, setFirstYearCGPA] = useState('');
  const [cgpaPopup, setCgpaPopup] = useState({ isOpen: false, cgpa: 0 });
  const [sgpaPopup, setSgpaPopup] = useState({ isOpen: false, sgpa: 0, cycleName: '' });
  const [showCreatorInfo, setShowCreatorInfo] = useState(false);
  const [showBugOptions, setShowBugOptions] = useState(false);
  const [sgpaValidationMessage, setSgpaValidationMessage] = useState({ show: false, cycle: '', message: '' });
  const [sgpaInputValues, setSgpaInputValues] = useState({ physics: '', chemistry: '' });
  const [branchValidationError, setBranchValidationError] = useState(false);

  const subjectCredit = useMemo(() => ({
    'math': 4, 'math-c': 4, 'phy': 4, 'chem': 4,
    'esc-p': 3, 'esc-c': 3, 'etc': 3, 'core': 3, 'plc': 3
  }), []);

  const modes = useMemo(() => [
    {
      id: 'cie-final',
      title: 'CIE Finalization & SEE Marks Required',
      description: 'Calculate your Continuous Internal Evaluation final marks',
      icon: <Calculator className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'final-grade',
      title: 'Final Grade Calculator',
      description: 'Complete grade calculation with predicted SEE marks',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'final-cgpa',
      title: 'Final GPA Calculator',
      description: 'Calculate GPA across both Physics and Chemistry cycles',
      icon: <Award className="w-6 h-6" />,
      color: 'from-green-500 to-green-600'
    }
  ], []);

  const cycles = useMemo(() => [
    { id: 'physics', name: 'Physics Cycle', emoji: '⚡' },
    { id: 'chemistry', name: 'Chemistry Cycle', emoji: '🧪' }
  ], []);

  const physicsSubjects = [
    { id: 'math', name: 'Mathematics', Credit: 4, type: 'math' },
    { id: 'phy', name: 'Physics', Credit: 4, type: 'lab' },
    { id: 'esc-p', name: 'ESC', Credit: 3, type: 'regular' },
    { id: 'etc', name: 'ETC', Credit: 3, type: 'regular' },
    { id: 'core', name: 'Core', Credit: 3, type: 'regular' }
  ];

  const chemistrySubjects = [
    { id: 'math-c', name: 'Mathematics', Credit: 4, type: 'math' },
    { id: 'chem', name: 'Chemistry', Credit: 4, type: 'lab' },
    { id: 'esc-c', name: 'ESC', Credit: 3, type: 'regular' },
    { id: 'plc', name: 'PLC', Credit: 3, type: 'lab' }
  ];

  const year2Sem3CseSubjects = [
    { id: 'mat231tc', name: 'Mathematics', Credit: 4, type: 'math' },
    { id: 'is233ai', name: 'DSA', Credit: 4, type: 'dsa-lab' },
    { id: 'cs234ai', name: 'ADLD', Credit: 4, type: 'dsa-lab' },
    { id: 'cs235ai', name: 'Operating Systems', Credit: 3, type: 'dsa-lab' },
    { id: 'xx232tx', name: 'Basket Courses - Group A', Credit: 3, type: 'regular' }
  ];

  const year2Sem3AimlSubjects = [
    { id: 'mat231tc', name: 'Mathematics', Credit: 4, type: 'math' },
    { id: 'is233ai', name: 'DSA', Credit: 4, type: 'dsa-lab' },
    { id: 'cs235ai', name: 'Cyber Physical Systems', Credit: 4, type: 'dsa-lab' },
    { id: 'stats-aiml', name: 'Statistics', Credit: 4, type: 'regular' },
    { id: 'xx232tx', name: 'Basket Courses - Group A', Credit: 3, type: 'regular' }
  ];

  const year2Sem3IseSubjects = [
    { id: 'mat231tc', name: 'Mathematics', Credit: 4, type: 'math' },
    { id: 'is233ai', name: 'DSA', Credit: 4, type: 'dsa-lab' },
    { id: 'cs235ai', name: 'Operating Systems', Credit: 4, type: 'dsa-lab' },
    { id: 'ldco-ise', name: 'LDCO', Credit: 4, type: 'regular' },
    { id: 'xx232tx', name: 'Basket Courses - Group A', Credit: 3, type: 'regular' }
  ];

  const getSubjects = useMemo(() => {
    if (currentYear === 'year2' && currentSemester === 'sem3' && currentBranch === 'cse-core') {
      return year2Sem3CseSubjects;
    }
    if (currentYear === 'year2' && currentSemester === 'sem3' && currentBranch === 'cse-aiml') {
      return year2Sem3AimlSubjects;
    }
    if (currentYear === 'year2' && currentSemester === 'sem3' && currentBranch === 'ise') {
      return year2Sem3IseSubjects;
    }
    return currentCycle === 'physics' ? physicsSubjects : chemistrySubjects;
  }, [currentYear, currentSemester, currentBranch, currentCycle]);

  const calculateCIE = useCallback((subject, data) => {
    const { q1 = 0, q2 = 0, t1 = 0, t2 = 0, matlab = 0, el = 0, lab = 0 } = data;

    let cieValue;
    if (subject.type === 'math') {
      cieValue = (q1 + q2) + ((t1 + t2) / 100 * 40) + matlab + el;
    } else if (subject.type === 'lab') {
      cieValue = ((q1 + q2) / 2) + ((t1 + t2) / 100 * 30) + lab + el;
    } else if (subject.type === 'dsa-lab') {
      // DSA/OS: Quiz 1, Quiz 2 (10 each), Test 1, Test 2 (50 each), Lab (50), EL (40)
      // CIE Total: 150 = (test1 + test2) * 0.4 + quiz1 + quiz2 + Lab + EL
      // = (50 + 50) * 0.4 + 10 + 10 + 50 + 40 = 40 + 20 + 50 + 40 = 150
      cieValue = (t1 + t2) * 0.4 + q1 + q2 + lab + el;
    } else {
      cieValue = (q1 + q2) + ((t1 + t2) / 100 * 40) + el;
    }

    // Round up to the nearest integer
    return Math.ceil(cieValue);
  }, []);

  const calculateFinalGrade = useCallback((cieTotal, see = 0, labSee = 0, isDsaLab = false) => {
    // For dsa-lab subjects: CIE (150) + Lab SEE (50) + SEE Exam (100) = 300 total
    // Grading: O=270-300, A+=240-269, A=210-239, B+=180-209, B=150-179, C=120-149, P=100-119, F=<100
    if (isDsaLab) {
      const total = cieTotal + labSee + see;

      // Check minimum CIE requirement (40% of 150 = 60)
      if (cieTotal < 60) return 0;

      // Check minimum total SEE requirement (35% of 150 = 52.5, round up to 53)
      // But only check if at least one SEE component has been entered
      if (labSee > 0 || see > 0) {
        if ((labSee + see) < 53) return 0;
      }

      // Check for F grade based on total
      if (total < 100) return 0;

      // Grade mapping for 300 total
      if (total >= 270) return 10; // O
      if (total >= 240) return 9;  // A+
      if (total >= 210) return 8;  // A
      if (total >= 180) return 7;  // B+
      if (total >= 150) return 6;  // B
      if (total >= 120) return 5;  // C
      if (total >= 100) return 4;  // P
      return 0; // F
    } else {
      // Original calculation for non dsa-lab subjects
      // Check for F grade conditions first
      if (cieTotal < 40 || see < 35) {
        return 0; // F grade
      }

      const total = (cieTotal + see) / 2;
      return Math.min(10, Math.max(0, Math.floor(total / 10) + 1));
    }
  }, []);

  const getGradeLetter = useCallback((grade) => {
    const gradeMap = {
      10: 'O', 9: 'A+', 8: 'A', 7: 'B+', 6: 'B', 5: 'C', 4: 'P', 0: 'F'
    };
    return gradeMap[grade] || 'F';
  }, []);

  const calculateSubject = useCallback((subject) => {
    // Update state with current module-level data before calculation
    setFormData(prev => ({ ...prev, ...updatedFormData }));

    const data = updatedFormData[subject.id] || {};
    // Convert string values to numbers for calculation
    const numericData = {};
    Object.keys(data).forEach(key => {
      numericData[key] = parseFloat(data[key]) || 0;
    });

    const cieTotal = calculateCIE(subject, numericData);

    if (currentMode === 'cie-final') {
      setSubjectGrades(prev => ({
        ...prev,
        [subject.id]: { cieTotal, type: 'cie' }
      }));
    } else {
      const see = numericData.see || 0;
      const labSee = numericData.labSee || 0;
      const isDsaLab = subject.type === 'dsa-lab';
      const gradePoint = calculateFinalGrade(cieTotal, see, labSee, isDsaLab);
      setSubjectGrades(prev => ({
        ...prev,
        [subject.id]: { cieTotal, gradePoint, see, labSee, type: 'final' }
      }));
    }
  }, [currentMode, calculateCIE]);

  const showSEERequirements = useCallback((subject, cieTotal) => {
    if (cieTotal !== undefined) {
      setSeePopup({
        isOpen: true,
        subject: subject,
        cieTotal: cieTotal
      });
    }
  }, []);

  const closeSEEPopup = useCallback(() => {
    setSeePopup({ isOpen: false, subject: null, cieTotal: 0 });
  }, []);

  const calculateOverallCGPA = useCallback(() => {
    const subjects = getSubjects;
    let totalGradePoints = 0;
    let totalCredit = 0;

    subjects.forEach(subject => {
      const grade = subjectGrades[subject.id];
      if (grade && grade.gradePoint) {
        totalGradePoints += grade.gradePoint * subject.Credit;
        totalCredit += subject.Credit;
      }
    });

    return totalCredit > 0 ? (totalGradePoints / totalCredit).toFixed(2) : 0;
  }, [getSubjects, subjectGrades]);

  const calculateFinalCGPA = useCallback(() => {
    let totalGradePoints = 0;
    let totalCredit = 0;

    // For year1: Calculate from Physics and Chemistry cycles (20 credits each = 40 total)
    if (currentYear === 'year1') {
      // Calculate for Physics cycle
      physicsSubjectsCGPA.forEach(subject => {
        const grade = finalCGPAGrades.physics && finalCGPAGrades.physics[subject.id];
        if (grade !== undefined && grade !== '') {
          totalGradePoints += grade * subject.Credit;
          totalCredit += subject.Credit;
        }
      });

      // Calculate for Chemistry cycle
      chemistrySubjectsCGPA.forEach(subject => {
        const grade = finalCGPAGrades.chemistry && finalCGPAGrades.chemistry[subject.id];
        if (grade !== undefined && grade !== '') {
          totalGradePoints += grade * subject.Credit;
          totalCredit += subject.Credit;
        }
      });
    } else {
      // For year2: Add 1st year CGPA contribution (40 credits)
      if (firstYearCGPA && parseFloat(firstYearCGPA) > 0) {
        totalGradePoints += parseFloat(firstYearCGPA) * 40;
        totalCredit += 40;
      }

      // Calculate for 3rd Sem (21 credits) - only from grades
      // Get the correct subjects array based on branch
      const sem3Subjects = currentBranch === 'cse-aiml' ? sem3SubjectsCGPA_AIML :
        currentBranch === 'ise' ? sem3SubjectsCGPA_ISE :
          sem3SubjectsCGPA_CSECore;
      sem3Subjects.forEach(subject => {
        const grade = finalCGPAGrades.sem3 && finalCGPAGrades.sem3[subject.id];
        if (grade !== undefined && grade !== '') {
          totalGradePoints += grade * subject.Credit;
          totalCredit += subject.Credit;
        }
      });
    }

    return totalCredit > 0 ? (totalGradePoints / totalCredit).toFixed(2) : '0.00';
  }, [firstYearCGPA, currentBranch, finalCGPAGrades, currentYear]);

  const handleFinalCGPACompute = useCallback(() => {
    const cgpa = calculateFinalCGPA();
    setCgpaPopup({ isOpen: true, cgpa });
  }, [calculateFinalCGPA]);

  const closeCGPAPopup = useCallback(() => {
    setCgpaPopup({ isOpen: false, cgpa: 0 });
  }, []);

  const handleSGPACompute = useCallback((cycle) => {
    // Select the correct subjects array based on the cycle
    let subjects;
    if (cycle === 'physics') {
      subjects = physicsSubjectsCGPA;
    } else if (cycle === 'chemistry') {
      subjects = chemistrySubjectsCGPA;
    } else {
      // For sem3, use branch-specific subjects
      subjects = currentBranch === 'cse-aiml' ? sem3SubjectsCGPA_AIML :
        currentBranch === 'ise' ? sem3SubjectsCGPA_ISE :
          sem3SubjectsCGPA_CSECore;
    }

    let totalGradePoints = 0;
    let totalCredit = 0;

    subjects.forEach(subject => {
      const grade = finalCGPAGrades[cycle] && finalCGPAGrades[cycle][subject.id];
      if (grade !== undefined && grade !== '' && grade !== null) {
        totalGradePoints += Number(grade) * subject.Credit;
        totalCredit += subject.Credit;
      }
    });

    const sgpa = totalCredit > 0 ? (totalGradePoints / totalCredit).toFixed(2) : '0.00';
    const cycleName = cycle === 'physics' ? 'Physics Cycle' :
      cycle === 'chemistry' ? 'Chemistry Cycle' :
        '3rd Sem SGPA';
    setSgpaPopup({ isOpen: true, sgpa, cycleName });
  }, [currentBranch, finalCGPAGrades]);

  const closeSGPAPopup = useCallback(() => {
    setSgpaPopup({ isOpen: false, sgpa: 0, cycleName: '' });
  }, []);

  const handleSgpaToggle = (semester) => {
    setSgpaToggle(prev => ({
      ...prev,
      [semester]: !prev[semester]
    }));

    // Reset grades for this semester when toggle is turned on
    if (!sgpaToggle[semester]) {
      setFinalCGPAGrades(prev => ({
        ...prev,
        [semester]: {}
      }));
    }

    // Reset SGPA value when toggle is turned off
    if (sgpaToggle[semester]) {
      updatedSgpaValues[semester] = '';
    }
  };

  const handleSgpaValueChange = (semester, value, inputElement) => {
    // Validate input - only allow numbers, decimal points, and empty string
    const numericRegex = /^[0-9]*\.?[0-9]*$/;

    // Allow empty string or valid numeric input
    if (value === '' || numericRegex.test(value)) {
      const numValue = parseFloat(value) || 0;
      let isValidRange = true;
      let errorMessage = '';

      // Check for negative values
      if (value !== '' && numValue < 0) {
        isValidRange = false;
        errorMessage = 'SGPA cannot be negative';
      }

      // Check if value exceeds maximum (10)
      if (value !== '' && numValue > 10) {
        isValidRange = false;
        errorMessage = 'Maximum SGPA is 10';
      }

      if (!isValidRange) {
        // Show validation message
        setSgpaValidationMessage({
          show: true,
          cycle: semester,
          message: errorMessage
        });

        // Auto-hide after 3 seconds
        setTimeout(() => {
          setSgpaValidationMessage(prev => {
            if (prev.cycle === semester) {
              return { show: false, cycle: '', message: '' };
            }
            return prev;
          });
        }, 3000);

        // Reset input to previous valid value
        if (inputElement) {
          inputElement.value = updatedSgpaValues[semester] || '';
        }
        return;
      }

      // Only update if value is within range
      if (isValidRange) {
        // Update module-level variable only
        updatedSgpaValues[semester] = value;

        // Save to localStorage
        saveToStorage(STORAGE_KEYS.SGPA_VALUES, updatedSgpaValues);

        // Hide validation message if it was showing for this semester
        if (sgpaValidationMessage.show && sgpaValidationMessage.cycle === semester) {
          setSgpaValidationMessage({ show: false, cycle: '', message: '' });
        }
      }
    } else {
      // Show validation message for invalid input
      setSgpaValidationMessage({
        show: true,
        cycle: semester,
        message: 'Enter numeric values only'
      });

      // Auto-hide after 3 seconds
      setTimeout(() => {
        setSgpaValidationMessage(prev => {
          if (prev.cycle === semester) {
            return { show: false, cycle: '', message: '' };
          }
          return prev;
        });
      }, 3000);

      // Reset to previous valid value
      if (inputElement) {
        inputElement.value = updatedSgpaValues[semester] || '';
      }
    }
  };

  const calculateCycleSGPA = useCallback((semester) => {
    // Get the correct subjects array based on branch
    const subjects = currentBranch === 'cse-aiml' ? sem3SubjectsCGPA_AIML :
      currentBranch === 'ise' ? sem3SubjectsCGPA_ISE :
        sem3SubjectsCGPA_CSECore;
    let totalGradePoints = 0;
    let totalCredit = 0;

    console.log('calculateCycleSGPA - semester:', semester);
    console.log('calculateCycleSGPA - currentBranch:', currentBranch);
    console.log('calculateCycleSGPA - subjects:', subjects);
    console.log('calculateCycleSGPA - finalCGPAGrades:', finalCGPAGrades);

    subjects.forEach(subject => {
      const grade = finalCGPAGrades[semester] && finalCGPAGrades[semester][subject.id];
      console.log(`Subject ${subject.id}: grade = ${grade}, credit = ${subject.Credit}`);
      if (grade !== undefined && grade !== '') {
        totalGradePoints += grade * subject.Credit;
        totalCredit += subject.Credit;
      }
    });

    console.log('Total grade points:', totalGradePoints, 'Total credits:', totalCredit);
    return totalCredit > 0 ? (totalGradePoints / totalCredit).toFixed(2) : '0.00';
  }, [currentBranch, finalCGPAGrades]);

  // Initialize updatedFormData when component mounts or changes cycles
  useEffect(() => {
    updatedFormData = loadFromStorage(STORAGE_KEYS.FORM_DATA, {});
    updatedSgpaValues = loadFromStorage(STORAGE_KEYS.SGPA_VALUES, { sem3: '' });
    setCurrentMode(loadFromStorage(STORAGE_KEYS.CURRENT_MODE, ''));
    setCurrentCycle(loadFromStorage(STORAGE_KEYS.CURRENT_CYCLE, ''));
    const loadedGrades = loadFromStorage(STORAGE_KEYS.FINAL_CGPA_GRADES, { physics: {}, chemistry: {}, sem3: {} });
    // Ensure physics, chemistry, and sem3 properties always exist
    setFinalCGPAGrades({ physics: {}, chemistry: {}, sem3: {}, ...loadedGrades });
    setSgpaInputValues(loadFromStorage(STORAGE_KEYS.SGPA_VALUES, { sem3: '' }));
    setFormData(loadFromStorage(STORAGE_KEYS.FORM_DATA, {}));
    setFirstYearCGPA(loadFromStorage(STORAGE_KEYS.FIRST_YEAR_CGPA, ''));
  }, []);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.FORM_DATA, formData);
  }, [formData]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CURRENT_MODE, currentMode);
  }, [currentMode]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CURRENT_CYCLE, currentCycle);
  }, [currentCycle]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.FINAL_CGPA_GRADES, finalCGPAGrades);
  }, [finalCGPAGrades]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.FIRST_YEAR_CGPA, firstYearCGPA);
  }, [firstYearCGPA]);

  // Reset Marks function
  const handleResetMarks = useCallback(() => {
    // Clear all localStorage
    clearAllStorage();

    // Reset all state
    setCurrentMode('');
    setCurrentCycle('');
    setSubjectGrades({});
    setFormData({});
    setFinalCGPAGrades({ physics: {}, chemistry: {}, sem3: {} });
    setSgpaToggle({ sem3: false });
    setSgpaInputValues({ sem3: '' });
    setSgpaValidationMessage({ show: false, cycle: '', message: '' });
    setFirstYearCGPA('');

    // Reset module-level variables
    updatedFormData = {};
    updatedSgpaValues = { sem3: '' };

  }, []);

  const handleResetCIEFinalisationMarks = useCallback(() => {
    saveToStorage(STORAGE_KEYS.FORM_DATA, {});
    setFormData({});
    setSubjectGrades({});
    updatedFormData = {};
  }, []);

  const handleResetFinalGPACalcMarks = useCallback(() => {
    saveToStorage(STORAGE_KEYS.FINAL_CGPA_GRADES, { physics: {}, chemistry: {}, sem3: {} });
    saveToStorage(STORAGE_KEYS.SGPA_VALUES, { sem3: '' });
    saveToStorage(STORAGE_KEYS.FIRST_YEAR_CGPA, '');
    setFinalCGPAGrades({ physics: {}, chemistry: {}, sem3: {} });
    setSgpaToggle({ sem3: false });
    setSgpaInputValues({ sem3: '' });
    setFirstYearCGPA('');
    updatedSgpaValues = { sem3: '' };
  }, []);

  const handleSetCurrentYear = useCallback((year) => {
    setCurrentYear(year);
    setCurrentCluster(''); // Reset cluster when changing year
    setCurrentSemester(''); // Reset semester
    setCurrentBranch(''); // Reset branch
    setCurrentMode(''); // Reset mode
    setCurrentCycle(''); // Reset cycle
    saveToStorage(STORAGE_KEYS.CURRENT_MODE, '');
    saveToStorage(STORAGE_KEYS.CURRENT_CYCLE, '');
  }, []);

  const handleSetCurrentCluster = useCallback((cluster) => {
    setCurrentCluster(cluster);
    setCurrentSemester(''); // Reset semester when changing cluster
    setCurrentBranch(''); // Reset branch
    setCurrentMode(''); // Reset mode
    saveToStorage(STORAGE_KEYS.CURRENT_MODE, '');
  }, []);

  const handleSetCurrentSemester = useCallback((semester) => {
    setCurrentSemester(semester);
    setCurrentBranch(''); // Reset branch when changing semester
    setCurrentMode(''); // Reset mode
    saveToStorage(STORAGE_KEYS.CURRENT_MODE, '');
  }, []);

  const handleSetCurrentBranch = useCallback((branch) => {
    setCurrentBranch(branch);
    if (branch) {
      setBranchValidationError(false);
    }
  }, []);

  const handleSetCurrentMode = useCallback((mode) => {
    // Check if year2 and no branch selected
    if (currentYear === 'year2' && !currentBranch) {
      setBranchValidationError(true);
      setTimeout(() => setBranchValidationError(false), 3000);
      return;
    }
    setCurrentMode(mode);
    saveToStorage(STORAGE_KEYS.CURRENT_MODE, mode);
  }, [currentYear, currentBranch]);

  const handleSetCurrentCycle = useCallback((cycle) => {
    setCurrentCycle(cycle);
    saveToStorage(STORAGE_KEYS.CURRENT_CYCLE, cycle);
  }, []);

  const YearSelection = () => (
    <div className="space-y-8">
      <div className="text-center mb-12 max-w-3xl mx-auto space-y-6">
        {/* Header Bubble */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Academic Calculator</h1>
          <p className="text-xl text-gray-600">Select your Year</p>
        </div>

        {/* RVCE Logo Button Bubble */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
          <a
            href="https://rvce.edu.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white hover:bg-gray-50 active:bg-gray-100 active:scale-95 transition-all duration-150 rounded-2xl px-12 py-6 shadow-lg hover:shadow-xl transform hover:scale-105 border border-gray-200"
          >
            <img
              src="https://www.rvinstitutions.com/wp-content/uploads/2017/09/Logo-1-white-1024x1024-1.png"
              alt="RVCE Logo"
              className="w-20 h-20 object-contain filter invert"
            />
          </a>
        </div>
      </div>

      <div className="grid gap-6 max-w-3xl mx-auto">
        {/* 1st Year Button - Clickable */}
        <button
          onClick={() => handleSetCurrentYear('year1')}
          className="group relative bg-white border border-gray-200 rounded-3xl p-8 hover:border-gray-300 hover:shadow-xl transition-all duration-300 text-left transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                <span className="text-2xl font-bold">1</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">1st Year</h3>
                <p className="text-gray-600">Physics and Chemistry Cycles</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </div>
        </button>

        {/* 2nd Year Button - Clickable */}
        <button
          onClick={() => handleSetCurrentYear('year2')}
          className="group relative bg-white border border-gray-200 rounded-3xl p-8 hover:border-gray-300 hover:shadow-xl transition-all duration-300 text-left transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                <span className="text-2xl font-bold">2</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">2nd Year</h3>
                <p className="text-gray-600">Semester 3 & 4</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </div>
        </button>

        {/* 3rd Year Button - Disabled */}
        <div className="relative bg-white border border-gray-200 rounded-3xl p-8 opacity-50 cursor-not-allowed">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center text-white shadow-lg">
                <span className="text-2xl font-bold">3</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">3rd Year</h3>
                <p className="text-gray-600">Coming Soon</p>
              </div>
            </div>
            <Lock className="w-6 h-6 text-gray-400" />
          </div>
        </div>

        {/* 4th Year Button - Disabled */}
        <div className="relative bg-white border border-gray-200 rounded-3xl p-8 opacity-50 cursor-not-allowed">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center text-white shadow-lg">
                <span className="text-2xl font-bold">4</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">4th Year</h3>
                <p className="text-gray-600">Coming Soon</p>
              </div>
            </div>
            <Lock className="w-6 h-6 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Disclaimer Footer */}
      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-gray-200">
        <div className="flex items-center justify-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-gray-500" />
          <p className="text-xs text-gray-500">
            <span className="font-medium">Disclaimer:</span>
            {" "}This is not an official source. Creators are not responsible for any discrepancies.
          </p>
        </div>
      </div>
    </div>
  );

  const ModeSelection = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => {
            if (currentYear === 'year2') {
              handleSetCurrentSemester('');
            } else {
              handleSetCurrentYear('');
            }
          }}
          className="text-blue-600 hover:text-blue-700 font-medium text-lg transition-colors"
        >
          ← Back to {currentYear === 'year2' ? 'Semesters' : 'Years'}
        </button>
        <div className="w-32"></div>
      </div>

      <div className="text-center mb-12 max-w-3xl mx-auto space-y-6">
        {/* Header Bubble */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {currentYear === 'year1' ? '1st Year' : `${currentSemester === 'sem3' ? '3rd' : '4th'} Sem`} Calculator
          </h1>
          <p className="text-xl text-gray-600">Choose your calculation mode</p>
        </div>

        {/* Branch Selection Dropdown - Only for Year 2 */}
        {currentYear === 'year2' && (
          <div className={`bg-white border rounded-3xl px-8 py-4 shadow-sm transition-all duration-300 ${branchValidationError ? 'border-red-500 shadow-red-200 animate-pulse' : 'border-gray-200'
            }`}>
            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-md">
                {branchValidationError && (
                  <div className="absolute -top-8 left-0 right-0 text-center">
                    <p className="text-red-600 text-sm font-medium">⚠️ Please select a branch first</p>
                  </div>
                )}
                <select
                  value={currentBranch}
                  onChange={(e) => handleSetCurrentBranch(e.target.value)}
                  className={`w-full px-6 py-3 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white text-gray-900 text-center font-medium text-lg cursor-pointer transition-colors ${branchValidationError ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300 hover:border-blue-400'
                    }`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 1rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '3rem'
                  }}
                >
                  <option value="" disabled>Select Branch</option>
                  <option value="cse-core">CSE (Core+CD+CY)</option>
                  <option value="cse-aiml">CSE(AIML)</option>
                  <option value="ise">ISE</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6 max-w-3xl mx-auto">
        {modes.map((mode) => {
          const isDisabled = currentYear === 'year2' && !currentBranch;
          return (
            <button
              key={mode.id}
              onClick={() => handleSetCurrentMode(mode.id)}
              disabled={isDisabled}
              className={`group relative rounded-3xl p-8 transition-all duration-300 text-left ${isDisabled
                ? 'bg-gray-100 border border-gray-300 opacity-60 cursor-not-allowed'
                : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-xl transform hover:-translate-y-1'
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${mode.color} flex items-center justify-center text-white shadow-lg`}>
                    {mode.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{mode.title}</h3>
                    <p className="text-gray-600">{mode.description}</p>
                  </div>
                </div>
                {isDisabled ? (
                  <Lock className="w-6 h-6 text-gray-400" />
                ) : (
                  <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Disclaimer Footer */}
      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-gray-200">
        <div className="flex items-center justify-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-gray-500" />
          <p className="text-xs text-gray-500">
            <span className="font-medium">Disclaimer:</span>
            {" "}This is not an official source. Creators are not responsible for any discrepancies.
          </p>
        </div>
      </div>
    </div>
  );

  const ClusterSelection = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => handleSetCurrentYear('')}
          className="text-blue-600 hover:text-blue-700 font-medium text-lg transition-colors"
        >
          ← Back to Years
        </button>
        <div className="w-32"></div>
      </div>

      <div className="text-center mb-12 max-w-3xl mx-auto space-y-6">
        {/* Header Bubble */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">2nd Year Calculator</h1>
          <p className="text-xl text-gray-600">Select your cluster</p>
        </div>
      </div>

      <div className="grid gap-6 max-w-3xl mx-auto">
        {/* CS Cluster Button - Clickable */}
        <button
          onClick={() => handleSetCurrentCluster('cs')}
          className="group relative bg-white border border-gray-200 rounded-3xl p-8 hover:border-gray-300 hover:shadow-xl transition-all duration-300 text-left transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                <Calculator className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">CS Cluster</h3>
                <p className="text-gray-600">Computer Science Streams</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </div>
        </button>

        {/* EC Cluster Button - Disabled */}
        <div className="relative bg-white border border-gray-200 rounded-3xl p-8 opacity-50 cursor-not-allowed">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center text-white shadow-lg">
                <BarChart3 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">EC Cluster</h3>
                <p className="text-gray-600">Coming Soon</p>
              </div>
            </div>
            <Lock className="w-6 h-6 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Disclaimer Footer */}
      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-gray-200">
        <div className="flex items-center justify-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-gray-500" />
          <p className="text-xs text-gray-500">
            <span className="font-medium">Disclaimer:</span>
            {" "}This is not an official source. Creators are not responsible for any discrepancies.
          </p>
        </div>
      </div>
    </div>
  );

  const SemesterSelection = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => handleSetCurrentCluster('')}
          className="text-blue-600 hover:text-blue-700 font-medium text-lg transition-colors"
        >
          ← Back to Clusters
        </button>
        <div className="w-32"></div>
      </div>

      <div className="text-center mb-12 max-w-3xl mx-auto space-y-6">
        {/* Header Bubble */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">CS Cluster</h1>
          <p className="text-xl text-gray-600">Select your semester</p>
        </div>
      </div>

      <div className="grid gap-6 max-w-3xl mx-auto">
        {/* 3rd Semester Button - Clickable */}
        <button
          onClick={() => handleSetCurrentSemester('sem3')}
          className="group relative bg-white border border-gray-200 rounded-3xl p-8 hover:border-gray-300 hover:shadow-xl transition-all duration-300 text-left transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white shadow-lg">
                <span className="text-2xl font-bold">3</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">3rd Semester</h3>
                <p className="text-gray-600">Semester 3 Subjects</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </div>
        </button>

        {/* 4th Semester Button - Disabled */}
        <div className="relative bg-white border border-gray-200 rounded-3xl p-8 opacity-50 cursor-not-allowed">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center text-white shadow-lg">
                <span className="text-2xl font-bold">4</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">4th Semester</h3>
                <p className="text-gray-600">Coming Soon</p>
              </div>
            </div>
            <Lock className="w-6 h-6 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Disclaimer Footer */}
      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-gray-200">
        <div className="flex items-center justify-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-gray-500" />
          <p className="text-xs text-gray-500">
            <span className="font-medium">Disclaimer:</span>
            {" "}This is not an official source. Creators are not responsible for any discrepancies.
          </p>
        </div>
      </div>
    </div>
  );

  const CycleSelection = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => handleSetCurrentMode('')}
          className="text-blue-600 hover:text-blue-700 font-medium text-lg transition-colors"
        >
          ← Back to Modes
        </button>
        <div className="w-32"></div>
      </div>

      <div className="grid gap-6 max-w-lg mx-auto">
        {cycles.map((cycle) => (
          <button
            key={cycle.id}
            onClick={() => handleSetCurrentCycle(cycle.id)}
            className="bg-white border border-gray-200 rounded-3xl p-8 hover:border-blue-300 hover:shadow-xl transition-all duration-300 text-center group transform hover:-translate-y-1"
          >
            <div className="text-5xl mb-4">{cycle.emoji}</div>
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {cycle.name}
            </h3>
          </button>
        ))}
      </div>

    </div>
  );

  const SubjectsView = () => {
    const subjects = getSubjects;

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => {
              if (currentYear === 'year2') {
                // For Year 2: Go back to mode selection
                handleSetCurrentMode('');
              } else {
                // For Year 1: Go back to cycle selection
                handleSetCurrentCycle('');
                saveToStorage(STORAGE_KEYS.CURRENT_CYCLE, '');
              }
              // Do NOT clear formData, subjectGrades, or updatedFormData here!
            }}
            className="text-blue-600 hover:text-blue-700 font-medium text-lg transition-colors"
          >
            ← Back
          </button>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
            </h2>
            <p className="text-gray-600 text-lg">

            </p>
          </div>
          <div className="w-32"></div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {getSubjects.map((subject) => (
            <SubjectForm
              key={subject.id}
              subject={subject}
              formData={formData}
              currentMode={currentMode}
              onCalculate={calculateSubject}
              subjectGrades={subjectGrades}
              getGradeLetter={getGradeLetter}
              onShowSEERequirements={showSEERequirements}
            />
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            Grade Scale Reference
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {[
              { grade: '10', letter: 'O' },
              { grade: '9', letter: 'A+' },
              { grade: '8', letter: 'A' },
              { grade: '7', letter: 'B+' },
              { grade: '6', letter: 'B' },
              { grade: '5', letter: 'C' },
              { grade: '4', letter: 'P' },
              { grade: '<4', letter: 'F' }
            ].map((item, index) => (
              <div key={index} className="text-center p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="font-bold text-gray-900">{item.grade}</div>
                <div className="text-sm text-gray-600 mt-1">{item.letter}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Reset Marks Button */}
        <button
          onClick={handleResetCIEFinalisationMarks}
          className="fixed top-6 right-6 bg-white hover:bg-grey text-black px-3 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 text-sm border border-gray-200"
          title="Reset all marks and clear saved data"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Reset Marks
        </button>
      </div>
    );
  };

  const BugReportButton = () => {
    const [showBugOptions, setShowBugOptions] = useState(false);
    let bugOptionsTimeout = null;

    // Helper to clear any pending timeout
    const clearBugOptionsTimeout = () => {
      if (bugOptionsTimeout) {
        clearTimeout(bugOptionsTimeout);
        bugOptionsTimeout = null;
      }
    };

    // Show popup immediately on mouse enter
    const handleMouseEnter = () => {
      clearBugOptionsTimeout();
      setShowBugOptions(true);
    };

    // Hide popup with a slight delay to allow moving between button and popup
    const handleMouseLeave = () => {
      clearBugOptionsTimeout();
      bugOptionsTimeout = setTimeout(() => setShowBugOptions(false), 120);
    };

    return (
      <div className="fixed bottom-6 right-6 z-40" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <div className="relative">
          {/* Main Bug Report Button */}
          <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 text-sm font-medium">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            Report Bugs / Contribute
          </button>

          {/* Hover Options Bubble */}
          <div className={`absolute bottom-full right-0 mb-2 transition-all duration-300 ${showBugOptions ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'
            }`}>
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-3 min-w-[180px]">
              <div className="space-y-2">
                {/* GitHub Button */}
                <a
                  href="https://github.com/VivaanHooda/rvce-grade-calculator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <Github className="w-5 h-5 text-gray-700 group-hover:text-black" />
                  <span className="text-gray-700 group-hover:text-black font-medium">GitHub</span>
                </a>
                {/* Gmail Button */}
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
              {/* Bubble Arrow */}
              <div className="absolute bottom-0 right-4 transform translate-y-full">
                <div className="w-3 h-3 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Main navigation logic */}
        {!currentYear && <YearSelection />}
        {currentYear === 'year1' && !currentMode && <ModeSelection />}
        {currentYear === 'year2' && !currentCluster && <ClusterSelection />}
        {currentYear === 'year2' && currentCluster && !currentSemester && <SemesterSelection />}
        {currentYear === 'year2' && currentCluster && currentSemester && !currentMode && <ModeSelection />}
        {currentYear === 'year1' && currentMode === 'final-cgpa' && <FinalCGPAView
          finalCGPAGrades={finalCGPAGrades}
          setFinalCGPAGrades={setFinalCGPAGrades}
          firstYearCGPA={firstYearCGPA}
          setFirstYearCGPA={setFirstYearCGPA}
          handleSetCurrentMode={handleSetCurrentMode}
          handleSGPACompute={handleSGPACompute}
          handleFinalCGPACompute={handleFinalCGPACompute}
          currentBranch={currentBranch}
          currentYear={currentYear}
          subjectGrades={subjectGrades}
        />}
        {currentYear === 'year2' && currentCluster && currentSemester && currentMode === 'final-cgpa' && currentBranch && <FinalCGPAView
          finalCGPAGrades={finalCGPAGrades}
          setFinalCGPAGrades={setFinalCGPAGrades}
          firstYearCGPA={firstYearCGPA}
          setFirstYearCGPA={setFirstYearCGPA}
          handleSetCurrentMode={handleSetCurrentMode}
          handleSGPACompute={handleSGPACompute}
          handleFinalCGPACompute={handleFinalCGPACompute}
          currentBranch={currentBranch}
          currentYear={currentYear}
          subjectGrades={subjectGrades}
        />}
        {currentYear === 'year1' && currentMode && currentMode !== 'final-cgpa' && !currentCycle && <CycleSelection />}
        {currentYear === 'year1' && currentMode && currentMode !== 'final-cgpa' && currentCycle && <SubjectsView />}
        {currentYear === 'year2' && currentCluster && currentSemester && currentMode && currentMode !== 'final-cgpa' && currentBranch && <SubjectsView />}
      </div>

      <SEERequirementsPopup
        isOpen={seePopup.isOpen}
        onClose={closeSEEPopup}
        cieTotal={seePopup.cieTotal}
        subjectName={seePopup.subject?.name}
        subjectType={seePopup.subject?.type}
      />
      <CGPAResultsPopup
        isOpen={cgpaPopup.isOpen}
        onClose={closeCGPAPopup}
        cgpa={cgpaPopup.cgpa}
      />
      <SGPAResultsPopup
        isOpen={sgpaPopup.isOpen}
        onClose={closeSGPAPopup}
        sgpa={sgpaPopup.sgpa}
        cycleName={sgpaPopup.cycleName}
      />
      <BugReportButton />
    </div>
  );
};

export default CGPACalculator;