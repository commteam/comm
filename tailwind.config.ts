import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Segoe UI"', '"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"Cascadia Code"', '"Fira Code"', 'monospace'],
      },
      colors: {
        // Fluent Design system colors
        fluent: {
          // Accent
          accent: {
            DEFAULT: '#0078D4',
            light: '#2899F5',
            dark: '#005A9E',
            subtle: '#EBF3FB',
          },
          // Neutrals
          neutral: {
            0: '#FFFFFF',
            10: '#F9F9F9',
            20: '#F3F3F3',
            30: '#EDEDED',
            40: '#E6E6E6',
            50: '#DEDEDE',
            60: '#C7C7C7',
            70: '#B0B0B0',
            80: '#9A9A9A',
            90: '#838383',
            100: '#6D6D6D',
            110: '#575757',
            120: '#404040',
            130: '#2A2A2A',
            140: '#141414',
            150: '#000000',
          },
          // Semantic
          success: '#107C10',
          warning: '#797673',
          error: '#C50F1F',
          info: '#0078D4',
        },
      },
      borderRadius: {
        'fluent-sm': '4px',
        'fluent': '8px',
        'fluent-lg': '12px',
        'fluent-xl': '16px',
      },
      boxShadow: {
        'fluent-2': '0px 1px 2px rgba(0, 0, 0, 0.14), 0px 0px 2px rgba(0, 0, 0, 0.12)',
        'fluent-4': '0px 2px 4px rgba(0, 0, 0, 0.14), 0px 0px 2px rgba(0, 0, 0, 0.12)',
        'fluent-8': '0px 4px 8px rgba(0, 0, 0, 0.14), 0px 0px 2px rgba(0, 0, 0, 0.12)',
        'fluent-16': '0px 8px 16px rgba(0, 0, 0, 0.14), 0px 0px 2px rgba(0, 0, 0, 0.12)',
        'fluent-28': '0px 14px 28px rgba(0, 0, 0, 0.24), 0px 0px 8px rgba(0, 0, 0, 0.22)',
        'fluent-64': '0px 32px 64px rgba(0, 0, 0, 0.24), 0px 0px 8px rgba(0, 0, 0, 0.22)',
      },
      backdropBlur: {
        'fluent': '60px',
        'fluent-sm': '30px',
      },
      animation: {
        'fade-in': 'fadeIn 150ms ease-out',
        'fade-out': 'fadeOut 100ms ease-in',
        'slide-up': 'slideUp 200ms ease-out',
        'slide-down': 'slideDown 200ms ease-out',
        'scale-in': 'scaleIn 150ms ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}

export default config
