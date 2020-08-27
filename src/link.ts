import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import ora from "ora";
import { execSync } from "child_process";

import parser from "./lerna";

export interface LinkOptions {
  libDir: string;
  sourceDir: string;
  nodeModulesDir: string;
}

const link = (dir: string, options: LinkOptions) => {
  const parsingSpinner = ora(chalk.cyanBright("Lerna 包解析中...")).start();
  const packages = parser(dir || process.cwd());
  parsingSpinner.stop();
  console.log(chalk.cyanBright("Lerna 包解析完成 ✅\n"));

  const linked = [] as [from: string, dest: string][];
  const errors: string[] = [];
  const linkingSpinner = ora(chalk.cyanBright("创建软链接中...")).start();
  packages.forEach((pkg) => {
    const packageName = pkg[0];
    const absolutePath = pkg[1];

    const from = path.join(absolutePath, options.sourceDir)
    const to = path.join(options.nodeModulesDir, packageName)
    const dest = path.join(to, options.libDir)

    const fromPackageJSONPath = path.join(absolutePath, "package.json");
    const toPackageJSONPath = path.join(to, "package.json")

    if(!fs.pathExistsSync(from)) {
      errors.push(`${packageName}/${options.sourceDir} 路径不存在，跳过`)
      return;
    }
    fs.emptyDirSync(to)
    execSync(`ln -s ${from} ${to}`)
    execSync(`mv ${path.join(to, options.sourceDir)} ${dest}`)
    execSync(`cp ${fromPackageJSONPath} ${toPackageJSONPath}`)
    linked.push([from, dest])
  });

  if(linked.length) console.log(chalk.cyanBright("\n\n✅ 已生成软链接:\n"))
  linked.forEach(linkedPackage => {
    console.log(`${linkedPackage[1]} -> ${linkedPackage[0]}`)
  })
  errors.forEach(error => {
    console.log(error)
  })
  linkingSpinner.stop();
  console.log("\n");
  console.log(chalk.cyanBright("软链接创建完成 ✅"));
};

export default link;
