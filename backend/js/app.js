const { util } = require("./modules")();
const { logInfo } = require('./log')
const editor = require('./editor')

module.exports = function(port1 = 8000){
  // initiate apps
  editor(port1) // start editor server

  // print app server info
  logInfo({ port1, name: util.package.name, version: util.package.version })
}