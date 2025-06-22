import React, { useState, useEffect } from 'react';
import { Calculator, BookOpen, Award, BarChart3, ChevronRight } from 'lucide-react';

const CGPACalculator = () => {
  const [currentMode, setCurrentMode] = useState('');
  const [currentCycle, setCurrentCycle] = useState('');
  const [subjectGrades, setSubjectGrades] = useState({});
  const [formData, setFormData] = useState({});

  const subjectCredits = {
    'math': 4, 'math-c': 4, 'phy': 4, 'chem': 4,
    'esc-p': 3, 'esc-c': 3, 'etc': 3, 'core': 3, 'plc': 3
  };

  const modes = [
    {
      id: 'cie-final',
      title: 'CIE Finalization',
      description: 'Calculate your Continuous Internal Evaluation marks',
      icon: <Calculator className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'final-grade',
      title: 'Final Grade Calculator',
      description: 'Complete grade calculation with SEE marks',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'cgpa-tracker',
      title: 'CGPA Tracker',
      description: 'Track your overall academic performance',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'from-green-500 to-green-600'
    }
  ];

  const cycles = [
    { id: 'physics', name: 'Physics Cycle', emoji: '⚡' },
    { id: 'chemistry', name: 'Chemistry Cycle', emoji: '🧪' }
  ];

  const physicsSubjects = [
    { id: 'math', name: 'Mathematics', credits: 4, type: 'math' },
    { id: 'phy', name: 'Physics', credits: 4, type: 'lab' },
    { id: 'esc-p', name: 'ESC', credits: 3, type: 'regular' },
    { id: 'etc', name: 'ETC', credits: 3, type: 'regular' },
    { id: 'core', name: 'Core', credits: 3, type: 'regular' }
  ];

  const chemistrySubjects = [
    { id: 'math-c', name: 'Mathematics', credits: 4, type: 'math' },
    { id: 'chem', name: 'Chemistry', credits: 4, type: 'lab' },
    { id: 'esc-c', name: 'ESC', credits: 3, type: 'regular' },
    { id: 'plc', name: 'PLC', credits: 3, type: 'lab' }
  ];

  const getSubjects = () => {
    return currentCycle === 'physics' ? physicsSubjects : chemistrySubjects;
  };

  const calculateCIE = (subject, data) => {
    const { q1 = 0, q2 = 0, t1 = 0, t2 = 0, matlab = 0, el = 0, lab = 0 } = data;
    
    if (subject.type === 'math') {
      return (q1 + q2) + ((t1 + t2) / 100 * 40) + matlab + el;
    } else if (subject.type === 'lab') {
      return ((q1 + q2) / 2) + ((t1 + t2) / 100 * 30) + lab + el;
    } else {
      return (q1 + q2) + ((t1 + t2) / 100 * 40) + el;
    }
  };

  const calculateFinalGrade = (cieTotal, see = 0) => {
    const total = (cieTotal + see) / 2;
    return Math.min(10, Math.max(0, Math.floor(total / 10) + 1));
  };

  const getGradeLetter = (grade) => {
    const gradeMap = {
      10: 'O', 9: 'A+', 8: 'A', 7: 'B+', 6: 'B', 5: 'C', 4: 'P'
    };
    return gradeMap[grade] || 'F';
  };

  const handleInputChange = (subjectId, field, value) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      [subjectId]: {
        ...prev[subjectId],
        [field]: numValue
      }
    }));
  };

  const calculateSubject = (subject) => {
    const data = formData[subject.id] || {};
    const cieTotal = calculateCIE(subject, data);
    
    if (currentMode === 'cie-final') {
      setSubjectGrades(prev => ({
        ...prev,
        [subject.id]: { cieTotal, type: 'cie' }
      }));
    } else {
      const see = data.see || 0;
      const gradePoint = calculateFinalGrade(cieTotal, see);
      setSubjectGrades(prev => ({
        ...prev,
        [subject.id]: { cieTotal, gradePoint, see, type: 'final' }
      }));
    }
  };

  const calculateOverallCGPA = () => {
    const subjects = getSubjects();
    let totalGradePoints = 0;
    let totalCredits = 0;
    
    subjects.forEach(subject => {
      const grade = subjectGrades[subject.id];
      if (grade && grade.gradePoint) {
        totalGradePoints += grade.gradePoint * subject.credits;
        totalCredits += subject.credits;
      }
    });
    
    return totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;
  };

  const ModeSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Academic Calculator</h1>
        <p className="text-gray-600">Choose your calculation mode</p>
      </div>
      
      <div className="grid gap-4 max-w-2xl mx-auto">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setCurrentMode(mode.id)}
            className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:shadow-lg transition-all duration-200 text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${mode.color} flex items-center justify-center text-white`}>
                  {mode.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{mode.title}</h3>
                  <p className="text-gray-600 text-sm">{mode.description}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const CycleSelection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentMode('')}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Modes
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Select Your Cycle</h2>
        <div className="w-20"></div>
      </div>
      
      <div className="grid gap-4 max-w-md mx-auto">
        {cycles.map((cycle) => (
          <button
            key={cycle.id}
            onClick={() => setCurrentCycle(cycle.id)}
            className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-200 text-center group"
          >
            <div className="text-3xl mb-2">{cycle.emoji}</div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
              {cycle.name}
            </h3>
          </button>
        ))}
      </div>
    </div>
  );

  const SubjectForm = ({ subject }) => {
    const data = formData[subject.id] || {};
    const result = subjectGrades[subject.id];

    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{subject.name}</h3>
            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {subject.credits} Credits
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quiz 1</label>
            <input
              type="number"
              min="0"
              max="100"
              value={data.q1 || ''}
              onChange={(e) => handleInputChange(subject.id, 'q1', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quiz 2</label>
            <input
              type="number"
              min="0"
              max="100"
              value={data.q2 || ''}
              onChange={(e) => handleInputChange(subject.id, 'q2', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Test 1</label>
            <input
              type="number"
              min="0"
              max="100"
              value={data.t1 || ''}
              onChange={(e) => handleInputChange(subject.id, 't1', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Test 2</label>
            <input
              type="number"
              min="0"
              max="100"
              value={data.t2 || ''}
              onChange={(e) => handleInputChange(subject.id, 't2', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Subject-specific fields */}
        {subject.type === 'math' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MATLAB (Max: 20)</label>
              <input
                type="number"
                min="0"
                max="20"
                value={data.matlab || ''}
                onChange={(e) => handleInputChange(subject.id, 'matlab', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">EL (Max: 20)</label>
              <input
                type="number"
                min="0"
                max="20"
                value={data.el || ''}
                onChange={(e) => handleInputChange(subject.id, 'el', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {subject.type === 'lab' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lab Internals (Max: 30)</label>
              <input
                type="number"
                min="0"
                max="30"
                value={data.lab || ''}
                onChange={(e) => handleInputChange(subject.id, 'lab', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">EL (Max: 30)</label>
              <input
                type="number"
                min="0"
                max="30"
                value={data.el || ''}
                onChange={(e) => handleInputChange(subject.id, 'el', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {subject.type === 'regular' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">EL (Max: 40)</label>
            <input
              type="number"
              min="0"
              max="40"
              value={data.el || ''}
              onChange={(e) => handleInputChange(subject.id, 'el', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {currentMode === 'final-grade' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SEE Marks</label>
            <input
              type="number"
              min="0"
              max="100"
              value={data.see || ''}
              onChange={(e) => handleInputChange(subject.id, 'see', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        <button
          onClick={() => calculateSubject(subject)}
          className="w-full bg-black text-white py-2.5 rounded-lg hover:bg-gray-900 transition-colors font-medium"
        >
          Calculate {currentMode === 'cie-final' ? 'CIE' : 'Grade'}
        </button>

        {result && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            {currentMode === 'cie-final' ? (
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  CIE: {result.cieTotal.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">out of 100</div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  Grade: {result.gradePoint} ({getGradeLetter(result.gradePoint)})
                </div>
                <div className="text-sm text-gray-600">
                  CIE: {result.cieTotal.toFixed(2)} | Total: {((result.cieTotal + result.see) / 2).toFixed(2)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const SubjectsView = () => {
    const subjects = getSubjects();
    const cgpa = calculateOverallCGPA();
    const completedSubjects = Object.keys(subjectGrades).length;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              setCurrentCycle('');
              setSubjectGrades({});
              setFormData({});
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Cycles
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {currentCycle === 'physics' ? '⚡ Physics Cycle' : '🧪 Chemistry Cycle'}
            </h2>
            <p className="text-gray-600">
              {currentMode === 'cie-final' ? 'CIE Finalization' : 'Final Grade Calculator'}
            </p>
          </div>
          <div className="w-20"></div>
        </div>

        {currentMode === 'final-grade' && completedSubjects > 0 && (
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl p-6 text-center mb-6">
            <div className="text-3xl font-bold mb-2">{cgpa}</div>
            <div className="text-purple-100">
              Overall CGPA • {completedSubjects} of {subjects.length} subjects calculated
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <SubjectForm key={subject.id} subject={subject} />
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Grade Scale Reference</h3>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
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
              <div key={index} className="text-center p-2 bg-gray-50 rounded-lg">
                <div className="font-semibold text-gray-900">{item.grade}</div>
                <div className="text-sm text-gray-600">{item.letter}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {!currentMode && <ModeSelection />}
        {currentMode && !currentCycle && <CycleSelection />}
        {currentMode && currentCycle && <SubjectsView />}
      </div>
    </div>
  );
};

export default CGPACalculator;