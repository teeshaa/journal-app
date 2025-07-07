import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Custom warm color palette for tech leaders
        warm: {
          50: '#fef9f5',
          100: '#fef3ea',
          200: '#fce2ca',
          300: '#f9caa6',
          400: '#f5a670',
          500: '#f08847',
          600: '#e26f28',
          700: '#bf5a1d',
          800: '#984a1b',
          900: '#7a3e1a',
        },
        sage: {
          50: '#f7f9f7',
          100: '#eef3ef',
          200: '#dce7dd',
          300: '#c4d6c6',
          400: '#a8bfab',
          500: '#8da691',
          600: '#6f8572',
          700: '#5a6b5d',
          800: '#4a564c',
          900: '#3e4740',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config; 