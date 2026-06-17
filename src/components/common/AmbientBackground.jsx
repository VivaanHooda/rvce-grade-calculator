import React from 'react';

/**
 * Apple-style ambient background. Calm, neutral, layered depth — no colour
 * wash (that read as "vibey"). Just soft light and a whisper of texture:
 *   1. soft neutral gradient surface (lighter at top, settling to gray)
 *   2. a gentle white highlight from the top to lift the hero
 *   3. a whisper-faint static grid, masked to fade out behind content
 *   4. the faintest neutral depth in the lower corners
 *
 * Purely decorative, non-interactive, and fully static — nothing moves.
 */
const AmbientBackground = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Base surface — neutral, lighter at the top */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-gray-100" />

      {/* Soft white highlight from the top — gentle, colourless depth */}
      <div className="absolute inset-x-0 top-0 h-[55vh] bg-[radial-gradient(ellipse_70%_100%_at_50%_0%,rgba(255,255,255,0.85),transparent_72%)]" />

      {/* Whisper grid texture (static, edge-masked) */}
      <div className="absolute inset-0 ambient-grid" />

      {/* Faintest neutral depth, lower corners */}
      <div className="absolute bottom-0 inset-x-0 h-[45vh] bg-[radial-gradient(ellipse_90%_70%_at_50%_120%,rgba(17,24,39,0.04),transparent_70%)]" />
    </div>
  );
};

export default AmbientBackground;
