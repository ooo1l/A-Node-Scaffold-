const Metalsmith = require("metalsmith")
const Handlebars = require("handlebars")
const fs = require("fs")
const path = require("path")
const rm = require('rimraf').sync

module.exports = function (metadata = {}, src, dest = '.') {
    if (!src) {
       return Promise.reject(new Error(`无效的source：${src}`));
    }

    const {templateVersion} = JSON.parse(fs.readFileSync(path.resolve(`${src}/package.json`)).toString());
    return new Promise((resolve, reject) => {
        const metalsmith = Metalsmith(process.cwd())
            .metadata(metadata)
            .clean(false)
            .source(src)
            .destination(dest)
            .use((files, metalsmith, done) => { // 自定义插件
                const meta = metalsmith.metadata()
                // 替换package.json文件
                Object.keys(files)
                    .filter(x => x.includes('package.json'))
                    .forEach(fileName => {
                        const t = files[fileName].contents.toString()
                        files[fileName].contents = Buffer.from(Handlebars.compile(t)(meta))
                    })
                    done()
            })
            .build(err => {
                rm(src)
                err ? reject(err) : resolve({ dest, templateVersion })
            })
    })
}
