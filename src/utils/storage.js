// Local storage keys
export const STORAGE_KEYS = {
  FORM_DATA: 'rvce_calculator_form_data',
  SGPA_VALUES: 'rvce_calculator_sgpa_values',
  FINAL_CGPA_GRADES: 'rvce_calculator_final_cgpa_grades',
  CURRENT_MODE: 'rvce_calculator_current_mode',
  CURRENT_CYCLE: 'rvce_calculator_current_cycle',
  FIRST_YEAR_CGPA: 'rvce_calculator_first_year_cgpa'
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
