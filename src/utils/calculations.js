// Grade letter mapping
export const getGradeLetter = (gradePoint) => {
  const gradeMap = {
    10: 'O',
    9: 'A+',
    8: 'A',
    7: 'B+',
    6: 'B',
    5: 'C',
    4: 'P',
    0: 'F'
  };
  return gradeMap[gradePoint] || 'F';
};

// Calculate CIE for different subject types
export const calculateCIE = (data, subjectType) => {
  const q1 = parseFloat(data.q1) || 0;
  const q2 = parseFloat(data.q2) || 0;
  const t1 = parseFloat(data.t1) || 0;
  const t2 = parseFloat(data.t2) || 0;

  const quizMarks = Math.max(q1, q2);
  const testMarks = Math.max(t1, t2);

  switch (subjectType) {
    case 'math': {
      const matlab = parseFloat(data.matlab) || 0;
      const el = parseFloat(data.el) || 0;
      return quizMarks + testMarks + matlab + el;
    }
    case 'lab': {
      const lab = parseFloat(data.lab) || 0;
      const el = parseFloat(data.el) || 0;
      return quizMarks + testMarks + lab + el;
    }
    case 'regular': {
      const el = parseFloat(data.el) || 0;
      return quizMarks + testMarks + el;
    }
    case 'dsa-lab': {
      // DSA/OS: Quiz 1, Quiz 2 (10 each), Test 1, Test 2 (50 each), Lab (50), EL (40)
      // CIE Total: 150 = (test1 + test2) * 0.4 + quiz1 + quiz2 + Lab + EL
      // = (50 + 50) * 0.4 + 10 + 10 + 50 + 40 = 40 + 20 + 50 + 40 = 150
      const lab = parseFloat(data.lab) || 0;
      const el = parseFloat(data.el) || 0;
      const t1 = parseFloat(data.t1) || 0;
      const t2 = parseFloat(data.t2) || 0;
      const q1 = parseFloat(data.q1) || 0;
      const q2 = parseFloat(data.q2) || 0;
      return (t1 + t2) * 0.4 + q1 + q2 + lab + el;
    }
    default:
      return 0;
  }
};

// Calculate final grade
export const calculateGrade = (cie, see) => {
  const total = (cie + see) / 2;
  const gradePoint = Math.min(10, Math.max(0, Math.floor(total / 10) + 1));
  return {
    gradePoint,
    total,
    gradeLetter: getGradeLetter(gradePoint)
  };
};

// Calculate SGPA for a set of subjects
export const calculateSGPA = (subjects, grades) => {
  let totalCredits = 0;
  let weightedSum = 0;

  subjects.forEach(subject => {
    const grade = grades[subject.id];
    if (grade && grade.gradePoint !== undefined) {
      totalCredits += subject.Credit;
      weightedSum += grade.gradePoint * subject.Credit;
    }
  });

  return totalCredits > 0 ? (weightedSum / totalCredits).toFixed(2) : '0.00';
};

// Calculate CGPA from SGPA values
export const calculateCGPA = (sgpaValues, credits) => {
  const sgpaArray = Object.values(sgpaValues).map(v => parseFloat(v) || 0);
  const creditArray = Object.values(credits);

  let totalCredits = 0;
  let weightedSum = 0;

  sgpaArray.forEach((sgpa, index) => {
    if (sgpa > 0) {
      const credit = creditArray[index] || 0;
      totalCredits += credit;
      weightedSum += sgpa * credit;
    }
  });

  return totalCredits > 0 ? (weightedSum / totalCredits).toFixed(2) : '0.00';
};

// Calculate SEE required for target grade
export const calculateSEERequired = (cieTotal, targetGrade) => {
  // Formula: (targetGrade - 1) * 10 = (CIE + SEE) / 2
  // So: SEE = (targetGrade - 1) * 20 - CIE
  return (targetGrade - 1) * 20 - cieTotal;
};

// Get max value for input field
export const getMaxValue = (field, subjectType) => {
  switch (field) {
    case 'q1':
    case 'q2':
      // 50-mark courses have quiz max of 5 each
      if (subjectType === '50-mark') return 5;
      return 10; // Regular quiz max: 10 marks
    case 't1':
    case 't2':
      // 50-mark courses have test max of 25 each
      if (subjectType === '50-mark') return 25;
      return 50; // Regular test max: 50 marks
    case 'matlab':
      return 20; // MATLAB max: 20 marks
    case 'lab':
      // Lab max depends on subject type
      if (subjectType === 'dsa-lab' || subjectType === 'ece-lab') return 50; // DSA/OS/ECE Lab: 50 marks
      return 30; // Chemistry lab: 30 marks
    case 'el':
      // EL max depends on subject type
      if (subjectType === 'math') return 20;
      if (subjectType === 'lab') return 30;
      if (subjectType === '50-mark') return 20; // 50-mark courses: 20 marks EL
      return 40; // Regular subjects, dsa-lab, and ece-lab: 40 marks
    case 'labSee':
      return 50; // Lab SEE max: 50 marks (for dsa-lab and ece-lab subjects)
    case 'see':
      // SEE max depends on subject type
      if (subjectType === '50-mark') return 50; // 50-mark courses: 50 marks SEE
      return 100; // Regular subjects: 100 marks SEE
    default:
      return 100; // Default max
  }
};

