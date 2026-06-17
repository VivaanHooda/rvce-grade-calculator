import React, { useState } from 'react';
import { X } from 'lucide-react';

const CGPAResultsPopup = ({ isOpen, onClose, cgpa }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = () => {
    const text = `Final CGPA: ${cgpa}/10`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-center p-4 modal-backdrop glass-dark z-modal animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-md p-6 bg-white rounded-panel sm:p-8 shadow-modal animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-xl font-bold sm:text-2xl text-ink">CGPA Results</h3>
          <button
            onClick={onClose}
            className="p-2 transition-colors rounded-full hover:bg-gray-100 active:scale-[0.98]"
            aria-label="Close"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-ink-muted" />
          </button>
        </div>

        <div className="mb-6 text-center sm:mb-8">
          <div className="mb-2 text-4xl font-bold tracking-tight sm:text-5xl text-ink">{cgpa}</div>
          <div className="text-base text-ink-muted sm:text-lg">Final CGPA out of 10</div>
        </div>

        <button
          onClick={copyToClipboard}
          className={`w-full py-3 px-4 rounded-control font-medium transition-all active:scale-[0.98] ${copied
            ? 'bg-green-100 text-green-800 border border-green-200'
            : 'bg-gray-900 text-white hover:bg-gray-800 shadow-float hover:shadow-card-hover'
            }`}
        >
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
      </div>
    </div>
  );
};

export default CGPAResultsPopup;
