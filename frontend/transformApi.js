const babelJest = require('babel-jest').default;

module.exports = {
  process(src, filename, config, options) {
    // Replace import.meta.env.VITE_API_BASE_URL with the mock value
    const newSrc = src.replace(
      /import\.meta\.env\.VITE_API_BASE_URL/g,
      "'http://localhost:6543/api'" // Make sure this is a string literal
    );
    return babelJest.process(newSrc, filename, config, options);
  },
};
