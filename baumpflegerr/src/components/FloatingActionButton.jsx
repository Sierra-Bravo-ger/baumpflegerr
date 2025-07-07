import React from 'react';

/**
 * Floating Action Button (FAB) im Material Design-Stil
 * @param {Object} props - Komponenten-Props
 * @param {Function} props.onClick - Klick-Handler für den Button
 * @param {string} props.icon - Icon-SVG-Pfad für den Button
 * @param {string} props.label - Barrierefreier Label-Text für den Button
 */
const FloatingActionButton = ({ onClick, icon, label }) => {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="fixed bottom-6 right-6 w-14 h-14 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 flex items-center justify-center z-50 transition-transform hover:scale-105"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
      </svg>
    </button>
  );
};

export default FloatingActionButton;
