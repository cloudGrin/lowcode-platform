const constants = require('./src/styles/var.json')

/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    // preflight: false
  },
  content: {
    files: [
      './src/pages/**/*.{html,js,ts,jsx,tsx}',
      './src/components/**/*.{html,js,ts,jsx,tsx}',
      './src/index.html',
      './src/*.tsx'
    ]
  },
  theme: {
    extend: {
      height: {
        header: '52px'
      },
      screens: {
        content: '1180px'
      },
      colors: {
        //主色调
        c_primary: constants.c_primary,
        c_primary_light: constants.c_primary_light,
        c_success: constants.c_success,
        c_info: constants.c_info,
        c_error: constants.c_error,
        c_warning: constants.c_warning,
        c_hover: constants.c_hover,
        c_white: constants.c_white,
        c_level_1: constants.c_level_1,
        c_level_2: constants.c_level_2,
        c_level_3: constants.c_level_3,
        c_level_4: constants.c_level_4,
        //背景色
        c_bg_1: constants.c_bg_1,
        c_bg_2: constants.c_bg_2,
        c_bg_3: constants.c_bg_3,
        c_bg_4: constants.c_bg_4,
        //边框/分割线颜色
        c_line_1: constants.c_line_1,
        c_line_2: constants.c_line_2,
        c_line_3: constants.c_line_3,
        c_line_4: constants.c_line_4
      }
    }
  },
  variants: {
    backgroundColor: ['hover'],
    color: ['hover'],
    margin: ['first']
  },
  plugins: [require('@tailwindcss/line-clamp')]
}
