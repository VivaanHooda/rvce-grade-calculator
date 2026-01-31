import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from '../../utils/storage';
import { calculateCIE, calculateGrade, getMaxValue, getGradeLetter } from '../../utils/calculations';
import { physicsSubjectsCGPA, chemistrySubjectsCGPA, physicsSubjects, chemistrySubjects } from '../../data/subjectsYear1';

// Components
import ModeSelection from '../../components/common/ModeSelection';
import CycleSelection from '../../components/common/CycleSelection';
import SubjectForm from '../../components/forms/SubjectForm';
import SubjectCard from '../../components/common/SubjectCard';
import SEERequirementsPopup from '../../components/common/SEERequirementsPopup';
import SGPAResultsPopup from '../../components/common/SGPAResultsPopup';
import CGPAResultsPopup from '../../components/common/CGPAResultsPopup';
import GradeScaleReference from '../../components/common/GradeScaleReference';

const Year1Calculator = ({ onBack }) => {
    // Navigation State
    const [currentMode, setCurrentMode] = useState(() => loadFromStorage(STORAGE_KEYS.CURRENT_MODE, ''));
    const [currentCycle, setCurrentCycle] = useState(() => loadFromStorage(STORAGE_KEYS.CURRENT_CYCLE, ''));

    // Calculation State
    const [subjectGrades, setSubjectGrades] = useState(() => loadFromStorage(STORAGE_KEYS.SUBJECT_GRADES, {}));
    const [formData, setFormData] = useState(() => loadFromStorage(STORAGE_KEYS.FORM_DATA, {}));
    const [finalCGPAGrades, setFinalCGPAGrades] = useState(() => {
        const saved = loadFromStorage(STORAGE_KEYS.YEAR1_GRADES, { physics: {}, chemistry: {} });
        return {
            physics: saved?.physics || {},
            chemistry: saved?.chemistry || {}
        };
    });

    // UI State
    const [seePopup, setSeePopup] = useState({ isOpen: false, subject: null, cieTotal: 0 });
    const [sgpaPopup, setSgpaPopup] = useState({ isOpen: false, sgpa: 0, cycleName: '' });
    const [cgpaPopup, setCgpaPopup] = useState({ isOpen: false, cgpa: 0 });
    const [validationError, setValidationError] = useState({ physics: '', chemistry: '', cgpa: '' });
    const [showResetConfirm, setShowResetConfirm] = useState({ physics: false, chemistry: false });
    const [showCIEResetConfirm, setShowCIEResetConfirm] = useState(false);

    // Persist navigation
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.CURRENT_MODE, currentMode);
    }, [currentMode]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.CURRENT_CYCLE, currentCycle);
    }, [currentCycle]);

    // Persist grades
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.SUBJECT_GRADES, subjectGrades);
    }, [subjectGrades]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.FORM_DATA, formData);
    }, [formData]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.YEAR1_GRADES, finalCGPAGrades);
    }, [finalCGPAGrades]);

    // Handlers
    const handleSetCurrentMode = (mode) => {
        setCurrentMode(mode);
        if (mode === 'final-cgpa') {
            setCurrentCycle(''); // Not needed for GPA mode
        }
    };

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

            // Handle different subject types for total marks calculation
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
            setFinalCGPAGrades(prev => ({
                ...prev,
                [currentCycle]: {
                    ...prev[currentCycle],
                    [subject.id]: gradePoint
                }
            }));
        }
    }, [formData, currentMode, currentCycle]);

    const handleGradeChange = (cycle, subjectId, value) => {
        setFinalCGPAGrades(prev => ({
            ...prev,
            [cycle]: {
                ...prev[cycle],
                [subjectId]: value === '' ? undefined : parseInt(value)
            }
        }));
    };

    const handleComputeSGPA = (cycle) => {
        const subjects = cycle === 'physics' ? physicsSubjectsCGPA : chemistrySubjectsCGPA;
        const cycleGrades = finalCGPAGrades[cycle] || {};

        // Validate all subjects have grades
        const missingSubjects = subjects.filter(s => cycleGrades[s.id] === undefined || cycleGrades[s.id] === '');
        if (missingSubjects.length > 0) {
            setValidationError(prev => ({
                ...prev,
                [cycle]: `Please enter grades for all ${cycle === 'physics' ? 'Physics' : 'Chemistry'} cycle subjects`
            }));
            return;
        }
        setValidationError(prev => ({ ...prev, [cycle]: '' }));

        let totalGradePoints = 0;
        let totalCredit = 0;

        subjects.forEach(subject => {
            const grade = cycleGrades[subject.id];
            if (grade !== undefined && grade !== '') {
                totalGradePoints += grade * subject.Credit;
                totalCredit += subject.Credit;
            }
        });

        const sgpa = totalCredit > 0 ? (totalGradePoints / totalCredit) : 0;
        const roundedSGPA = (Math.ceil(sgpa * 100 - 0.00001) / 100).toFixed(2);
        setSgpaPopup({
            isOpen: true,
            sgpa: roundedSGPA,
            cycleName: cycle === 'physics' ? 'Physics Cycle' : 'Chemistry Cycle'
        });
    };

    const handleComputeCGPA = () => {
        // Validate both cycles are fully entered
        const missingPhysics = physicsSubjectsCGPA.filter(s =>
            finalCGPAGrades.physics?.[s.id] === undefined || finalCGPAGrades.physics?.[s.id] === ''
        );
        const missingChemistry = chemistrySubjectsCGPA.filter(s =>
            finalCGPAGrades.chemistry?.[s.id] === undefined || finalCGPAGrades.chemistry?.[s.id] === ''
        );

        if (missingPhysics.length > 0 && missingChemistry.length > 0) {
            setValidationError(prev => ({ ...prev, cgpa: 'Please enter grades for both Physics and Chemistry cycles' }));
            return;
        } else if (missingPhysics.length > 0) {
            setValidationError(prev => ({ ...prev, cgpa: 'Please enter all Physics cycle grades first' }));
            return;
        } else if (missingChemistry.length > 0) {
            setValidationError(prev => ({ ...prev, cgpa: 'Please enter all Chemistry cycle grades first' }));
            return;
        }
        setValidationError(prev => ({ ...prev, cgpa: '' }));

        let totalGradePoints = 0;
        let totalCredit = 0;

        physicsSubjectsCGPA.forEach(subject => {
            const grade = finalCGPAGrades.physics && finalCGPAGrades.physics[subject.id];
            if (grade !== undefined && grade !== '') {
                totalGradePoints += grade * subject.Credit;
                totalCredit += subject.Credit;
            }
        });

        chemistrySubjectsCGPA.forEach(subject => {
            const grade = finalCGPAGrades.chemistry && finalCGPAGrades.chemistry[subject.id];
            if (grade !== undefined && grade !== '') {
                totalGradePoints += grade * subject.Credit;
                totalCredit += subject.Credit;
            }
        });

        const cgpa = totalCredit > 0 ? (totalGradePoints / totalCredit) : 0;
        const roundedCGPA = (Math.ceil(cgpa * 100 - 0.00001) / 100).toFixed(2);
        setCgpaPopup({ isOpen: true, cgpa: roundedCGPA });
    };

    const handleResetCycle = (cycle) => {
        setFinalCGPAGrades(prev => ({
            ...prev,
            [cycle]: {}
        }));
        setValidationError(prev => ({ ...prev, [cycle]: '' }));
        setShowResetConfirm(prev => ({ ...prev, [cycle]: false }));
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

    const getSubjects = useMemo(() => {
        // For CGPA mode, use full subject lists. For CIE and Final Grade, use filtered lists
        if (currentMode === 'cgpa') {
            return currentCycle === 'physics' ? physicsSubjectsCGPA : chemistrySubjectsCGPA;
        } else {
            // CIE Finalization and Final Grade modes use filtered subject lists
            return currentCycle === 'physics' ? physicsSubjects : chemistrySubjects;
        }
    }, [currentCycle, currentMode]);

    // Render Logic
    if (!currentMode) {
        return <ModeSelection onSelect={handleSetCurrentMode} onBack={onBack} />;
    }

    if (currentMode === 'final-cgpa') {
        return (
            <div className="space-y-6 sm:space-y-8">
                <div className="flex items-center justify-between mb-6 sm:mb-8 px-4">
                    <button
                        onClick={() => handleSetCurrentMode('')}
                        className="text-blue-600 hover:text-blue-700 font-medium text-base sm:text-lg transition-colors"
                    >
                        ← Back to Modes
                    </button>
                </div>

                <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 px-4">
                    {/* Physics Cycle */}
                    <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm">
                        <div className="grid grid-cols-[1fr_auto] gap-3 items-start mb-4 sm:mb-6">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                                ⚡ Physics Cycle
                            </h3>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                                20 Credits
                            </span>
                        </div>
                        <div className="space-y-2 sm:space-y-3">
                            {physicsSubjectsCGPA.map((subject) => (
                                <SubjectCard
                                    key={subject.id}
                                    subject={subject}
                                    gradeValue={finalCGPAGrades.physics[subject.id]}
                                    onGradeChange={(id, val) => handleGradeChange('physics', id, val)}
                                />
                            ))}
                        </div>
                        <button
                            onClick={() => handleComputeSGPA('physics')}
                            className="w-full mt-4 py-3 px-4 rounded-xl font-medium transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-98"
                        >
                            Compute SGPA
                        </button>
                        {validationError.physics && (
                            <p className="mt-2 text-sm text-amber-600 flex items-center gap-1">
                                <span>⚠</span> {validationError.physics}
                            </p>
                        )}
                        {!showResetConfirm.physics ? (
                            <button
                                onClick={() => setShowResetConfirm(prev => ({ ...prev, physics: true }))}
                                className="w-full mt-3 py-2 px-4 rounded-xl font-medium transition-all border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm"
                            >
                                Reset Grades
                            </button>
                        ) : (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                                <p className="text-sm text-red-700 mb-2">Are you sure you want to reset all Physics cycle grades?</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleResetCycle('physics')}
                                        className="flex-1 py-2 px-3 rounded-lg font-medium bg-red-500 hover:bg-red-600 text-white text-sm"
                                    >
                                        Yes, Reset
                                    </button>
                                    <button
                                        onClick={() => setShowResetConfirm(prev => ({ ...prev, physics: false }))}
                                        className="flex-1 py-2 px-3 rounded-lg font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Chemistry Cycle */}
                    <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm">
                        <div className="grid grid-cols-[1fr_auto] gap-3 items-start mb-4 sm:mb-6">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                                🧪 Chemistry Cycle
                            </h3>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
                                20 Credits
                            </span>
                        </div>
                        <div className="space-y-2 sm:space-y-3">
                            {chemistrySubjectsCGPA.map((subject) => (
                                <SubjectCard
                                    key={subject.id}
                                    subject={subject}
                                    gradeValue={finalCGPAGrades.chemistry[subject.id]}
                                    onGradeChange={(id, val) => handleGradeChange('chemistry', id, val)}
                                />
                            ))}
                        </div>
                        <button
                            onClick={() => handleComputeSGPA('chemistry')}
                            className="w-full mt-4 py-3 px-4 rounded-xl font-medium transition-all bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-98"
                        >
                            Compute SGPA
                        </button>
                        {validationError.chemistry && (
                            <p className="mt-2 text-sm text-amber-600 flex items-center gap-1">
                                <span>⚠</span> {validationError.chemistry}
                            </p>
                        )}
                        {!showResetConfirm.chemistry ? (
                            <button
                                onClick={() => setShowResetConfirm(prev => ({ ...prev, chemistry: true }))}
                                className="w-full mt-3 py-2 px-4 rounded-xl font-medium transition-all border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm"
                            >
                                Reset Grades
                            </button>
                        ) : (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                                <p className="text-sm text-red-700 mb-2">Are you sure you want to reset all Chemistry cycle grades?</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleResetCycle('chemistry')}
                                        className="flex-1 py-2 px-3 rounded-lg font-medium bg-red-500 hover:bg-red-600 text-white text-sm"
                                    >
                                        Yes, Reset
                                    </button>
                                    <button
                                        onClick={() => setShowResetConfirm(prev => ({ ...prev, chemistry: false }))}
                                        className="flex-1 py-2 px-3 rounded-lg font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-center px-4">
                    <button
                        onClick={handleComputeCGPA}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-xl font-medium text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all active:scale-98"
                    >
                        Compute CGPA
                    </button>
                    {validationError.cgpa && (
                        <p className="mt-2 text-sm text-amber-600 flex items-center justify-center gap-1">
                            <span>⚠</span> {validationError.cgpa}
                        </p>
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

    if (!currentCycle) {
        return <CycleSelection onSelect={setCurrentCycle} onBack={() => handleSetCurrentMode('')} />;
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4 px-4">
                <button
                    onClick={() => setCurrentCycle('')}
                    className="text-blue-600 hover:text-blue-700 font-medium text-base sm:text-lg transition-colors text-left"
                >
                    ← Back to Cycles
                </button>
                <div className="text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        {currentCycle === 'physics' ? 'Physics Cycle' : 'Chemistry Cycle'}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600">
                        {currentMode === 'cie-final' ? 'CIE Finalization' : 'Final Grade Calculator'}
                    </p>
                </div>
                <div className="w-32 hidden sm:block"></div>
            </div>

            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 px-4">
                {getSubjects.map((subject) => (
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
                        className="w-full py-2 px-4 rounded-xl font-medium transition-all border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm"
                    >
                        Reset All Marks
                    </button>
                ) : (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-sm text-red-700 mb-3">Are you sure you want to reset all marks?</p>
                        <div className="flex gap-2">
                            <button
                                onClick={handleResetCIE}
                                className="flex-1 py-2 px-3 rounded-lg font-medium bg-red-500 hover:bg-red-600 text-white text-sm"
                            >
                                Yes, Reset
                            </button>
                            <button
                                onClick={() => setShowCIEResetConfirm(false)}
                                className="flex-1 py-2 px-3 rounded-lg font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm"
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

export default Year1Calculator;
