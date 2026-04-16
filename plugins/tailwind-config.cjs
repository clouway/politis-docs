// Docusaurus plugin that wires Tailwind CSS v4 into the build pipeline.
// Tailwind v4 provides a PostCSS plugin (@tailwindcss/postcss) that we
// register with the existing PostCSS loader.

module.exports = function () {
  return {
    name: 'docusaurus-tailwindcss',
    configurePostCss(postcssOptions) {
      postcssOptions.plugins.push(require('@tailwindcss/postcss'));
      return postcssOptions;
    },
  };
};
