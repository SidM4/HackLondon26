/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'slate-blue': '#2C3E50',
        'copper': '#D35400',
        'copper-hover': '#E67E22',
        'blueprint-teal': '#1ABC9C',
      },
      fontFamily: {
        sans: ['var(--font-roboto)', 'system-ui', 'sans-serif'],
        display: ['var(--font-roboto)', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        thin: '200',
        extralight: '200',
        light: '300',
      },
      lineHeight: {
        'display': '0.92',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'scale-in': 'scaleIn 0.4s ease-out forwards',
        'count-up': 'countUp 1s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(44, 62, 80, 0.04), 0 4px 16px rgba(44, 62, 80, 0.06)',
        'card-hover': '0 4px 12px rgba(44, 62, 80, 0.08), 0 16px 40px rgba(44, 62, 80, 0.12)',
        'stat': '0 2px 8px rgba(44, 62, 80, 0.04)',
        'glow-teal': '0 0 40px -10px rgba(26, 188, 156, 0.3)',
        'glow-copper': '0 0 40px -10px rgba(211, 84, 0, 0.3)',
      },
      transitionTimingFunction: {
        'elastic': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
    },
  },
  plugins: [],
}
