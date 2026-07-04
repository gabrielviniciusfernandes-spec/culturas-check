/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0F2A38',
        teal: {
          DEFAULT: '#2E6E85',
          50: '#EEF5F7',
          100: '#D9E9EE',
          200: '#B3D3DD',
          300: '#82B4C4',
          400: '#528EA2',
          500: '#2E6E85',
          600: '#25596C',
          700: '#1D4553',
          800: '#15323C',
          900: '#0D1F25',
        },
        amber: {
          DEFAULT: '#E08E45',
          50: '#FDF4EC',
          100: '#FAE6D2',
          200: '#F4CBA4',
          300: '#EEB077',
          400: '#E89F5C',
          500: '#E08E45',
          600: '#C97530',
          700: '#A05D26',
          800: '#78451C',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15,42,56,0.04), 0 8px 24px rgba(15,42,56,0.08)',
        card: '0 1px 3px rgba(15,42,56,0.06), 0 12px 32px rgba(15,42,56,0.10)',
        glow: '0 0 0 1px rgba(255,255,255,0.6) inset',
      },
      borderRadius: {
        xl2: '1.25rem',
        xl3: '1.75rem',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
