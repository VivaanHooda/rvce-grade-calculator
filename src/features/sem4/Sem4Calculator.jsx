import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GraduationCap } from 'lucide-react';
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from '../../utils/storage';
import { calculateCIE, calculateGrade, getMaxValue, getGradeLetter } from '../../utils/calculations';
import {
    sem4SubjectsCGPA_CSECore, sem4SubjectsCGPA_AIML, sem4SubjectsCGPA_ISE, sem4SubjectsCGPA_EEE, sem4SubjectsCGPA_ECE, sem4SubjectsCGPA_ETE
} from '../../data/subjectsSem4';

// Components
import ModeSelection from '../../components/common/ModeSelection';
import SubjectForm from '../../components/forms/SubjectForm';
import SubjectCard from '../../components/common/SubjectCard';
import SEERequirementsPopup from '../../components/common/SEERequirementsPopup';
import SGPAResultsPopup from '../../components/common/SGPAResultsPopup';
import CGPAResultsPopup from '../../components/common/CGPAResultsPopup';
import GradeScaleReference from '../../components/common/GradeScaleReference';

const Sem4Calculator = ({ onBack, currentBranch: initialBranch }) => {
    // Navigation State
    const [currentMode, setCurrentMode] = useState(() => loadFromStorage(STORAGE_KEYS.CURRENT_MODE, ''));
    const [branch, setBranch] = useState(() => initialBranch || loadFromStorage(STORAGE_KEYS.CURRENT_BRANCH, ''));

    // Calculation State
    const [subjectGrades, setSubjectGrades] = useState(() => loadFromStorage(STORAGE_KEYS.SUBJECT_GRADES, {}));
    const [formData, setFormData] = useState(() => loadFromStorage(STORAGE_KEYS.FORM_DATA, {}));
    const [sem4Grades, setSem4Grades] = useState(() => loadFromStorage(STORAGE_KEYS.SEM4_GRADES, {}));
    const [cgpaUpto3, setCgpaUpto3] = useState(() => loadFromStorage(STORAGE_KEYS.CGPA_UPTO_SEM3, ''));

    // UI State
    const [seePopup, setSeePopup] = useState({ isOpen: false, subject: null, cieTotal: 0 });
    const [sgpaPopup, setSgpaPopup] = useState({ isOpen: false, sgpa: 0, cycleName: '' });
    const [expandedClusters, setExpandedClusters] = useState({ cs: false });
    const [validationError, setValidationError] = useState({ sgpa: '', cgpa: '' });
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showCIEResetConfirm, setShowCIEResetConfirm] = useState(false);
    const [cgpaPopup, setCgpaPopup] = useState({ isOpen: false, cgpa: 0 });

    const toggleCluster = (cluster) => {
        setExpandedClusters(prev => ({ ...prev, [cluster]: !prev[cluster] }));
    };

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
        saveToStorage(STORAGE_KEYS.SEM4_GRADES, sem4Grades);
    }, [sem4Grades]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.CGPA_UPTO_SEM3, cgpaUpto3);
    }, [cgpaUpto3]);

    // Handlers
    const getSubjects = useCallback(() => {
        switch (branch) {
            case 'cse-aiml': return sem4SubjectsCGPA_AIML;
            case 'ise': return sem4SubjectsCGPA_ISE;
            case 'cse-core': return sem4SubjectsCGPA_CSECore;
            case 'eee': return sem4SubjectsCGPA_EEE;
            case 'ece': return sem4SubjectsCGPA_ECE;
            case 'ete': return sem4SubjectsCGPA_ETE;
            default: return sem4SubjectsCGPA_CSECore;
        }
    }, [branch]);

    const currentSubjects = useMemo(() => {
        const subjects = getSubjects();
        if (currentMode === 'cie-final' || currentMode === 'final-grade') {
            return subjects.filter(s => !['aec-sem4', 'pe-sem4', 'dtl-sem4'].includes(s.id));
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
            let normalizedTotal;

            if (subject.type === 'dsa-lab') {
                // CIE (150) + Lab SEE (50) + Theory SEE (100) = 300 max
                // Then (CIE + SEE) / 3 = 100 max for final percentage
                totalMarks = cieTotal + labSee + see; // Max: 300
                normalizedTotal = Math.ceil((totalMarks / 300 * 100) - 0.00001); // Normalize to 100
            } else {
                // Regular courses: CIE (100) + SEE (100) = 200 max
                totalMarks = cieTotal + see;
                normalizedTotal = Math.ceil((totalMarks / 2) - 0.00001); // 200 / 2 = 100
            }

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
            setSem4Grades(prev => ({
                ...prev,
                [subject.id]: gradePoint
            }));
        }
    }, [formData, currentMode]);

    const handleGradeChange = (subjectId, value) => {
        setSem4Grades(prev => ({
            ...prev,
            [subjectId]: value === '' ? undefined : parseInt(value)
        }));
    };

    const handleComputeSGPA = () => {
        // Validate all subjects have grades
        const missingSubjects = currentSubjects.filter(s => sem4Grades[s.id] === undefined || sem4Grades[s.id] === '');
        if (missingSubjects.length > 0) {
            setValidationError(prev => ({ ...prev, sgpa: 'Please enter grades for all subjects' }));
            return;
        }
        setValidationError(prev => ({ ...prev, sgpa: '' }));

        let totalGradePoints = 0;
        let totalCredit = 0;

        currentSubjects.forEach(subject => {
            const grade = sem4Grades[subject.id];
            if (grade !== undefined && grade !== '') {
                totalGradePoints += grade * subject.Credit;
                totalCredit += subject.Credit;
            }
        });

        const sgpa = totalCredit > 0 ? (totalGradePoints / totalCredit) : 0;
        const roundedSGPA = (Math.ceil(sgpa * 100 - 0.00001) / 100).toFixed(2);
        setSgpaPopup({ isOpen: true, sgpa: roundedSGPA, cycleName: '4th Sem SGPA' });
    };

    const handleComputeCGPA = () => {
        // Validate cumulative CGPA up to 3rd Sem is entered
        if (!cgpaUpto3 || parseFloat(cgpaUpto3) <= 0) {
            setValidationError(prev => ({ ...prev, cgpa: 'Please enter your CGPA up to 3rd Sem first' }));
            return;
        }

        // Validate all 4th sem subjects have grades
        const missingSubjects = currentSubjects.filter(s => sem4Grades[s.id] === undefined || sem4Grades[s.id] === '');
        if (missingSubjects.length > 0) {
            setValidationError(prev => ({ ...prev, cgpa: 'Please enter grades for all 4th Sem subjects' }));
            return;
        }
        setValidationError(prev => ({ ...prev, cgpa: '' }));

        let totalGradePoints = 0;
        let totalCredit = 0;

        // Up to 3rd Semester: 61 credits (1st Year 40 + 3rd Sem 21)
        totalGradePoints += parseFloat(cgpaUpto3) * 61;
        totalCredit += 61;

        // 4th Semester: 23 credits
        currentSubjects.forEach(subject => {
            const grade = sem4Grades[subject.id];
            if (grade !== undefined && grade !== '') {
                totalGradePoints += grade * subject.Credit;
                totalCredit += subject.Credit;
            }
        });

        const cgpa = totalCredit > 0 ? (totalGradePoints / totalCredit) : 0;
        const roundedCGPA = (Math.ceil(cgpa * 100 - 0.00001) / 100).toFixed(2);
        setCgpaPopup({ isOpen: true, cgpa: roundedCGPA });
    };

    const handleResetGrades = () => {
        setSem4Grades({});
        setCgpaUpto3('');
        setValidationError({ sgpa: '', cgpa: '' });
        setShowResetConfirm(false);
    };

    const handleResetCIE = () => {
        setFormData({});
        setSubjectGrades({});
        setShowCIEResetConfirm(false);
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
                        className="text-lg font-medium text-brand transition-colors hover:text-brand-hover"
                    >
                        ← Back to Semester Selection
                    </button>
                </div>
                <div className="max-w-md p-8 mx-auto bg-white border border-hairline shadow-card rounded-panel">
                    <h3 className="mb-6 text-2xl font-bold text-center text-ink">Select Your Branch</h3>
                    <div className="grid gap-4">
                        {/* CS Cluster */}
                        <div className="overflow-hidden border border-hairline rounded-card">
                            <button
                                onClick={() => toggleCluster('cs')}
                                className="flex items-center justify-between w-full px-6 py-4 transition-colors bg-gray-50 hover:bg-gray-100"
                            >
                                <span className="text-sm font-semibold tracking-wide text-gray-700 uppercase">CS Cluster</span>
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
                                className={`transition-all duration-300 ease-in-out ${expandedClusters.cs ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
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
                                            className="w-full px-5 py-3 text-base font-medium text-gray-700 transition-all border border-hairline rounded-xl hover:border-blue-500 hover:bg-brand-soft hover:text-brand-hover"
                                        >
                                            {b.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {/* ECE Cluster */}
                        <div className="overflow-hidden border border-hairline rounded-card">
                            <button
                                onClick={() => toggleCluster('ece')}
                                className="flex items-center justify-between w-full px-6 py-4 transition-colors bg-gray-50 hover:bg-gray-100"
                            >
                                <span className="text-sm font-semibold tracking-wide text-gray-700 uppercase">ECE Cluster</span>
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
                                className={`transition-all duration-300 ease-in-out ${expandedClusters.ece ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    } overflow-hidden`}
                            >
                                <div className="p-4 space-y-3 bg-white">
                                    {[
                                        { id: 'eee', name: 'EEE' },
                                        { id: 'ece', name: 'ECE' },
                                        { id: 'ete', name: 'ETE' }
                                    ].map(b => (
                                        <button
                                            key={b.id}
                                            onClick={() => setBranch(b.id)}
                                            className="w-full px-5 py-3 text-base font-medium text-gray-700 transition-all border border-hairline rounded-xl hover:border-blue-500 hover:bg-brand-soft hover:text-brand-hover"
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
                        className="text-lg font-medium text-brand transition-colors hover:text-brand-hover"
                    >
                        ← Back to Modes
                    </button>
                </div>

                <div className="max-w-2xl mx-auto">
                    <div className="p-8 bg-white border border-hairline shadow-card rounded-panel">
                        <div className="grid grid-cols-[1fr_auto] gap-3 items-start mb-6">
                            <h3 className="flex items-center gap-2 text-xl font-bold text-ink sm:text-2xl whitespace-nowrap">
                                <GraduationCap className="w-6 h-6 text-brand" />
                                4th Sem SGPA ({branch.toUpperCase()})
                            </h3>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-soft text-brand whitespace-nowrap">
                                {currentSubjects.reduce((sum, s) => sum + s.Credit, 0)} Credits
                            </span>
                        </div>
                        <div className="space-y-3">
                            {currentSubjects.map((subject) => (
                                <SubjectCard
                                    key={subject.id}
                                    subject={subject}
                                    gradeValue={sem4Grades[subject.id]}
                                    onGradeChange={handleGradeChange}
                                />
                            ))}
                        </div>
                        <button
                            onClick={handleComputeSGPA}
                            className="w-full mt-4 py-3 px-4 rounded-xl font-medium transition-all bg-brand hover:bg-brand-hover text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            Compute SGPA
                        </button>
                        {validationError.sgpa && (
                            <p className="flex items-center gap-1 mt-2 text-sm text-amber-600">
                                <span>⚠</span> {validationError.sgpa}
                            </p>
                        )}
                    </div>

                    <div className="p-8 mt-8 bg-white border border-hairline shadow-card rounded-card">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-ink">CGPA up to 3rd Semester</h3>
                            <span className="inline-block px-3 py-1 text-sm font-medium rounded-full text-brand bg-brand-soft">
                                61 Credits
                            </span>
                        </div>
                        <div className="p-4 border border-hairline bg-gray-50 rounded-xl">
                            <label className="block mb-2 font-medium text-ink">Enter your CGPA up to 3rd Sem</label>
                            <input
                                type="text"
                                inputMode="decimal"
                                value={cgpaUpto3}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    const numericRegex = /^[0-9]*\.?[0-9]*$/;
                                    if (value === '' || numericRegex.test(value)) {
                                        const numValue = parseFloat(value) || 0;
                                        if (value === '' || (numValue >= 0 && numValue <= 10)) {
                                            setCgpaUpto3(value);
                                        }
                                    }
                                }}
                                placeholder="Enter CGPA (0-10)"
                                className="w-full px-4 py-3 text-ink bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-ring focus:border-brand"
                            />
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <button
                            onClick={handleComputeCGPA}
                            className="bg-brand hover:bg-brand-hover text-white py-4 px-8 rounded-xl font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                        >
                            Compute CGPA
                        </button>
                        {validationError.cgpa && (
                            <p className="flex items-center justify-center gap-1 mt-2 text-sm text-amber-600">
                                <span>⚠</span> {validationError.cgpa}
                            </p>
                        )}
                    </div>

                    {!showResetConfirm ? (
                        <button
                            onClick={() => setShowResetConfirm(true)}
                            className="w-full px-4 py-2 mt-6 text-sm font-medium text-gray-600 transition-all border border-gray-300 rounded-xl hover:bg-gray-50"
                        >
                            Reset All Grades
                        </button>
                    ) : (
                        <div className="p-4 mt-6 border border-red-200 bg-red-50 rounded-xl">
                            <p className="mb-3 text-sm text-red-700">Are you sure you want to reset all grades and your CGPA up to 3rd Sem?</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleResetGrades}
                                    className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
                                >
                                    Yes, Reset
                                </button>
                                <button
                                    onClick={() => setShowResetConfirm(false)}
                                    className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
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
        <div className="space-y-6 sm:space-y-8">
            <div className="px-4">
                <button
                    onClick={() => setCurrentMode('')}
                    className="mb-4 text-base font-medium text-brand transition-colors hover:text-brand-hover sm:text-lg"
                >
                    ← Back to Modes
                </button>
                <div className="text-center">
                    <h2 className="mb-2 text-2xl font-bold text-ink sm:text-3xl">
                        Sem 4 ({branch.toUpperCase()})
                    </h2>
                    <p className="text-sm text-gray-600 sm:text-base">
                        {currentMode === 'cie-final' ? 'CIE Finalization' : 'Final Grade Calculator'}
                    </p>
                </div>
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

            {/* Reset Button */}
            <div className="px-4">
                {!showCIEResetConfirm ? (
                    <button
                        onClick={() => setShowCIEResetConfirm(true)}
                        className="w-full px-4 py-2 text-sm font-medium text-gray-600 transition-all border border-gray-300 rounded-xl hover:bg-gray-50"
                    >
                        Reset All Marks
                    </button>
                ) : (
                    <div className="p-4 border border-red-200 bg-red-50 rounded-xl">
                        <p className="mb-3 text-sm text-red-700">Are you sure you want to reset all marks?</p>
                        <div className="flex gap-2">
                            <button
                                onClick={handleResetCIE}
                                className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
                            >
                                Yes, Reset
                            </button>
                            <button
                                onClick={() => setShowCIEResetConfirm(false)}
                                className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="px-4">
                <GradeScaleReference />
            </div>
        </div>
    );
};

export default Sem4Calculator;