import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { getMaxValue } from '../../utils/calculations';
import { STORAGE_KEYS, saveToStorage } from '../../utils/storage';

// Module-level variable to hold form data - this prevents focus loss
// We need to export/import this or manage it via context/props if we want to share it across components strictly
// For now, we'll keep it local to the file or pass it down. 
// Ideally, this should be in a Context or Redux, but to stick to the current pattern:
// We will rely on props for formData updates.


/**
 * 
 * If you want to add a new subject type, you need to 
 * 1. Add the new type to the subject data in src/data/
 * 2. Add a new case in the JSX to render the appropriate input fields for that subject type, 
 *    following the pattern of existing types. 
 * 
 */

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
    labSee: data.labSee || '',
    basketEl: data.basketEl || ''
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
    labSee: useRef(),
    basketEl: useRef()
  };

  // Order for navigation
  let navOrder = ['q1', 'q2', 't1', 't2'];
  if (subject.type === 'math') navOrder.push('matlab', 'el');
  if (subject.type === 'lab' || subject.type === 'dsa-lab' || subject.type === 'ece-lab') navOrder.push('lab', 'el');
  if (subject.type === 'regular' || subject.type === '50-mark') navOrder.push('el');
  if (subject.type === 'basket') navOrder.push('el', 'basketEl');

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

  // This handler validates required fields using  form validation
  // and then calls onCalculate if all validations pass
  const handleFormSubmit = (e) => {
    e.preventDefault();
    // HTML5 validation will prevent submission if required fields are empty
    // If we reach here, all required fields are filled
    onCalculate(subject);
  };

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
      labSee: data.labSee || '',
      basketEl: data.basketEl || ''
    });
  }, [subject.id, data]);

  return (
    <div className="p-4 space-y-4 transition-shadow bg-white border border-gray-200 shadow-sm rounded-2xl sm:rounded-3xl sm:p-5 md:p-6 sm:space-y-6 hover:shadow-md">
      <div className="grid grid-cols-[1fr_auto] gap-3 items-start">
        <h3 className="text-base font-semibold text-gray-900 sm:text-lg md:text-xl">
          {subject.name}
        </h3>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
          {subject.Credit} Credit
        </span>
      </div>
      {/* Wrapped everything in form tags and added requried attribute to all input fields 
          This prevents form submission if any required field is empty.*/}
      <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Quiz 1 */}
        <div className="relative">
          <label className="block mb-2 text-xs font-medium text-gray-700 sm:text-sm">Quiz 1 (Max: {subject.type === '50-mark' ? '5' : '10'})</label>
          <input
            type="text"
            inputMode="decimal"
            value={inputValues.q1}
            onChange={(e) => handleInputChange('q1', e.target.value)}
            className="w-full px-3 py-2 text-base font-medium text-center text-gray-900 transition-all bg-white border border-gray-300 outline-none sm:px-4 sm:py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-lg"
            ref={refs.q1}
            onKeyDown={(e) => handleKeyDown(e, 'q1')}
            required = {true}
          />
          {validationMessage.show && validationMessage.field === 'q1' && (
            <div className="absolute left-0 z-10 px-3 py-2 mt-1 text-xs text-red-700 bg-red-100 border border-red-300 rounded-lg shadow-lg top-full sm:text-sm animate-fade-in">
              {validationMessage.message}
            </div>
          )}
        </div>
        {/* Quiz 2 */}
        <div className="relative">
          <label className="block mb-2 text-xs font-medium text-gray-700 sm:text-sm">Quiz 2 (Max: {subject.type === '50-mark' ? '5' : '10'})</label>
          <input
            type="text"
            inputMode="decimal"
            value={inputValues.q2}
            onChange={(e) => handleInputChange('q2', e.target.value)}
            className="w-full px-3 py-2 text-base font-medium text-center text-gray-900 transition-all bg-white border border-gray-300 outline-none sm:px-4 sm:py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-lg"
            ref={refs.q2}
            onKeyDown={(e) => handleKeyDown(e, 'q2')}
            required = {true}
          />
          {validationMessage.show && validationMessage.field === 'q2' && (
            <div className="absolute left-0 z-10 px-3 py-2 mt-1 text-xs text-red-700 bg-red-100 border border-red-300 rounded-lg shadow-lg top-full sm:text-sm animate-fade-in">
              {validationMessage.message}
            </div>
          )}
        </div>
        {/* Test 1 */}
        <div className="relative">
          <label className="block mb-2 text-xs font-medium text-gray-700 sm:text-sm">Test 1 (Max: {subject.type === '50-mark' ? '25' : '50'})</label>
          <input
            type="text"
            inputMode="decimal"
            value={inputValues.t1}
            onChange={(e) => handleInputChange('t1', e.target.value)}
            className="w-full px-3 py-2 text-base font-medium text-center text-gray-900 transition-all bg-white border border-gray-300 outline-none sm:px-4 sm:py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-lg"
            ref={refs.t1}
            onKeyDown={(e) => handleKeyDown(e, 't1')}
            required={true}
          />
          {validationMessage.show && validationMessage.field === 't1' && (
            <div className="absolute left-0 z-10 px-3 py-2 mt-1 text-xs text-red-700 bg-red-100 border border-red-300 rounded-lg shadow-lg top-full sm:text-sm animate-fade-in">
              {validationMessage.message}
            </div>
          )}
        </div>
        {/* Test 2 */}
        <div className="relative">
          <label className="block mb-2 text-xs font-medium text-gray-700 sm:text-sm">Test 2 (Max: {subject.type === '50-mark' ? '25' : '50'})</label>
          <input
            type="text"
            inputMode="decimal"
            value={inputValues.t2}
            onChange={(e) => handleInputChange('t2', e.target.value)}
            className="w-full px-3 py-2 text-base font-medium text-center text-gray-900 transition-all bg-white border border-gray-300 outline-none sm:px-4 sm:py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-lg"
            ref={refs.t2}
            onKeyDown={(e) => handleKeyDown(e, 't2')}
            required={true}
          />
          {validationMessage.show && validationMessage.field === 't2' && (
            <div className="absolute left-0 z-10 px-3 py-2 mt-1 text-xs text-red-700 bg-red-100 border border-red-300 rounded-lg shadow-lg top-full sm:text-sm animate-fade-in">
              {validationMessage.message}
            </div>
          )}
        </div>
      </div>

      {/* Subject-specific fields */}
      {subject.type === 'math' && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="relative">
            <label className="block mb-2 text-sm font-medium text-gray-700">MATLAB (Max: 20)</label>
            <input
              type="text"
              inputMode="decimal"
              value={inputValues.matlab}
              onChange={(e) => handleInputChange('matlab', e.target.value)}
              className="w-full px-4 py-3 text-lg font-medium text-center text-gray-900 transition-all bg-white border border-gray-300 outline-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              ref={refs.matlab}
              onKeyDown={(e) => handleKeyDown(e, 'matlab')}
              required={true}
            />
            {validationMessage.show && validationMessage.field === 'matlab' && (
              <div className="absolute left-0 z-10 px-3 py-2 mt-1 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg shadow-lg top-full animate-fade-in">
                {validationMessage.message}
              </div>
            )}
          </div>
          <div className="relative">
            <label className="block mb-2 text-sm font-medium text-gray-700">EL (Max: 20)</label>
            <input
              type="text"
              inputMode="decimal"
              value={inputValues.el}
              onChange={(e) => handleInputChange('el', e.target.value)}
              className="w-full px-4 py-3 text-lg font-medium text-center text-gray-900 transition-all bg-white border border-gray-300 outline-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              ref={refs.el}
              onKeyDown={(e) => handleKeyDown(e, 'el')}
              required={true}
            />
            {validationMessage.show && validationMessage.field === 'el' && (
              <div className="absolute left-0 z-10 px-3 py-2 mt-1 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg shadow-lg top-full animate-fade-in">
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
            <label className="block mb-2 text-sm font-medium text-gray-700">Lab Internals (Max: 30)</label>
            <input
              type="text"
              inputMode="decimal"
              value={inputValues.lab}
              onChange={(e) => handleInputChange('lab', e.target.value)}
              className="w-full px-4 py-3 text-lg font-medium text-center text-gray-900 transition-all bg-white border border-gray-300 outline-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              ref={refs.lab}
              onKeyDown={(e) => handleKeyDown(e, 'lab')}
              required={true}
            />
            {validationMessage.show && validationMessage.field === 'lab' && (
              <div className="absolute left-0 z-10 px-3 py-2 mt-1 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg shadow-lg top-full animate-fade-in">
                {validationMessage.message}
              </div>
            )}
          </div>
          <div className="relative">
            <label className="block mb-2 text-sm font-medium text-gray-700">EL (Max: 30)</label>
            <input
              type="text"
              value={inputValues.el}
              onChange={(e) => handleInputChange('el', e.target.value)}
              className="w-full px-4 py-3 text-lg font-medium text-center text-gray-900 transition-all bg-white border border-gray-300 outline-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              ref={refs.el}
              onKeyDown={(e) => handleKeyDown(e, 'el')}
              required={true}
            />
            {validationMessage.show && validationMessage.field === 'el' && (
              <div className="absolute left-0 z-10 px-3 py-2 mt-1 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg shadow-lg top-full animate-fade-in">
                {validationMessage.message}
              </div>
            )}
          </div>
        </div>
      )}

      {subject.type === 'regular' && (
        <div className="relative">
          <label className="block mb-2 text-sm font-medium text-gray-700">EL (Max: 40)</label>
          <input
            type="text"
            value={inputValues.el}
            onChange={(e) => handleInputChange('el', e.target.value)}
            className="w-full px-4 py-3 text-lg font-medium text-center text-gray-900 transition-all bg-white border border-gray-300 outline-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            ref={refs.el}
            onKeyDown={(e) => handleKeyDown(e, 'el')}
            required={true}
          />
          {validationMessage.show && validationMessage.field === 'el' && (
            <div className="absolute left-0 z-10 px-3 py-2 mt-1 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg shadow-lg top-full animate-fade-in">
              {validationMessage.message}
            </div>
          )}
        </div>
      )}

      {subject.type === 'dsa-lab' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label className="block mb-2 text-sm font-medium text-gray-700">Lab Marks (Max: 50)</label>
            <input
              type="text"
              value={inputValues.lab}
              onChange={(e) => handleInputChange('lab', e.target.value)}
              className="w-full px-4 py-3 text-lg font-medium text-center text-gray-900 transition-all bg-white border border-gray-300 outline-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              ref={refs.lab}
              onKeyDown={(e) => handleKeyDown(e, 'lab')}
              required={true}
            />
            {validationMessage.show && validationMessage.field === 'lab' && (
              <div className="absolute left-0 z-10 px-3 py-2 mt-1 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg shadow-lg top-full animate-fade-in">
                {validationMessage.message}
              </div>
            )}
          </div>
          <div className="relative">
            <label className="block mb-2 text-sm font-medium text-gray-700">EL (Max: 40)</label>
            <input
              type="text"
              value={inputValues.el}
              onChange={(e) => handleInputChange('el', e.target.value)}
              className="w-full px-4 py-3 text-lg font-medium text-center text-gray-900 transition-all bg-white border border-gray-300 outline-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              ref={refs.el}
              onKeyDown={(e) => handleKeyDown(e, 'el')}
            />
            {validationMessage.show && validationMessage.field === 'el' && (
              <div className="absolute left-0 z-10 px-3 py-2 mt-1 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg shadow-lg top-full animate-fade-in">
                {validationMessage.message}
              </div>
            )}
          </div>
        </div>
      )}

      {subject.type === 'ece-lab' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label className="block mb-2 text-sm font-medium text-gray-700">Lab Marks (Max: 50)</label>
            <input
              type="text"
              value={inputValues.lab}
              onChange={(e) => handleInputChange('lab', e.target.value)}
              className="w-full px-4 py-3 text-lg font-medium text-center text-gray-900 transition-all bg-white border border-gray-300 outline-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              ref={refs.lab}
              onKeyDown={(e) => handleKeyDown(e, 'lab')}
              required={true}
            />
            {validationMessage.show && validationMessage.field === 'lab' && (
              <div className="absolute left-0 z-10 px-3 py-2 mt-1 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg shadow-lg top-full animate-fade-in">
                {validationMessage.message}
              </div>
            )}
          </div>
          <div className="relative">
            <label className="block mb-2 text-sm font-medium text-gray-700">EL (Max: 40)</label>
            <input
              type="text"
              value={inputValues.el}
              onChange={(e) => handleInputChange('el', e.target.value)}
              className="w-full px-4 py-3 text-lg font-medium text-center text-gray-900 transition-all bg-white border border-gray-300 outline-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              ref={refs.el}
              onKeyDown={(e) => handleKeyDown(e, 'el')}
              required={true}
            />
            {validationMessage.show && validationMessage.field === 'el' && (
              <div className="absolute left-0 z-10 px-3 py-2 mt-1 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg shadow-lg top-full animate-fade-in">
                {validationMessage.message}
              </div>
            )}
          </div>
        </div>
      )}

      {subject.type === '50-mark' && (
        <div className="relative">
          <label className="block mb-2 text-sm font-medium text-gray-700">EL (Max: 20)</label>
          <input
            type="text"
            inputMode="decimal"
            value={inputValues.el}
            onChange={(e) => handleInputChange('el', e.target.value)}
            className="w-full px-4 py-3 text-lg font-medium text-center text-gray-900 transition-all bg-white border border-gray-300 outline-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            ref={refs.el}
            onKeyDown={(e) => handleKeyDown(e, 'el')}
          />
          {validationMessage.show && validationMessage.field === 'el' && (
            <div className="absolute left-0 z-10 px-3 py-2 mt-1 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg shadow-lg top-full animate-fade-in">
              {validationMessage.message}
            </div>
          )}
        </div>
      )}

      {subject.type === 'basket' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label className="block mb-2 text-sm font-medium text-gray-700">EL (Max: 20)</label>
            <input
              type="text"
              inputMode="decimal"
              value={inputValues.el}
              onChange={(e) => handleInputChange('el', e.target.value)}
              className="w-full px-4 py-3 text-lg font-medium text-center text-gray-900 transition-all bg-white border border-gray-300 outline-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              ref={refs.el}
              onKeyDown={(e) => handleKeyDown(e, 'el')}
            />
            {validationMessage.show && validationMessage.field === 'el' && (
              <div className="absolute left-0 z-10 px-3 py-2 mt-1 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg shadow-lg top-full animate-fade-in">
                {validationMessage.message}
              </div>
            )}
          </div>
          <div className="relative">
            <label className="block mb-2 text-sm font-medium text-gray-700">Basket EL (Max: 20)</label>
            <input
              type="text"
              inputMode="decimal"
              value={inputValues.basketEl}
              onChange={(e) => handleInputChange('basketEl', e.target.value)}
              className="w-full px-4 py-3 text-lg font-medium text-center text-gray-900 transition-all bg-white border border-gray-300 outline-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              ref={refs.basketEl}
              onKeyDown={(e) => handleKeyDown(e, 'basketEl')}
              required={true}
            />
            {validationMessage.show && validationMessage.field === 'basketEl' && (
              <div className="absolute left-0 z-10 px-3 py-2 mt-1 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg shadow-lg top-full animate-fade-in">
                {validationMessage.message}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEE Marks Input */}
      {currentMode === 'final-grade' && subject.type === '50-mark' && (
        <div className="relative">
          <label className="block mb-2 text-sm font-medium text-gray-700">SEE Marks (Max: 50)</label>
          <input
            type="text"
            inputMode="decimal"
            value={inputValues.see}
            onChange={(e) => handleInputChange('see', e.target.value)}
            className="w-full px-4 py-3 text-lg font-medium text-center text-gray-900 transition-all bg-white border border-gray-300 outline-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
            ref={refs.see}
            onKeyDown={(e) => handleKeyDown(e, 'see')}
            required={true}
          />
          {validationMessage.show && validationMessage.field === 'see' && (
            <div className="absolute left-0 z-10 px-3 py-2 mt-1 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg shadow-lg top-full animate-fade-in">
              {validationMessage.message}
            </div>
          )}
        </div>
      )}

      {currentMode === 'final-grade' && (subject.type === 'dsa-lab' || subject.type === 'ece-lab') && (
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label className="block mb-2 text-sm font-medium text-gray-700">Lab SEE (Max: 50)</label>
            <input
              type="text"
              inputMode="decimal"
              value={inputValues.labSee}
              onChange={(e) => handleInputChange('labSee', e.target.value)}
              className="w-full px-4 py-3 text-lg font-medium text-center text-gray-900 transition-all bg-white border border-gray-300 outline-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
              ref={refs.labSee}
              onKeyDown={(e) => handleKeyDown(e, 'labSee')}
              required={true}
            />
            {validationMessage.show && validationMessage.field === 'labSee' && (
              <div className="absolute left-0 z-10 px-3 py-2 mt-1 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg shadow-lg top-full animate-fade-in">
                {validationMessage.message}
              </div>
            )}
          </div>
          <div className="relative">
            <label className="block mb-2 text-sm font-medium text-gray-700">Theory SEE (Max: 100)</label>
            <input
              type="text"
              value={inputValues.see}
              onChange={(e) => handleInputChange('see', e.target.value)}
              className="w-full px-4 py-3 text-lg font-medium text-center text-gray-900 transition-all bg-white border border-gray-300 outline-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
              ref={refs.see}
              onKeyDown={(e) => handleKeyDown(e, 'see')}
              required={true}
            />
            {validationMessage.show && validationMessage.field === 'see' && (
              <div className="absolute left-0 z-10 px-3 py-2 mt-1 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg shadow-lg top-full animate-fade-in">
                {validationMessage.message}
              </div>
            )}
          </div>
        </div>
      )}

      {currentMode === 'final-grade' && subject.type !== 'dsa-lab' && subject.type !== 'ece-lab' && subject.type !== '50-mark' && (
        <div className="relative">
          <label className="block mb-2 text-sm font-medium text-gray-700">SEE Marks (Max: 100)</label>
          <input
            type="text"
            value={inputValues.see}
            onChange={(e) => handleInputChange('see', e.target.value)}
            className="w-full px-4 py-3 text-lg font-medium text-center text-gray-900 transition-all bg-white border border-gray-300 outline-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
            ref={refs.see}
            onKeyDown={(e) => handleKeyDown(e, 'see')}
            required={true}
          />
          {validationMessage.show && validationMessage.field === 'see' && (
            <div className="absolute left-0 z-10 px-3 py-2 mt-1 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg shadow-lg top-full animate-fade-in">
              {validationMessage.message}
            </div>
          )}
        </div>
      )}

      <div className="space-y-3 sm:space-y-4">
        {/* Change button to type="submit" to trigger form validation */}
        {/* HTML5 will validate all required fields before submitting */}
        <button
          type="submit"
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
        <div className="p-4 mt-4 border border-gray-200 sm:mt-6 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
          {currentMode === 'cie-final' ? (
            <div className="text-center">
              <div className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                CIE: {result.cieTotal}
              </div>
              <div className="text-sm text-gray-600 sm:text-base">
                out of {subject.type === 'dsa-lab' || subject.type === 'ece-lab' ? '150' : subject.type === '50-mark' ? '50' : '100'}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                Grade: {result.gradePoint} ({getGradeLetter(result.gradePoint)})
              </div>
              {/* Logic for display total */}
              {(subject.type === 'dsa-lab' || subject.type === 'ece-lab') ? (
                <div className="text-sm text-gray-600 sm:text-base">
                  CIE: {result.cieTotal} | Total: {(((result.cieTotal + (result.labSee || 0) + result.see)) / 2).toFixed(2)}/150
                </div>
              ) : subject.type === '50-mark' ? (
                <div className="text-sm text-gray-600 sm:text-base">
                  CIE: {result.cieTotal} | Total: {((result.cieTotal + result.see) / 2).toFixed(2)}/50
                </div>
              ) : (
                <div className="text-sm text-gray-600 sm:text-base">
                  CIE: {result.cieTotal} | Total: {((result.cieTotal + result.see) / 2).toFixed(2)}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      </form>
    </div>
  );
};

export default SubjectForm;
