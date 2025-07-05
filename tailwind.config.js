/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        'work-sans': ['Work Sans', ' sans-serif'],
        'courier-new': ['Courier Prime', 'monospace'],
        inconsolata: ['Inconsolata', 'monospace'],
        inter: ['Inter', 'sans-serif'],
        Integral: ['Integral', 'sans-serif'],
      },
      colors: {
        'dt-blue': '#0A192F',
        'dt-green': '#58E2C5',
        'dt-lavender': '#CCD6F6',
        'dt-white': '#FFFFFF',
        'lt-blue': '#0A192F',
        'lt-green': '#348573',
        'lt-white': '#FFFFFF',
        'lt-alice-blue': '#F3F5FD',
        'lt-black': '#000000',
        'lt-cadet-blue': '#ACB3BF',
        'dt-input-bg': '#C9D0DC',
        'red-error': '#FF4040',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        meteor: {
          '0%': { transform: 'rotate(215deg) translateX(0)', opacity: '1' },
          '70%': { opacity: '1' },
          '100%': {
            transform: 'rotate(215deg) translateX(-500px)',
            opacity: '0',
          },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'meteor-effect': 'meteor 5s linear infinite',
      },
      boxShadow: {
        'lt-glowing-shadow': '0px 0px 40px 6px rgba(88, 226, 197, 0.25)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

module.exports = config;
