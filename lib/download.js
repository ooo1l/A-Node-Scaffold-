const download = require('download-git-repo')
const path = require("path")
const ora = require('ora')

module.exports = function (target, type="github", url) {

    let targeturl = "";
    switch (type) {
      case "github":
        targeturl = `https://github.com/${url}`;
        break;
      case "gitlab":
        targeturl = `gitlab:${url}`;
        break;
    }
    target = path.join(target || '.', '.download-temp')

    return new Promise((resolve, reject) => {
        const spinner = ora(`正在下载项目模板，源地址:${targeturl}`);
        spinner.start();
        download(
          url,
          target,
          { clone: true },
          err => {
            if (err) {
              spinner.fail()
              reject(err);
            } else {
              spinner.succeed()
              resolve(target);
            }
          }
        );
    })   
}