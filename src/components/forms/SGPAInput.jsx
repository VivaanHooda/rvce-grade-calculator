import React from 'react';

const SGPAInput = ({ cycle, onChange, isPhysics, defaultValue, validationMessage }) => {
  const borderColor = isPhysics ? 'border-blue-300' : 'border-green-300';
  const focusRing = isPhysics ? 'focus:ring-blue-500 focus:border-blue-500' : 'focus:ring-green-500 focus:border-green-500';
  
  return (
    <div className="relative">
      <input
        type="text"
        defaultValue={defaultValue}
        onChange={(e) => onChange(cycle, e.target.value, e.target)}
        placeholder="Enter SGPA (0-10)"
        className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 ${focusRing} outline-none bg-white text-gray-900`}
      />
      {validationMessage.show && validationMessage.cycle === cycle && (
        <div className="absolute top-full left-0 mt-1 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm shadow-lg z-10 animate-fade-in">
          {validationMessage.message}
        </div>
      )}
    </div>
  );
};

export default SGPAInput;
