/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.html",
    "./public/**/*.js"
  ],
  theme: {
    extend: {
      clipPath: {
         // Ваша старая кривая
        'ellipse-top': 'ellipse(100% 70% at 50% 30%)', // <-- ДОБАВЬТЕ ЭТУ СТРОКУ
      },
      fontFamily: {
        'mono': ['"Space Mono"', 'monospace'],
        'chakra': ['"Chakra Petch"', 'sans-serif'],
        'roboto': ['"Roboto"', 'sans-serif'],
      },
      colors: {
        'brand-purple': '#2F2050',
        'brand-blue': '#25316C',
        'brand-cyan': '#0CBAF1',
        'brand-pink': '#E95CE9',
        'light-blue': '#2CC3E9',
        'bg-light': '#F9F6FA',
        'text-main': '#2F2050',
        'pink-text': '#F2DEDE',
        'bg-main': '#F2DEDE'
      },
      fontSize: {
        // ====== Heading text style ======
        'h1': ['64px', { lineHeight: '70px', fontWeight: '600' }], // SB
        'h2': ['48px', { lineHeight: '58px', fontWeight: '600' }],
        'h3': ['40px', { lineHeight: '54px', fontWeight: '600' }],
        'h4': ['36px', { lineHeight: '44px', fontWeight: '500' }], // M
        'h5': ['32px', { lineHeight: 'auto', fontWeight: '600' }],
        'h6': ['28px', { lineHeight: 'auto', fontWeight: '600' }],
        'h7': ['20px', { lineHeight: 'auto', fontWeight: '400' }],
        'h8': ['20px', { lineHeight: 'auto', fontWeight: '500' }],
        'h9': ['18px', { lineHeight: 'auto', fontWeight: '400' }],
        'h10': ['16px', { lineHeight: '28px', fontWeight: '600' }],
        'h11': ['16px', { lineHeight: 'auto', fontWeight: '600' }],
        'h12': ['14px', { lineHeight: 'auto', fontWeight: '400' }],

        // ====== Body text style ======
        'body1': ['16px', { lineHeight: '28px', fontWeight: '300' }], // L
        'body2': ['14px', { lineHeight: '28px', fontWeight: '400' }],
        'body3': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body4': ['12px', { lineHeight: '20px', fontWeight: '400' }],

        // ====== Caption text style ======
        'caption1': ['16px', { lineHeight: 'auto', fontWeight: '500' }],
        'caption2': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'caption3': ['12px', { lineHeight: '14px', fontWeight: '500' }],

        // ====== Button text style ======
        'button1': ['14px', { lineHeight: '14px', fontWeight: '700' }],
        'button2': ['16px', { lineHeight: '28px', fontWeight: '300' }],
      },
    },
  },
  plugins: [],
}