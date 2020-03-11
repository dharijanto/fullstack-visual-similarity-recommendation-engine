var fs = require('fs')
var path = require('path')

var browserify = require('browserify')
var watchify = require('watchify')

const modules = [
  {
    input: 'email-setting-cms',
    output: path.join(__dirname, `../cms/view/v1/assets/js/`)
  }
]

modules.forEach(module => {
  console.log(`Watching module: ${module.input}...`)
  const b = watchify(browserify(path.join(__dirname, module.input, 'main.js'), {cache: {}, packageCache: {}})
    .transform({global: true}, 'browserify-shim')
    .transform('babelify', {presets: ['es2015']}))
    // .transform('uglifyify', {global: true}))
    // .plugin(watchify)
  b.on('update', () => bundle(b, module.input, module.output))
  b.on('error', err => console.error(err.message))
  // b.on('log', msg => console.log(msg))

  bundle(b, module.input, module.output)
})

function bundle (b, module, outputFolder) {
  console.log(`Bundling module: ${module}...`)
  console.time(module)
  b.bundle()
  .on('error', err => console.error(err.message))
  .pipe(fs.createWriteStream(path.join(outputFolder, `${module}-bundle.js`)))
  .on('finish', () => {
    console.timeEnd(module)
  })
}
