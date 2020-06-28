const package = require('../../package.json');
const types = require('./mime')
const KB = 1e+3
const MB = 1e+6
const GB = 1e+9
const TB = 1e+12
const supportedExt = Object.keys(types)
const supportedTypes = Object.values(types)
const imageTypes = {}
supportedTypes.forEach(type => {
  type.includes('image/') && !type.includes('svg') && (imageTypes[type] = true)
})

const errorPage = (code)=> {
    let content = ''
    switch(code){
        case 404:
            content = `
            <section class="error-page">
                <article>
                    <span class="excla">!</span>
                    <h2>404</h2>
                    <p>This path does not exist!</p>
                    <button onclick='location.reload()'>Reload</button>
                    <button onclick='history.back()'>Back</button>
                </article>
            </section>
            `;
            break;
        case 403.13:
            content = `
            <section class="error-page">
                <article>
                    <span class="excla">!</span>
                    <h2>403.13</h2>
                    <p>Forbidden! The Web server is configured to not list the contents of this directory.</p>
                    <p>For more detail see <b>lolhost.config</b></p>
                </article>
            </section>
            `;
            break;
    }

    return content
}

module.exports = {
  types,
  supportedTypes,
  supportedExt,
  package,
  
  response(res, data = '', isFile = false) {
    !isFile && res.write(`<head> <link rel="stylesheet" href="/@app/css/style.css"/> </head>`);
    res.end(data)
  },
  
  normPath(path, isAppURL) {
    let lenIndex = path.indexOf('/node_modules')
  
    // for development purpose
    if(lenIndex === -1 || isAppURL){
      const pk = '/' + package.name
      lenIndex = path.indexOf(pk) + pk.length
    }
  
    return path.substr(0, lenIndex);
  },
  
  getRootDirName(dirname) {
    var dirSplit = dirname.split('/');
    global.appRootPath = dirSplit[dirSplit.length  - 1]
    return dirSplit[dirSplit.length  - 1]
  },
  
  getCurrentPath(url  = '') {
    return url === '/' ? '' : url
  },
  
  isImageType(type){
    return !!imageTypes[type]
  },
  
  isSupportedType(type){
    return !!supportedTypes[type]
  },
  
  isSupportedExtention(ext){
    return supportedExt.includes(ext)
  },
  
  getDateTime(date){
    const dt = new Date(date);
    return `${dt.toLocaleDateString()} ${dt.toLocaleTimeString()}`
  },
  
  getSize(bytes){
    let size = 0;
    let unit = ''
    if(bytes > TB){
      size = bytes/TB
      unit = 'TB'
    }else if(bytes > GB){
      size = bytes/GB
      unit = 'GB'
    }else if(bytes > MB){
      size = bytes/MB
      unit = 'MB'
    }else if(bytes > KB){
      size = bytes/KB
      unit = 'KB'
    }else{
      size = bytes
      unit = 'B'
    }
  
    size = size.toString().includes('.') ? size.toFixed(2) : size
    return `${size} ${unit}`;
  },
  
  decode(url){
    return decodeURIComponent(url)
  },
  
  normUrl(url){
    return url ===  '/' ? url : url.replace(/\/$/, '')
  },
  
  throwError(res, status = {}){
    const code = status.code
    res.writeHead(code, status.message || '')
    this.response(res, errorPage(code))
  },
  
  getPathInfo({ url, dirname }){
    const appRx = /^\/@app/;
    let _url = this.normUrl(this.decode(url))
    let _dirname = dirname.replace(/\\/g, '/');
    const isAppURL =  appRx.test(_url)
  
    if(isAppURL) _url = _url.replace(appRx, '');
    // else 
    _dirname = this.normPath(_dirname, isAppURL)
  
    const rootDirName = this.getRootDirName(_dirname) +  _url
    const currentPath = decodeURIComponent(this.getCurrentPath(_url))    
    const pathWithDir = _dirname + currentPath
  
    return {
      rootDirName,
      currentPath,
      pathWithDir,
      isAppURL
    }
  },
  
  getContentType(path){
    const extention = path.match(/\.\w+$/)
    const ext = extention && extention[0]
    const isSupportedExtention = this.isSupportedExtention(ext)
    let contentType = isSupportedExtention ? this.types[ext] : this.types['default']
  
    return contentType
  },
  
  setContentType(res, path){
    const contentType = this.getContentType(path)
    res.setHeader('content-type', contentType);
  },
  
  getFileInfo(fs, pathWithDir, path, currentPath){
    const stat = fs.statSync(pathWithDir + '/' + path);
    const isDirectory = stat.isDirectory()
    const title = path
    const isHidden = /^\./.test(title)
    const href = currentPath ? `${currentPath}/${path}` : `/${path}`
    const size = !isDirectory ? this.getSize(stat.size) : ''
  
    return {
      isDirectory,
      isHidden,
      href,
      title,
      size,
      stat
    }
  },
  
  buildResObject(data, isSupported = true, isImage = false){
    return JSON.stringify({ data, isSupported, isImage })
  },
  
  redirect(res, url){
    res.writeHead(302, { Location: url })
    res.end()
  },
  
  redirectIfRequired(req, res, cb){
    if(!/\/$/.test(req.url)){
      this.redirect(res, `http://${req.headers.host + req.url}/`)
    }else{
      cb()
    }
  },
  
  isSupported(encoding){
    let supported = true
    const nonSupportedEncodes = ['windows-','UTF-32BE', 'UTF-16BE']
    for(let encode of nonSupportedEncodes){
      if(encoding.includes(encode)) {
        supported = false;
        break
      }
    }
    return supported
  },
  
  lastArrayItem(array){
    return array[array.length - 1]
  }
}