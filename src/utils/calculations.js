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

  const quizMarks = (q1 + q2) / 2;  // Average of two quizzes
  const testMarks = (t1 + t2) / 2;  // Average of two tests

  switch (subjectType) {
    case 'math': {
      const matlab = parseFloat(data.matlab) || 0;
      const el = parseFloat(data.el) || 0;
      return quizMarks + testMarks + matlab + el;
    }
    case 'lab': {
      // Year 1 lab subjects (Physics, Chemistry, PLC, Core): 
      // Quiz 1 (10) + Quiz 2 (10) + Test 1 (50) + Test 2 (50) = 120, reduced to 40
      // Lab (30) + EL (30) = 60
      // Total CIE = 40 + 30 + 30 = 100
      const lab = parseFloat(data.lab) || 0;
      const el = parseFloat(data.el) || 0;
      const q1 = parseFloat(data.q1) || 0;
      const q2 = parseFloat(data.q2) || 0;
      const t1 = parseFloat(data.t1) || 0;
      const t2 = parseFloat(data.t2) || 0;
      const quizTestTotal = q1 + q2 + t1 + t2; // Max: 120
      const reducedMarks = (quizTestTotal / 120) * 40; // Reduce to 40
      return reducedMarks + lab + el; // 40 + 30 + 30 = 100
    }
    case 'regular': {
      const el = parseFloat(data.el) || 0;
      return quizMarks + testMarks + el;
    }
    case 'basket': {
      // Basket Course: Quiz + Test → reduced to 60, EL (20) + Basket EL (20) = 40
      // Total CIE = 60 + 20 + 20 = 100
      const el = parseFloat(data.el) || 0;
      const basketEl = parseFloat(data.basketEl) || 0;
      const q1 = parseFloat(data.q1) || 0;
      const q2 = parseFloat(data.q2) || 0;
      const t1 = parseFloat(data.t1) || 0;
      const t2 = parseFloat(data.t2) || 0;
      const quizTestTotal = q1 + q2 + t1 + t2; // Max: 120
      const reducedMarks = (quizTestTotal / 120) * 60; // Reduce to 60
      return reducedMarks + el + basketEl; // 60 + 20 + 20 = 100
    }
    case 'dsa-lab':
    case 'ece-lab': {
      // DSA/OS/ECE Lab: Quiz 1, Quiz 2 (10 each), Test 1, Test 2 (50 each), Lab (50), EL (40)
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
    case '50-mark': {
      // 50-mark courses: Quiz 1, Quiz 2 (5 each = 10 total), Test 1, Test 2 (25 each = 50 total, reduced to 20), EL (20)
      // CIE Total: 50 = quiz1 + quiz2 + (test1 + test2) / 50 * 20 + EL
      // = 5 + 5 + (25 + 25) / 50 * 20 + 20 = 10 + 20 + 20 = 50
      const el = parseFloat(data.el) || 0;
      const t1 = parseFloat(data.t1) || 0;
      const t2 = parseFloat(data.t2) || 0;
      const q1 = parseFloat(data.q1) || 0;
      const q2 = parseFloat(data.q2) || 0;
      return q1 + q2 + ((t1 + t2) / 50 * 20) + el;
    }
    default:
      return 0;
  }
};

// Calculate final grade
export const calculateGrade = (cie, see) => {
  const total = Math.ceil(((cie + see) / 2) - 0.00001);
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

  if (totalCredits === 0) return '0.00';
  const sgpa = weightedSum / totalCredits;
  return (Math.ceil(sgpa * 100 - 0.00001) / 100).toFixed(2);
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

  if (totalCredits === 0) return '0.00';
  const cgpa = weightedSum / totalCredits;
  return (Math.ceil(cgpa * 100 - 0.00001) / 100).toFixed(2);
};

// Calculate SEE required for target grade
export const calculateSEERequired = (cieTotal, targetGrade) => {
  // Formula: Math.ceil((CIE + SEE) / 2) >= (targetGrade - 1) * 10
  // So: (CIE + SEE) / 2 > (targetGrade - 1) * 10 - 1
  // SEE > (targetGrade - 1) * 20 - 2 - CIE
  // Wait, no. If target is 90, we need (CIE+SEE)/2 > 89.0
  // So CIE + SEE > 178. So CIE + SEE >= 179.
  // SEE >= 179 - CIE.
  // Normal was 180 - CIE. So it is (targetGrade - 1) * 20 - 1 - CIE.
  return (targetGrade - 1) * 20 - 1 - cieTotal;
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
      if (subjectType === 'basket') return 20; // Basket courses: 20 marks EL
      return 40; // Regular subjects, dsa-lab, and ece-lab: 40 marks
    case 'basketEl':
      return 20; // Basket EL: 20 marks
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

