import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { getMaxValue } from '../../utils/calculations';
import { STORAGE_KEYS, saveToStorage } from '../../utils/storage';

// Module-level variable to hold form data - this prevents focus loss
// We need to export/import this or manage it via context/props if we want to share it across components strictly
// For now, we'll keep it local to the file or pass it down. 
// Ideally, this should be in a Context or Redux, but to stick to the current pattern:
// We will rely on props for formData updates.

const SubjectForm = ({
  subject,
  formData,
  currentMode,
  onCalculate,
  subjectGrades,
  getGradeLetter,
  onShowSEERequirements,
  onInputChange // New standard prop
}) => {
  const data = formData[subject.id] || {};
  const result = subjectGrades[subject.id];
  const [validationMessage, setValidationMessage] = useState({ show: false, field: '', message: '' });

  const [inputValues, setInputValues] = useState(() => ({
    q1: data.q1 || '',
    q2: data.q2 || '',
    t1: data.t1 || '',
    t2: data.t2 || '',
    matlab: data.matlab || '',
    el: data.el || '',
    lab: data.lab || '',
    see: data.see || '',
    labSee: data.labSee || ''
  }));

  // Refs for keyboard navigation
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
  if (subject.type === 'lab' || subject.type === 'dsa-lab' || subject.type === 'ece-lab') navOrder.push('lab', 'el');
  if (subject.type === 'regular' || subject.type === '50-mark') navOrder.push('el');

  if (currentMode === 'final-grade') {
    if (subject.type === 'dsa-lab' || subject.type === 'ece-lab') {
      navOrder.push('labSee', 'see');
    } else {
      navOrder.push('see');
    }
  }
  navOrder = [...new Set(navOrder)];

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

      if (nextIdx !== idx && refs[navOrder[nextIdx]]?.current) {
        refs[navOrder[nextIdx]].current.focus();
      }
    }
  };

  const handleInputChange = (field, value) => {
    const numericRegex = /^[0-9]*\.?[0-9]*$/;

    if (value === '' || numericRegex.test(value)) {
      const numValue = parseFloat(value) || 0;
      let isValidRange = true;
      const maxValue = getMaxValue(field, subject.type);

      if (numValue > maxValue) {
        isValidRange = false;
        setValidationMessage({
          show: true,
          field: field,
          message: `Maximum value allowed is ${maxValue}`
        });

        setTimeout(() => {
          setValidationMessage(prev => {
            if (prev.field === field) {
              return { show: false, field: '', message: '' };
            }
            return prev;
          });
        }, 3000);
      }

      if (isValidRange) {
        setInputValues(prev => ({ ...prev, [field]: value }));

        if (onInputChange) {
          onInputChange(subject.id, field, value);
        }

        if (validationMessage.show && validationMessage.field === field) {
          setValidationMessage({ show: false, field: '', message: '' });
        }
      }
    } else {
      setValidationMessage({
        show: true,
        field: field,
        message: 'Enter numeric Values Only'
      });
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

  useEffect(() => {
    setInputValues({
      q1: data.q1 || '',
      q2: data.q2 || '',
      t1: data.t1 || '',
      t2: data.t2 || '',
      matlab: data.matlab || '',
      el: data.el || '',
      lab: data.lab || '',
      see: data.see || '',
      labSee: data.labSee || ''
    });
  }, [subject.id, data]);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="grid grid-cols-[1fr_auto] gap-3 items-start">
        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
          {subject.name}
        </h3>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
          {subject.Credit} Credit
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Quiz 1 */}
        <div className="relative">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Quiz 1 (Max: {subject.type === '50-mark' ? '5' : '10'})</label>
          <input
            type="text"
            value={inputValues.q1}
            onChange={(e) => handleInputChange('q1', e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center text-base sm:text-lg font-medium outline-none bg-white text-gray-900"
            ref={refs.q1}
            onKeyDown={(e) => handleKeyDown(e, 'q1')}
          />
          {validationMessage.show && validationMessage.field === 'q1' && (
            <div className="absolute top-full left-0 mt-1 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-xs sm:text-sm shadow-lg z-10 animate-fade-in">
              {validationMessage.message}
            </div>
          )}
        </div>
        {/* Quiz 2 */}
        <div className="relative">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Quiz 2 (Max: {subject.type === '50-mark' ? '5' : '10'})</label>
          <input
            type="text"
            value={inputValues.q2}
            onChange={(e) => handleInputChange('q2', e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center text-base sm:text-lg font-medium outline-none bg-white text-gray-900"
            ref={refs.q2}
            onKeyDown={(e) => handleKeyDown(e, 'q2')}
          />
          {validationMessage.show && validationMessage.field === 'q2' && (
            <div className="absolute top-full left-0 mt-1 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-xs sm:text-sm shadow-lg z-10 animate-fade-in">
              {validationMessage.message}
            </div>
          )}
        </div>
        {/* Test 1 */}
        <div className="relative">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Test 1 (Max: {subject.type === '50-mark' ? '25' : '50'})</label>
          <input
            type="text"
            value={inputValues.t1}
            onChange={(e) => handleInputChange('t1', e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center text-base sm:text-lg font-medium outline-none bg-white text-gray-900"
            ref={refs.t1}
            onKeyDown={(e) => handleKeyDown(e, 't1')}
          />
          {validationMessage.show && validationMessage.field === 't1' && (
            <div className="absolute top-full left-0 mt-1 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-xs sm:text-sm shadow-lg z-10 animate-fade-in">
              {validationMessage.message}
            </div>
          )}
        </div>
        {/* Test 2 */}
        <div className="relative">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Test 2 (Max: {subject.type === '50-mark' ? '25' : '50'})</label>
          <input
            type="text"
            value={inputValues.t2}
            onChange={(e) => handleInputChange('t2', e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center text-base sm:text-lg font-medium outline-none bg-white text-gray-900"
            ref={refs.t2}
            onKeyDown={(e) => handleKeyDown(e, 't2')}
          />
          {validationMessage.show && validationMessage.field === 't2' && (
            <div className="absolute top-full left-0 mt-1 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-xs sm:text-sm shadow-lg z-10 animate-fade-in">
              {validationMessage.message}
            </div>
          )}
        </div>
      </div>

      {/* Subject-specific fields */}
      {subject.type === 'math' && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">MATLAB (Max: 20)</label>
            <input
              type="text"
              value={inputValues.matlab}
              onChange={(e) => handleInputChange('matlab', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center text-lg font-medium outline-none bg-white text-gray-900"
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

      {/* Other subject types... I'm omitting some for brevity but the real file handles all cases */}
      {/* Since I need to replicate exact logic, I should include them all */}

      {subject.type === 'lab' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Lab Internals (Max: 30)</label>
            <input
              type="text"
              value={inputValues.lab}
              onChange={(e) => handleInputChange('lab', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center text-lg font-medium outline-none bg-white text-gray-900"
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

      {subject.type === 'ece-lab' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Lab Marks (Max: 50)</label>
            <input
              type="text"
              value={inputValues.lab}
              onChange={(e) => handleInputChange('lab', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center text-lg font-medium outline-none bg-white text-gray-900"
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

      {/* SEE Marks Input */}
      {currentMode === 'final-grade' && subject.type === '50-mark' && (
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">SEE Marks (Max: 50)</label>
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

      {currentMode === 'final-grade' && (subject.type === 'dsa-lab' || subject.type === 'ece-lab') && (
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Theory SEE (Max: 50)</label>
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

      {currentMode === 'final-grade' && subject.type !== 'dsa-lab' && subject.type !== 'ece-lab' && subject.type !== '50-mark' && (
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

      <div className="space-y-3 sm:space-y-4">
        <button
          onClick={() => onCalculate(subject)}
          className="w-full bg-black text-white py-3 sm:py-4 rounded-xl hover:bg-gray-900 transition-all font-medium text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-98"
        >
          Calculate {currentMode === 'cie-final' ? 'CIE' : 'Grade'}
        </button>

        {currentMode === 'cie-final' && (
          <button
            onClick={() => onShowSEERequirements(subject, result?.cieTotal)}
            disabled={!hasCIEResult}
            className={`w-full py-2.5 sm:py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${hasCIEResult
              ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 active:scale-98'
              : 'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed'
              }`}
          >
            {hasCIEResult ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            SEE Marks Required
          </button>
        )}
      </div>

      {result && (
        <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
          {currentMode === 'cie-final' ? (
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                CIE: {result.cieTotal}
              </div>
              <div className="text-sm sm:text-base text-gray-600">
                out of {subject.type === 'dsa-lab' || subject.type === 'ece-lab' ? '150' : subject.type === '50-mark' ? '50' : '100'}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Grade: {result.gradePoint} ({getGradeLetter(result.gradePoint)})
              </div>
              {/* Logic for display total */}
              {(subject.type === 'dsa-lab' || subject.type === 'ece-lab') ? (
                <div className="text-sm sm:text-base text-gray-600">
                  CIE: {result.cieTotal} | Total: {(((result.cieTotal + (result.labSee || 0) + result.see)) / 2).toFixed(2)}/150
                </div>
              ) : subject.type === '50-mark' ? (
                <div className="text-sm sm:text-base text-gray-600">
                  CIE: {result.cieTotal} | Total: {((result.cieTotal + result.see) / 2).toFixed(2)}/50
                </div>
              ) : (
                <div className="text-sm sm:text-base text-gray-600">
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

export default SubjectForm;