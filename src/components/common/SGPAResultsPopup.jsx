import React, { useState } from 'react';
import { X } from 'lucide-react';

const SGPAResultsPopup = ({ isOpen, onClose, sgpa, cycleName }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = () => {
    const text = `${cycleName} SGPA: ${sgpa}/10`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">SGPA Results</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        
        <div className="text-center mb-4">
          <div className="text-lg font-semibold text-gray-700 mb-2">{cycleName}</div>
          <div className="text-5xl font-bold text-gray-900 mb-2">{sgpa}</div>
          <div className="text-gray-600 text-lg">SGPA out of 10</div>
        </div>

        <button
          onClick={copyToClipboard}
          className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
            copied 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
        >
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
      </div>
    </div>
  );
};

export default SGPAResultsPopup;
