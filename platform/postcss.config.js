module.exports = {
  plugins: {
    tailwindcss: {},
    'postcss-flexbugs-fixes': {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {})
  }
}
