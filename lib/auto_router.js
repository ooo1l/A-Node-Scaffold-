const fs = require('fs')
const handlebars = require("handlebars");
const chalk = require("chalk");

module.exports = async (projectName) => {
    const list = fs.readdirSync(`${projectName}/src/views`)
                    .map(v => {
                        return {
                          name: v.replace(".vue", "").toLowerCase(),
                          file: v
                        };
                    })
    console.log(list)
    // 生成路由
    compile({list}, `${projectName}/src/router.js`, './template/router.js.hbs')
    
}

function compile(meta, filePath, templatePath) {
    console.log(templatePath);
    console.log(fs.existsSync(templatePath))
    if (fs.existsSync(templatePath)) {
        const content = fs.readFileSync(templatePath).toString()
        const result = handlebars.compile(content)(meta)
        fs.writeFileSync(filePath, result)
        console.log(chalk.green(`${filePath} 创建成功`));
    }

}