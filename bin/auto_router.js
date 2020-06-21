#!/usr/bin/env node

const program = require("commander")
const auto_router = require("../lib/auto_router")

program
    .usage("<project-name>")
    .description("views catalogue")
    .parse(process.argv);


let projectName = program.args[0];
if (!projectName) {
  // project-name 必填
  // 相当于执行命令的--help选项，显示help信息
  // 这是commander内置的一个命令选项
  program.help();
  return;
}

auto_router(projectName);