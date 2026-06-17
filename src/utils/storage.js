// Local storage keys
export const STORAGE_KEYS = {
  FORM_DATA: 'rvce_calculator_form_data',
  SGPA_VALUES: 'rvce_calculator_sgpa_values',
  FINAL_CGPA_GRADES: 'rvce_calculator_final_cgpa_grades',
  CURRENT_MODE: 'rvce_calculator_current_mode',
  CURRENT_CYCLE: 'rvce_calculator_current_cycle',
  FIRST_YEAR_CGPA: 'rvce_calculator_first_year_cgpa',
  CURRENT_YEAR: 'rvce_calculator_current_year',
  CURRENT_SEMESTER: 'rvce_calculator_current_semester',
  CURRENT_BRANCH: 'rvce_calculator_current_branch',
  SUBJECT_GRADES: 'rvce_calculator_subject_grades',
  YEAR1_GRADES: 'rvce_calculator_year1_grades',
  SEM3_GRADES: 'rvce_calculator_sem3_grades',
  SEM3_SGPA: 'rvce_calculator_sem3_sgpa',
  CGPA_UPTO_SEM3: 'rvce_calculator_cgpa_upto_sem3',
  SEM4_GRADES: 'rvce_calculator_sem4_grades',
  FORM_DATA_SEM6: 'rvce_calculator_form_data_sem6',
  SUBJECT_GRADES_SEM6: 'rvce_calculator_subject_grades_sem6',
  SEM6_GRADES: 'rvce_calculator_sem6_grades'
};

// Helper functions for localStorage
export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

export const loadFromStorage = (key, defaultValue = {}) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

export const clearAllStorage = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
  }
};
