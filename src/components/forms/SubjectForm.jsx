import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock } from 'lucide-react';

const SubjectForm = ({ 
  subject, 
  formData, 
  updatedFormData,
  currentMode, 
  onCalculate, 
  subjectGrades, 
  getGradeLetter, 
  onShowSEERequirements,
  onInputChange 
}) => {
  const data = formData[subject.id] || {};
  const result = subjectGrades[subject.id];
  const [validationMessage, setValidationMessage] = useState({ show: false, field: '', message: '' });
  const [inputValues, setInputValues] = useState(() => {
    const existingData = updatedFormData[subject.id] || data;
    return {
      q1: existingData.q1 || '',
      q2: existingData.q2 || '',
      t1: existingData.t1 || '',
      t2: existingData.t2 || '',
      matlab: existingData.matlab || '',
      el: existingData.el || '',
      lab: existingData.lab || '',
      see: existingData.see || ''
    };
  });

  const refs = {
    q1: useRef(),
    q2: useRef(),
    t1: useRef(),
    t2: useRef(),
    matlab: useRef(),
    el: useRef(),
    lab: useRef(),
    see: useRef()
  };

  let navOrder = ['q1', 'q2', 't1', 't2'];
  if (subject.type === 'math') navOrder.push('matlab', 'el');
  if (subject.type === 'lab') navOrder.push('lab', 'el');
  if (subject.type === 'regular') navOrder.push('el');
  if (currentMode === 'final-grade') navOrder.push('see');
  navOrder = navOrder.filter((v, i, arr) => arr.indexOf(v) === i);

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
    const numericRegex = /^[0-9]*\.?[0-9]*$/;
    
    if (value === '' || numericRegex.test(value)) {
      const numValue = parseFloat(value) || 0;
      let maxValue = 0;
      let isValidRange = true;
      
      switch (field) {
        case 'q1':
        case 'q2':
          maxValue = 10;
          break;
        case 't1':
        case 't2':
          maxValue = 50;
          break;
        case 'matlab':
          maxValue = 20;
          break;
        case 'lab':
          maxValue = 30;
          break;
        case 'el':
          if (subject.type === 'math') {
            maxValue = 20;
          } else if (subject.type === 'lab') {
            maxValue = 30;
          } else {
            maxValue = 40;
          }
          break;
        case 'see':
          maxValue = 100;
          break;
        default:
          maxValue = 100;
      }
      
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
        onInputChange(subject.id, field, value);
        
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
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-lg font-medium"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-lg font-medium"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-lg font-medium"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-lg font-medium"
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
      {subject.type === 'math' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">MATLAB (Max: 20)</label>
            <input
              type="text"
              value={inputValues.matlab}
              onChange={(e) => handleInputChange('matlab', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-lg font-medium"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-lg font-medium"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-lg font-medium"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-lg font-medium"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-lg font-medium"
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
      {currentMode === 'final-grade' && (
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">SEE Marks (Max: 100)</label>
          <input
            type="text"
            value={inputValues.see}
            onChange={(e) => handleInputChange('see', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-lg font-medium"
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
            className={`w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              hasCIEResult
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
              <div className="text-gray-600">out of 100</div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                Grade: {result.gradePoint} ({getGradeLetter(result.gradePoint)})
              </div>
              <div className="text-gray-600">
                CIE: {result.cieTotal} | Total: {((result.cieTotal + result.see) / 2).toFixed(2)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubjectForm;