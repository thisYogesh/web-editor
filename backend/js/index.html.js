const { fs, util } = require("./modules")();
const { pathWithDir } = util.getPathInfo({
  url: '/@app/dist/frontend/index.html',
  dirname: __dirname
})
const html = fs.readFileSync(pathWithDir, 'utf-8');

module.exports = function(title){
  return new Function(
    "rootTitle",
    "return `" + html + "`"
  )(title)
}