/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: '#0A0D12',
          panel: '#12161F',
          raised: '#181D28',
          line: '#242B39',
        },
        ink: {
          DEFAULT: '#E7EAF0',
          muted: '#8892A6',
          dim: '#5B6478',
        },
        amber: {
          DEFAULT: '#FFB020',
          dim: '#B87F1A',
        },
        cyan: {
          DEFAULT: '#4FD1C5',
          dim: '#2F8A80',
        },
        alert: {
          DEFAULT: '#FF5C5C',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(231,234,240,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(231,234,240,0.04) 1px, transparent 1px)',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(0%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.25 },
        },
        fadein: {
          '0%': { opacity: 0, transform: 'scale(0.96)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        rise: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        scan: 'scan 3.6s linear infinite',
        blink: 'blink 1.6s ease-in-out infinite',
        fadein: 'fadein 0.6s ease-out forwards',
        rise: 'rise 0.6s ease-out forwards',
      },
    },
  },
  plugins: [],
}
