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
    <div className="glass-dark flex items-center justify-center z-[9999] p-4 animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', margin: 'calc(-1 * env(safe-area-inset-top)) calc(-1 * env(safe-area-inset-right)) calc(-1 * env(safe-area-inset-bottom)) calc(-1 * env(safe-area-inset-left))' }} onClick={onClose}>
      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-apple-xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">SGPA Results</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
            aria-label="Close"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
          </button>
        </div>

        <div className="text-center mb-3 sm:mb-4">
          <div className="text-base sm:text-lg font-semibold text-gray-700 mb-2">{cycleName}</div>
          <div className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">{sgpa}</div>
          <div className="text-gray-600 text-base sm:text-lg">SGPA out of 10</div>
        </div>

        <button
          onClick={copyToClipboard}
          className={`w-full py-3 px-4 rounded-xl font-medium transition-all active:scale-98 ${copied
            ? 'bg-green-100 text-green-800 border border-green-200'
            : 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl'
            }`}
        >
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
      </div>
    </div>
  );
};

export default SGPAResultsPopup;
