import type { Config } from 'tailwindcss';
import tokens from '@digital-go-jp/design-tokens';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // breakpoints
    screens: {
      // => @media (max-width: 600px) { ... }
      // 画面サイズが600px以下に適用
      xs: { max: '600px' },
      // => @media (min-width:601px) and ( max-width:768px) { ... }
      // 画面サイズが601px以上768px以下に適用
      s: { min: '601px', max: '768px' },
      // => @media (min-width:769px) and ( max-width:1280px) { ... }
      // 画面サイズが601px以上768px以下に適用
      m: { min: '769px', max: '1280px' },
      // => @media (min-width: 1280px) { ... }
      // 画面サイズが1281px以上に適用
      l: '1281px',
    },
    extend: {
      // Colors
      colors: {
        // メインカラー
        main: {
          50: tokens.Color.Primitive.Sea[50].value,
          800: tokens.Color.Primitive.Sea[800].value,
          900: tokens.Color.Primitive.Sea[900].value,
          1000: tokens.Color.Primitive.Sea[1000].value,
        },
        blue: {
          50: tokens.Color.Primitive.Blue[50].value,
          600: tokens.Color.Primitive.Blue[600].value,
          800: tokens.Color.Primitive.Blue[800].value,
          900: tokens.Color.Primitive.Blue[900].value,
          1000: tokens.Color.Primitive.Blue[1000].value,
        },
        sumi: {
          500: tokens.Color.Primitive.Sumi[500].value,
          600: tokens.Color.Primitive.Sumi[600].value,
          700: tokens.Color.Primitive.Sumi[700].value,
          900: tokens.Color.Primitive.Sumi[900].value,
        },
        grey: {
          200: tokens.Color.Neutral.SolidGrey[200].value,
        },
        error: {
          800: tokens.Color.Primitive.Sun[800].value,
        },
        white: tokens.Color.Neutral.White.value,
      },
      // Typography
      fontSize: {
        // 見出しM（BOLD)
        'heading-m-bold': [
          '32px',
          {
            fontWeight: tokens.FontWeight['700'].value,
            lineHeight: tokens.LineHeight['1_7'].value,
          },
        ],
        // 見出しXXS (BOLD)
        'heading-xxs-bold': [
          tokens.FontSize['20'].value,
          {
            fontWeight: tokens.FontWeight['700'].value,
            lineHeight: tokens.LineHeight['1_5'].value,
          },
        ],
        // 見出しXXS
        'heading-xxs': [
          tokens.FontSize['20'].value,
          {
            fontWeight: tokens.FontWeight['400'].value,
            lineHeight: tokens.LineHeight['1_5'].value,
          },
        ],
        // 本文L
        'text-l': [
          '16px',
          {
            fontWeight: tokens.FontWeight['400'].value,
            lineHeight: tokens.LineHeight['1_7'].value,
          },
        ],
        // 本文M
        'text-m': [
          '14px',
          {
            fontWeight: tokens.FontWeight['400'].value,
            lineHeight: tokens.LineHeight['1_7'].value,
          },
        ],
        // ボタン
        button: [
          '14px',
          {
            fontWeight: tokens.FontWeight['700'].value,
            lineHeight: tokens.LineHeight['1_5'].value,
          },
        ],
      },
      // Sizing
      // marginやpaddingなどで利用する余白
      spacing: {
        'spacing-unit-1': '8px',
        'spacing-unit-2': '16px',
        'spacing-unit-3': '24px',
        'spacing-unit-4': '40px',
        'l-mx': '80px',
        'm-mx': '80px',
        's-mx': '16px',
        'xs-mx': '16px',
        'file-items-x': '32px',
        'file-select-pt': '72px',
        'file-select-pb': '40px',
        'input-mb': '40px',
        'input-mt': '40px',
      },
      minWidth: {
        'button-min-w': '197px',
      },
      width: {
        'contents-w': '736px',
        'selected-file': '148px',
        'cancel-button': '160px',
        'geocoding-button': '240px',
        'save-file-button': '182px',
      },
      minHeight: {
        'oneline-input-min-h': '56px',
        'file-description-h': '240px',
      },
      height: {
        'button-h': '56px',
        'file-input-h': '320px',
        'file-items-h': '56px',
        'file-description-h': '72px',
      },
      borderWidth: {
        'description-box': '3px',
      },
      borderRadius: {
        button: tokens.BorderRadius[8].value,
      },
    },
  },
  plugins: [],
};
export default config;
