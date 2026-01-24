import React, { useState } from 'react';
import { X, Copy } from 'lucide-react';

const SEERequirementsPopup = ({ isOpen, onClose, cieTotal, subjectName, subjectType }) => {
  const [copiedGrade, setCopiedGrade] = useState('');
  const [labSEEMarks, setLabSEEMarks] = useState('');

  if (!isOpen) return null;

  // Check if this is a dsa-lab type subject (DSA, OS, ADLD)
  const isDsaLab = subjectType === 'dsa-lab';
  const maxSEE = isDsaLab ? 150 : 100;
  const labSEEValue = parseFloat(labSEEMarks) || 0;
  const hasLabSEE = isDsaLab && labSEEValue > 0;

  // Check if subject is DSA, OS, or ADLD (these don't have 35 minimum for SEE)
  const isDsaOsAdld = subjectName && (
    subjectName.includes('DSA') || 
    subjectName.includes('Data Structures') ||
    subjectName.includes('Operating System') ||
    subjectName.includes('OS') ||
    subjectName.includes('ADLD') ||
    subjectName.includes('Advanced Logic Design')
  );

  const calculateSEERequired = (targetGrade) => {
    if (isDsaLab) {
      // For dsa-lab: Total = CIE (150) + SEE (150) = 300
      // O: 270-299, A+: 240-269, A: 210-239, etc.
      // So: SEE = (targetGrade - 1) * 30 - CIE
      const requiredSEE = (targetGrade - 1) * 30 - cieTotal;
      // If lab SEE marks are set, subtract them to get exam requirement
      return hasLabSEE ? requiredSEE - labSEEValue : requiredSEE;
    } else {
      // For regular subjects: Total = CIE (100) + SEE (100) = 200
      // Formula: (targetGrade - 1) * 10 = (CIE + SEE) / 2
      // So: SEE = (targetGrade - 1) * 20 - CIE
      const requiredSEE = (targetGrade - 1) * 20 - cieTotal;
      return requiredSEE;
    }
  };

  const handleLabSEEChange = (value) => {
    // Only allow numeric input
    const numericRegex = /^[0-9]*\.?[0-9]*$/;
    if (value === '' || numericRegex.test(value)) {
      const numValue = parseFloat(value) || 0;
      if (numValue <= 50) {
        setLabSEEMarks(value);
      }
    }
  };

  // For DSA, OS, ADLD: no minimum SEE requirement. For others: 35 minimum
  const minSEE = isDsaOsAdld ? 0 : 35;
  const effectiveMaxSEE = hasLabSEE ? 100 : maxSEE;
  const gradeRequirements = [
    { grade: 10, letter: 'O' },
    { grade: 9, letter: 'A+' },
    { grade: 8, letter: 'A' },
    { grade: 7, letter: 'B+' },
    { grade: 6, letter: 'B' },
    { grade: 5, letter: 'C' },
    { grade: 4, letter: 'P' }
  ].map(item => ({
    ...item,
    seeRequired: calculateSEERequired(item.grade)
  })).filter(item => item.seeRequired >= minSEE && item.seeRequired <= effectiveMaxSEE);

  // Find the highest achievable grade (first one in the filtered list)
  const highestAchievableGrade = gradeRequirements.length > 0 ? gradeRequirements[0] : null;

  // Calculate grade achievable with SEE = 35
  const totalAtMinSEE = cieTotal + minSEE;
  const gradeAt35 = isDsaLab 
    ? Math.min(10, Math.max(0, Math.floor(totalAtMinSEE / 30) + 1))
    : Math.min(10, Math.max(0, Math.floor(totalAtMinSEE / 20) + 1));
  const gradeAt35Item = {
    grade: gradeAt35,
    letter: ['F', 'F', 'F', 'F', 'P', 'C', 'B', 'B+', 'A', 'A+', 'O'][gradeAt35] || 'F',
    seeRequired: 35
  };

  const copyToClipboard = (grade, seeRequired) => {
    const seeText = seeRequired > effectiveMaxSEE ? 'Unachievable' : `${seeRequired.toFixed(1)} marks`;
    let text;
    
    if (typeof grade === 'string' && grade.startsWith('min-')) {
      const actualGrade = grade.replace('min-', '');
      const gradeLetter = ['F', 'F', 'F', 'F', 'P', 'C', 'B', 'B+', 'A', 'A+', 'O'][actualGrade] || 'F';
      text = `${subjectName}: Minimum SEE (35 marks) gives Grade ${actualGrade} (${gradeLetter})`;
    } else {
      const gradeLetter = gradeRequirements.find(g => g.grade === grade)?.letter;
      const examNote = hasLabSEE ? ` in SEE Exam (Lab SEE: ${labSEEValue})` : ' in SEE';
      text = `${subjectName}: Need ${seeText}${examNote} for Grade ${grade} (${gradeLetter})`;
    }
    
    navigator.clipboard.writeText(text);
    setCopiedGrade(grade);
    setTimeout(() => setCopiedGrade(''), 2000);
  };

  const copyAllRequirements = () => {
    const labNote = hasLabSEE ? ` | Lab SEE: ${labSEEValue}` : '';
    let allText = `SEE Requirements for ${subjectName} (CIE: ${cieTotal}${isDsaLab ? '/150' : '/100'}${labNote}):\n`;
    
    allText += gradeRequirements.map(item => {
      const seeText = item.seeRequired > effectiveMaxSEE ? 'Unachievable' : `${item.seeRequired.toFixed(1)} marks`;
      const examNote = hasLabSEE ? ' (Exam only)' : '';
      return `Grade ${item.grade} (${item.letter}): ${seeText}${examNote}`;
    }).join('\n');
    navigator.clipboard.writeText(allText);
    setCopiedGrade('all');
    setTimeout(() => setCopiedGrade(''), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">SEE Requirements</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-2">Subject: <span className="font-semibold">{subjectName}</span></p>
          <p className="text-gray-600">CIE Score: <span className="font-semibold">{cieTotal}{isDsaLab ? '/150' : '/100'}</span></p>
          {isDsaLab && !hasLabSEE && <p className="text-sm text-blue-600 mt-1">SEE marks out of 150</p>}
          {isDsaLab && hasLabSEE && <p className="text-sm text-green-600 mt-1">SEE Exam marks out of 100 (Lab SEE: {labSEEValue})</p>}
        </div>

        {/* Lab SEE Marks Input - Only for dsa-lab subjects */}
        {isDsaLab && (
          <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <label className="block text-sm font-medium text-blue-900 mb-2">
              Set Lab SEE Marks (Optional)
            </label>
            <input
              type="text"
              value={labSEEMarks}
              onChange={(e) => handleLabSEEChange(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-center font-medium bg-white"
            />
            <p className="text-xs text-blue-700 mt-1">Max: 50 marks. Enter to see adjusted SEE Exam requirements.</p>
          </div>
        )}

        <div className="space-y-3 mb-6">
          {gradeRequirements.map((item, index) => (
            <div key={item.grade} className={`flex items-center justify-between p-4 rounded-xl border ${
              index === 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 text-white rounded-lg flex items-center justify-center font-bold ${
                  index === 0 ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'
                }`}>
                  {item.grade}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Grade {item.letter}</div>
                  <div className="text-sm text-gray-600">
                    {hasLabSEE ? 'SEE Exam: ' : 'SEE: '}{item.seeRequired > effectiveMaxSEE ? 'Unachievable' : `${item.seeRequired.toFixed(1)}/${effectiveMaxSEE} marks`}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => copyToClipboard(item.grade, item.seeRequired)}
                className="p-2 hover:bg-white rounded-lg transition-colors group"
                title="Copy requirement"
              >
                <Copy className={`w-4 h-4 ${copiedGrade === item.grade ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
              </button>
            </div>
          ))}
        </div>

        {/* Only show minimum SEE requirement card for non-DSA/OS/ADLD subjects */}
        {!isDsaOsAdld && (
          <div className="mb-6">
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg flex items-center justify-center font-bold">
                  {gradeAt35Item.grade}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Grade {gradeAt35Item.letter}</div>
                  <div className="text-sm text-gray-600">
                    SEE: 35.0
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => copyToClipboard(`min-${gradeAt35Item.grade}`, gradeAt35Item.seeRequired)}
                className="p-2 hover:bg-white rounded-lg transition-colors group"
                title="Copy requirement"
              >
                <Copy className={`w-4 h-4 ${copiedGrade === `min-${gradeAt35Item.grade}` ? 'text-orange-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
              </button>
            </div>
          </div>
        )}

        <button
          onClick={copyAllRequirements}
          className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
            copiedGrade === 'all' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
        >
          {copiedGrade === 'all' ? 'Copied!' : 'Copy All Requirements'}
        </button>
      </div>
    </div>
  );
};

export default SEERequirementsPopup;
