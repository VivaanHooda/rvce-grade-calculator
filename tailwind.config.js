export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Apple-inspired color palette
      colors: {
        // Semantic brand color — one blue, used for all "primary" intent.
        brand: {
          DEFAULT: '#2563eb',
          hover: '#1d4ed8',
          soft: '#eff6ff',
          ring: '#3b82f6',
        },
        // Semantic neutrals so components stop hand-picking grays.
        ink: {
          DEFAULT: '#111827',
          muted: '#6b7280',
          subtle: '#9ca3af',
        },
        hairline: '#e5e7eb',
        apple: {
          blue: '#007AFF',
          green: '#34C759',
          indigo: '#5856D6',
          orange: '#FF9500',
          pink: '#FF2D55',
          purple: '#AF52DE',
          red: '#FF3B30',
          teal: '#5AC8FA',
          yellow: '#FFCC00',
        },
      },
      // Custom spacing for mobile optimization
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      // Apple-style border radius — semantic aliases for consistent intent.
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        'control': '0.75rem', // inputs, small buttons
        'card': '1.25rem',    // cards, popups
        'panel': '1.5rem',    // large panels, modals
      },
      // Enhanced shadows for depth. Semantic names map onto the apple-* scale.
      boxShadow: {
        'apple-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'apple': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'apple-md': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'apple-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        'apple-xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        // Semantic intent shadows (single source of truth for component depth).
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
        'float': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      // Custom animations
      animation: {
        'fade-in': 'fade-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'spring-in': 'spring-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      // Z-index scale — replaces ad-hoc z-[9999] magic numbers.
      zIndex: {
        'base': '10',
        'dropdown': '30',
        'overlay': '40',
        'modal': '50',
      },
      // Custom transition timing
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'apple-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      // Backdrop blur for glassmorphism
      backdropBlur: {
        'apple': '10px',
      },
    },
  },
  plugins: [],
}
