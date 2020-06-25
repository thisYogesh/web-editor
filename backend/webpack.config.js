const path = require("path");
const { getBuildState } = require('../js/util')

module.exports = env => {

  return {
    ...getBuildState(env),

    target: "node",
    
    entry: "./index.js",

    output: {
      libraryTarget: 'umd',
      path: path.resolve(__dirname, "../dist/backend"),
      filename: "bundle.js"
    },
  
    devServer: {
      contentBase: "../dist/backend",
      hot: true
    },
  
    externals: ['fs', 'detect-character-encoding'],
  
    node: {
      __dirname: false,
      __filename: false
    }
  }
};
