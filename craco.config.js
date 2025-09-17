module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Find the rule that handles SVG files
      const fileLoaderRule = webpackConfig.module.rules.find(rule =>
        rule.test && rule.test.toString().includes('svg')
      );

      if (fileLoaderRule) {
        // Exclude SVG from file-loader
        fileLoaderRule.exclude = /\.svg$/;
      }

      // Add SVGR rule for SVG files
      webpackConfig.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      });

      return webpackConfig;
    },
  },
};