#!/usr/bin/env node

const program = require("commander");
const path = require("path")
const fs = require("fs")
const glob = require("glob")
const download = require("../lib/download")
const generator = require("../lib/generator")
const inquirer = require("inquirer")

const chalk = require("chalk")
const logSymbols = require("log-symbols")

program.usage('<project-name>')
    .option('-t, --type [repository-type]', 'assign to repository type', 'github')
    .option('-r, --repository [repository]', 'assign to repository', 'ooo1l/template')
    .parse(process.argv)

let projectName = program.args[0]
if (!projectName) {
    // project-name 必填
    // 相当于执行命令的--help选项，显示help信息
    // 这是commander内置的一个命令选项
    program.help()
    return
}

// 遍历当前目录
const list = glob.sync('*')
let rootName = path.basename(process.cwd())

let next = undefined
if (list.length) {
    // 当前目录不为空
    let listArr = list.filter(name => {
        const fileName = path.resolve(process.cwd(), path.join('.', name))
        const isDir = fs.statSync(fileName).isDirectory();
        return name.indexOf(projectName) !== -1 && isDir
    })
    if (listArr.length !== 0) {
        console.log(`项目${projectName}已经存在`)
        return
    }
    next = Promise.resolve(projectName)
} else if (rootName === projectName) {
    next = inquirer.prompt([
        {
            name: 'buildInCurrent',
            message: '当前目录为空，且目录名称和项目名称相同，是否直接在当前目录下创建新项目？',
            type: 'confirm',
            default: true
        }
    ]).then(answer => {
        return Promise.resolve(answer.buildInCurrent ? '.' : projectName)
    })
} else {
    next = Promise.resolve(projectName)
}

next && run()
function run () {
    next.then(projectRoot => {
        if(projectRoot !== '.') {
            fs.mkdirSync(projectRoot)
        }
        return download(projectRoot, program.type, program.repository)
          .then(target => {
            return {
              name: projectRoot,
              root: projectRoot,
              target: target
            };
          })
    }).then(context => {
        return inquirer.prompt([
          {
            name: "projectName",
            message: "项目的名称",
            default: context.name
          },
          {
            name: "projectVersion",
            message: "项目的版本号",
            default: "1.0.0"
          },
          {
            name: "projectDescription",
            message: '项目的简介',
            default: `A project name ${context.name}`
          }
        ]).then(answers => {
            return {
                ...context,
                metadata: {
                    ...answers
                }
            };
        })
    }).then(context => {
        // 添加生成的逻辑
        return generator(context.metadata, context.target, path.parse(context.target).dir);
    }).then(context => {
        const projectPath = path.resolve(context.dest)
        let current_package = JSON.parse(fs.readFileSync(`${projectPath}/package.json`).toString())
        current_package.templateVersion = context.templateVersion || '0.0.1'
        fs.writeFileSync(`${projectPath}/package.json`, JSON.stringify(current_package))

        console.log(logSymbols.success, chalk.green('创建成功'))
        console.log()
        console.log(chalk.green(`cd ${context.dest}\nnpm install\nnpm run dev`))
    }).catch(err => {
        console.error(logSymbols.error, chalk.red(`创建失败:${err.message}`))
    }) 
}