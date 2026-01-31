import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from '../../utils/storage';
import { calculateCIE, calculateGrade, getMaxValue, getGradeLetter } from '../../utils/calculations';
import {
    sem3SubjectsCGPA_CSECore, sem3SubjectsCGPA_AIML, sem3SubjectsCGPA_ISE,
    sem3SubjectsCGPA_ECE, sem3SubjectsCGPA_ETE, sem3SubjectsCGPA_EEE, sem3SubjectsCGPA_EIE
} from '../../data/subjectsSem3';

// Components
import ModeSelection from '../../components/common/ModeSelection';
import SubjectForm from '../../components/forms/SubjectForm';
import SubjectCard from '../../components/common/SubjectCard';
import SEERequirementsPopup from '../../components/common/SEERequirementsPopup';
import SGPAResultsPopup from '../../components/common/SGPAResultsPopup';
import CGPAResultsPopup from '../../components/common/CGPAResultsPopup';

const Sem3Calculator = ({ onBack, currentBranch: initialBranch }) => {
    // Navigation State
    const [currentMode, setCurrentMode] = useState(() => loadFromStorage(STORAGE_KEYS.CURRENT_MODE, ''));
    const [branch, setBranch] = useState(() => initialBranch || loadFromStorage(STORAGE_KEYS.CURRENT_BRANCH, ''));

    // Calculation State
    const [subjectGrades, setSubjectGrades] = useState(() => loadFromStorage(STORAGE_KEYS.SUBJECT_GRADES, {}));
    const [formData, setFormData] = useState(() => loadFromStorage(STORAGE_KEYS.FORM_DATA, {}));
    const [sem3Grades, setSem3Grades] = useState(() => loadFromStorage(STORAGE_KEYS.SEM3_GRADES, {}));
    const [firstYearCGPA, setFirstYearCGPA] = useState(() => loadFromStorage(STORAGE_KEYS.FIRST_YEAR_CGPA, ''));

    // UI State
    const [seePopup, setSeePopup] = useState({ isOpen: false, subject: null, cieTotal: 0 });
    const [sgpaPopup, setSgpaPopup] = useState({ isOpen: false, sgpa: 0, cycleName: '' });
    const [expandedClusters, setExpandedClusters] = useState({ cs: false, ece: false });

    const toggleCluster = (cluster) => {
        setExpandedClusters(prev => ({ ...prev, [cluster]: !prev[cluster] }));
    };
    const [cgpaPopup, setCgpaPopup] = useState({ isOpen: false, cgpa: 0 });

    // Persist
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.CURRENT_MODE, currentMode);
    }, [currentMode]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.CURRENT_BRANCH, branch);
    }, [branch]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.SUBJECT_GRADES, subjectGrades);
    }, [subjectGrades]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.FORM_DATA, formData);
    }, [formData]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.SEM3_GRADES, sem3Grades);
    }, [sem3Grades]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.FIRST_YEAR_CGPA, firstYearCGPA);
    }, [firstYearCGPA]);

    // Handlers
    const getSubjects = useCallback(() => {
        switch (branch) {
            case 'cse-aiml': return sem3SubjectsCGPA_AIML;
            case 'ise': return sem3SubjectsCGPA_ISE;
            case 'ece': return sem3SubjectsCGPA_ECE;
            case 'ete': return sem3SubjectsCGPA_ETE;
            case 'eee': return sem3SubjectsCGPA_EEE;
            case 'eie': return sem3SubjectsCGPA_EIE;
            case 'cse-core':
            default: return sem3SubjectsCGPA_CSECore;
        }
    }, [branch]);

    const currentSubjects = useMemo(() => {
        const subjects = getSubjects();
        if (currentMode === 'cie-final' || currentMode === 'final-grade') {
            return subjects.filter(s => !s.id.includes('aec') && !s.id.includes('dtl'));
        }
        return subjects;
    }, [getSubjects, currentMode]);

    const handleCalculateSubject = useCallback((subject) => {
        const data = formData[subject.id] || {};
        const cieTotal = calculateCIE(data, subject.type);

        if (currentMode === 'cie-final') {
            setSubjectGrades(prev => ({
                ...prev,
                [subject.id]: { type: 'cie', cieTotal: Math.ceil(cieTotal - 0.00001) }
            }));
        } else if (currentMode === 'final-grade') {
            const see = parseFloat(data.see) || 0;
            const labSee = parseFloat(data.labSee) || 0;

            let totalMarks;
            if (subject.type === 'dsa-lab' || subject.type === 'ece-lab') {
                totalMarks = cieTotal + labSee + see;
            } else {
                totalMarks = cieTotal + see;
            }

            const normalizedTotal = Math.ceil((totalMarks / 2) - 0.00001);
            const gradePoint = Math.min(10, Math.max(0, Math.floor(normalizedTotal / 10) + 1));

            setSubjectGrades(prev => ({
                ...prev,
                [subject.id]: {
                    type: 'final',
                    cieTotal: Math.ceil(cieTotal - 0.00001),
                    see,
                    labSee,
                    gradePoint
                }
            }));

            // Sync with GPA mode state
            setSem3Grades(prev => ({
                ...prev,
                [subject.id]: gradePoint
            }));
        }
    }, [formData, currentMode]);

    const handleGradeChange = (subjectId, value) => {
        setSem3Grades(prev => ({
            ...prev,
            [subjectId]: value === '' ? undefined : parseInt(value)
        }));
    };

    const handleComputeSGPA = () => {
        let totalGradePoints = 0;
        let totalCredit = 0;

        currentSubjects.forEach(subject => {
            const grade = sem3Grades[subject.id];
            if (grade !== undefined && grade !== '') {
                totalGradePoints += grade * subject.Credit;
                totalCredit += subject.Credit;
            }
        });

        const sgpa = totalCredit > 0 ? (totalGradePoints / totalCredit) : 0;
        const roundedSGPA = (Math.ceil(sgpa * 100 - 0.00001) / 100).toFixed(2);
        setSgpaPopup({ isOpen: true, sgpa: roundedSGPA, cycleName: '3rd Sem SGPA' });
    };

    const handleComputeCGPA = () => {
        let totalGradePoints = 0;
        let totalCredit = 0;

        if (firstYearCGPA && parseFloat(firstYearCGPA) > 0) {
            totalGradePoints += parseFloat(firstYearCGPA) * 40;
            totalCredit += 40;
        }

        currentSubjects.forEach(subject => {
            const grade = sem3Grades[subject.id];
            if (grade !== undefined && grade !== '') {
                totalGradePoints += grade * subject.Credit;
                totalCredit += subject.Credit;
            }
        });

        const cgpa = totalCredit > 0 ? (totalGradePoints / totalCredit) : 0;
        const roundedCGPA = (Math.ceil(cgpa * 100 - 0.00001) / 100).toFixed(2);
        setCgpaPopup({ isOpen: true, cgpa: roundedCGPA });
    };

    const handleInputChange = useCallback((subjectId, field, value) => {
        setFormData(prev => ({
            ...prev,
            [subjectId]: {
                ...(prev[subjectId] || {}),
                [field]: value
            }
        }));
    }, []);

    const showSEERequirements = (subject, cie) => {
        setSeePopup({ isOpen: true, subject, cieTotal: cie });
    };

    const closeSEEPopup = () => setSeePopup({ isOpen: false, subject: null, cieTotal: 0 });

    // Render Logic
    if (!branch) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={onBack}
                        className="text-blue-600 hover:text-blue-700 font-medium text-lg transition-colors"
                    >
                        ← Back to Semester Selection
                    </button>
                </div>
                <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Select Your Branch</h3>
                    <div className="grid gap-4">
                        {/* CS Cluster */}
                        <div className="border border-gray-200 rounded-2xl overflow-hidden">
                            <button
                                onClick={() => toggleCluster('cs')}
                                className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">CS Cluster</span>
                                <svg
                                    className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${expandedClusters.cs ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <div
                                className={`transition-all duration-300 ease-in-out ${
                                    expandedClusters.cs ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                } overflow-hidden`}
                            >
                                <div className="p-4 space-y-3 bg-white">
                                    {[
                                        { id: 'cse-core', name: 'CSE (Core+CD+CY)' },
                                        { id: 'cse-aiml', name: 'CSE(AIML)' },
                                        { id: 'ise', name: 'ISE' }
                                    ].map(b => (
                                        <button
                                            key={b.id}
                                            onClick={() => setBranch(b.id)}
                                            className="w-full py-3 px-5 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all font-medium text-base text-gray-700 hover:text-blue-700"
                                        >
                                            {b.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ECE Cluster */}
                        <div className="border border-gray-200 rounded-2xl overflow-hidden">
                            <button
                                onClick={() => toggleCluster('ece')}
                                className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">ECE Cluster</span>
                                <svg
                                    className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${expandedClusters.ece ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <div
                                className={`transition-all duration-300 ease-in-out ${
                                    expandedClusters.ece ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                } overflow-hidden`}
                            >
                                <div className="p-4 space-y-3 bg-white">
                                    {[
                                        { id: 'ece', name: 'ECE' },
                                        { id: 'ete', name: 'ETE' },
                                        { id: 'eee', name: 'EEE' },
                                        { id: 'eie', name: 'EIE' }
                                    ].map(b => (
                                        <button
                                            key={b.id}
                                            onClick={() => setBranch(b.id)}
                                            className="w-full py-3 px-5 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all font-medium text-base text-gray-700 hover:text-blue-700"
                                        >
                                            {b.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentMode) {
        return <ModeSelection onSelect={setCurrentMode} onBack={() => setBranch('')} />;
    }

    if (currentMode === 'final-cgpa') {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => setCurrentMode('')}
                        className="text-blue-600 hover:text-blue-700 font-medium text-lg transition-colors"
                    >
                        ← Back to Modes
                    </button>
                </div>

                <div className="max-w-2xl mx-auto">
                    <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                📚 3rd Sem SGPA ({branch.toUpperCase()})
                            </h3>
                            <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                                {currentSubjects.reduce((sum, s) => sum + s.Credit, 0)} Credits
                            </span>
                        </div>
                        <div className="space-y-3">
                            {currentSubjects.map((subject) => (
                                <SubjectCard
                                    key={subject.id}
                                    subject={subject}
                                    gradeValue={sem3Grades[subject.id]}
                                    onGradeChange={handleGradeChange}
                                />
                            ))}
                        </div>
                        <button
                            onClick={handleComputeSGPA}
                            className="w-full mt-4 py-3 px-4 rounded-xl font-medium transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            Compute SGPA
                        </button>
                    </div>

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
                                onChange={(e) => {
                                    const value = e.target.value;
                                    const numericRegex = /^[0-9]*\.?[0-9]*$/;
                                    if (value === '' || numericRegex.test(value)) {
                                        const numValue = parseFloat(value) || 0;
                                        if (value === '' || (numValue >= 0 && numValue <= 10)) {
                                            setFirstYearCGPA(value);
                                        }
                                    }
                                }}
                                placeholder="Enter CGPA (0-10)"
                                className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white text-gray-900"
                            />
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <button
                            onClick={handleComputeCGPA}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-xl font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                        >
                            Compute CGPA
                        </button>
                    </div>
                </div>

                <SGPAResultsPopup
                    isOpen={sgpaPopup.isOpen}
                    onClose={() => setSgpaPopup({ ...sgpaPopup, isOpen: false })}
                    sgpa={sgpaPopup.sgpa}
                    cycleName={sgpaPopup.cycleName}
                />
                <CGPAResultsPopup
                    isOpen={cgpaPopup.isOpen}
                    onClose={() => setCgpaPopup({ ...cgpaPopup, isOpen: false })}
                    cgpa={cgpaPopup.cgpa}
                />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={() => setCurrentMode('')}
                    className="text-blue-600 hover:text-blue-700 font-medium text-lg transition-colors"
                >
                    ← Back to Modes
                </button>
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Sem 3 ({branch.toUpperCase()})
                    </h2>
                    <p className="text-gray-600">
                        {currentMode === 'cie-final' ? 'CIE Finalization' : 'Final Grade Calculator'}
                    </p>
                </div>
                <div className="w-32"></div>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {currentSubjects.map((subject) => (
                    <SubjectForm
                        key={subject.id}
                        subject={subject}
                        formData={formData}
                        currentMode={currentMode}
                        onCalculate={handleCalculateSubject}
                        onInputChange={handleInputChange}
                        subjectGrades={subjectGrades}
                        getGradeLetter={getGradeLetter}
                        onShowSEERequirements={showSEERequirements}
                    />
                ))}
            </div>

            <SEERequirementsPopup
                isOpen={seePopup.isOpen}
                onClose={closeSEEPopup}
                cieTotal={seePopup.cieTotal}
                subjectName={seePopup.subject?.name}
                subjectType={seePopup.subject?.type}
            />
        </div>
    );
};

export default Sem3Calculator;
