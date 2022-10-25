const lessToJs = require('less-vars-to-js')
const fs = require('fs')
const path = require('path')

const paletteLess = fs.readFileSync(path.resolve(__dirname, './src/styles/var.less'), 'utf8')
const palette = lessToJs(paletteLess, {
  resolveVariables: true,
  stripPrefix: true
})

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: {
    files: [
      './src/pages/**/*.{html,js,ts,jsx,tsx}',
      './src/components/**/*.{html,js,ts,jsx,tsx}',
      './src/index.html',
      './src/main.tsx'
    ]
  },
  theme: {
    extend: {
      width: {
        page_content: '1190px'
      },
      height: {
        header: '34px',
        footer: '131px'
      },
      colors: {
        //主色调
        c_primary: palette.c_primary,
        c_primary_light: palette.c_primary_light,
        c_primary_1: palette.c_primary_1,
        c_primary_2: palette.c_primary_2,
        c_success: palette.c_success,
        c_info: palette.c_info,
        c_error: palette.c_error,
        c_warning: palette.c_warning,
        c_hover: palette.c_hover,
        c_white: palette.c_white,
        c_level_1: palette.c_level_1,
        c_level_2: palette.c_level_2,
        c_level_3: palette.c_level_3,
        c_level_4: palette.c_level_4,
        //背景色
        c_bg_1: palette.c_bg_1,
        c_bg_2: palette.c_bg_2,
        c_bg_3: palette.c_bg_3,
        c_bg_4: palette.c_bg_4,
        //边框/分割线颜色
        c_line_1: palette.c_line_1,
        c_line_2: palette.c_line_2,
        c_line_3: palette.c_line_3,
        c_line_4: palette.c_line_4,
        c_999: palette.c_999,
        c_333: palette.c_333,
        c_334: palette.c_334
      }
    }
  },
  variants: {
    backgroundColor: ['hover'],
    color: ['hover'],
    margin: ['first']
  },
  plugins: []
}
