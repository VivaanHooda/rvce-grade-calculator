import React, { useEffect, useRef, useState } from 'react';

const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);
const lerp = (a, b, t) => a + (b - a) * t;

/**
 * Apple-style "Liquid Glass" surface.
 *
 * Layer order (back -> front):
 *   .lg-refraction  — backdrop-filter blur+saturate + SVG displacement map.
 *                     Kept OUTSIDE the tilt wrapper on purpose: transform /
 *                     isolation / contain all create a "backdrop root", which
 *                     would stop backdrop-filter from sampling the page behind
 *                     the card. So refraction stays flat and samples the real
 *                     ambient background; everything else tilts on top.
 *   .lg-tilt        — 3D parallax wrapper (rotateX/Y toward the cursor).
 *     .lg-tint      — frosted milky body.
 *     .lg-specular  — moving light reflection (follows the lens).
 *     .lg-edge      — refractive rim / glass thickness.
 *     .lg-content   — the children.
 *     .lg-lens      — the "liquid" cursor that trails the pointer with damping.
 *
 * Interactive lens + tilt + cursor-hiding only run on hover/fine pointers
 * (laptops) and respect prefers-reduced-motion. Everything pointer-driven
 * happens in a single rAF loop that cancels itself when idle.
 */
const LiquidGlassCard = ({ children, className = '', contentClassName = '', href }) => {
  const cardRef = useRef(null);
  const rafRef = useRef(null);
  const s = useRef({
    tx: 0.5, ty: 0.5,   // pointer target (0..1 within card)
    lx: 0.5, ly: 0.5,   // lens (slow lerp)
    sx: 0.3, sy: 0.18,  // specular (faster lerp)
    rx: 0, ry: 0,       // tilt (slowest)
    w: 0, h: 0, left: 0, top: 0,
    hovering: false,
  }).current;

  const [interactive, setInteractive] = useState(false);
  const [animateTurb, setAnimateTurb] = useState(false);

  // Decide capabilities (hover/fine pointer + motion preference).
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const hoverFine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      const on = hoverFine.matches && !reduce.matches;
      setInteractive(on);
      setAnimateTurb(on);
    };
    update();
    hoverFine.addEventListener('change', update);
    reduce.addEventListener('change', update);
    return () => {
      hoverFine.removeEventListener('change', update);
      reduce.removeEventListener('change', update);
    };
  }, []);

  // Pointer / lens / tilt loop.
  useEffect(() => {
    const card = cardRef.current;
    if (!card || !interactive) return;

    const MAX_TILT = 7; // degrees

    const writeVars = () => {
      card.style.setProperty('--mx', `${(s.sx * 100).toFixed(2)}%`);
      card.style.setProperty('--my', `${(s.sy * 100).toFixed(2)}%`);
      card.style.setProperty('--lx', `${(s.lx * s.w).toFixed(2)}px`);
      card.style.setProperty('--ly', `${(s.ly * s.h).toFixed(2)}px`);
      card.style.setProperty('--rx', `${s.rx.toFixed(3)}deg`);
      card.style.setProperty('--ry', `${s.ry.toFixed(3)}deg`);
    };

    const tick = () => {
      s.lx = lerp(s.lx, s.tx, 0.12); // lens lags -> viscosity
      s.ly = lerp(s.ly, s.ty, 0.12);
      s.sx = lerp(s.sx, s.tx, 0.20); // light follows a touch quicker
      s.sy = lerp(s.sy, s.ty, 0.20);

      const ryTarget = s.hovering ? (s.tx - 0.5) * 2 * MAX_TILT : 0;
      const rxTarget = s.hovering ? -(s.ty - 0.5) * 2 * MAX_TILT : 0;
      s.ry = lerp(s.ry, ryTarget, 0.08);
      s.rx = lerp(s.rx, rxTarget, 0.08);

      writeVars();

      const settled = !s.hovering && Math.abs(s.rx) < 0.02 && Math.abs(s.ry) < 0.02;
      if (settled) {
        rafRef.current = null;
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    const ensureLoop = () => {
      if (rafRef.current == null) rafRef.current = requestAnimationFrame(tick);
    };

    const measure = () => {
      const r = card.getBoundingClientRect();
      s.w = r.width; s.h = r.height; s.left = r.left; s.top = r.top;
    };

    const setTargetFromEvent = (e) => {
      s.tx = clamp01((e.clientX - s.left) / s.w);
      s.ty = clamp01((e.clientY - s.top) / s.h);
    };

    const onEnter = (e) => {
      measure();
      s.hovering = true;
      setTargetFromEvent(e);
      card.classList.add('lg-active');
      ensureLoop();
    };
    const onMove = (e) => {
      measure();
      setTargetFromEvent(e);
      ensureLoop();
    };
    const onLeave = () => {
      s.hovering = false;
      card.classList.remove('lg-active');
      ensureLoop(); // run until tilt eases back to rest
    };

    card.addEventListener('pointerenter', onEnter);
    card.addEventListener('pointermove', onMove);
    card.addEventListener('pointerleave', onLeave);
    window.addEventListener('resize', measure);

    return () => {
      card.removeEventListener('pointerenter', onEnter);
      card.removeEventListener('pointermove', onMove);
      card.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', measure);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      card.classList.remove('lg-active');
    };
  }, [interactive, s]);

  const openHref = () => {
    if (href) window.open(href, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      ref={cardRef}
      className={`liquid-glass ${interactive ? 'lg-interactive' : ''} ${href ? 'lg-link' : ''} ${className}`}
      onClick={href ? openHref : undefined}
      role={href ? 'link' : undefined}
      tabIndex={href ? 0 : undefined}
      onKeyDown={href ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openHref(); } } : undefined}
    >
      {/* Hidden displacement filter (single instance) */}
      <svg className="lg-defs" aria-hidden="true" focusable="false" width="0" height="0">
        <filter id="liquid-displacement" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.012" numOctaves="2" seed="7" stitchTiles="stitch" result="noise">
            {animateTurb && (
              <animate
                attributeName="baseFrequency"
                dur="18s"
                values="0.008 0.012;0.011 0.009;0.008 0.012"
                repeatCount="indefinite"
              />
            )}
          </feTurbulence>
          <feGaussianBlur in="noise" stdDeviation="1.4" result="soft" />
          <feDisplacementMap in="SourceGraphic" in2="soft" scale="36" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <div className="lg-refraction" />

      <div className="lg-tilt">
        <div className="lg-tint" />
        <div className="lg-specular" />
        <div className="lg-edge" />
        <div className={`lg-content ${contentClassName}`}>{children}</div>
        <div className="lg-lens" />
      </div>
    </div>
  );
};

export default LiquidGlassCard;
