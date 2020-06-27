const path = require('path')
const { fs } = require("./modules")();
const html = fs.readFileSync(path.resolve('frontend/index.html'), 'utf-8');

module.exports = function(title){
  return new Function(
    "rootTitle",
    "return `" + html + "`"
  )(title)
}