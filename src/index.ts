#!/usr/bin/env node

import program from "commander";
import link, { LinkOptions } from "./link";
import { getGlobalNodeModulesDir } from "./utils"

program
  .version(
    `coherence ${require("../package.json").version}`,
    "-v --version",
    "查看当前版本"
  )
  .helpOption("-h --help", "帮助信息");

program
  .command("link [dir]")
  .description("创建软链接")
  .option(
    "-l, --lib-dir <lib-dir>",
    "Lerna package 中输出文件目录（默认为 lib 文件夹）"
  )
  .option(
    "-d, --node-modules-dir <node-modules-dir>",
    "link 的目标根目录（默认为全局 node_modules 目录）"
  )
  .option("-s, --source-dir <source-dir>", "lerna package 中源文件目录（默认为 src 文件夹）")
  .action((dir, options: LinkOptions) => {
    options.libDir ??= "lib";
    options.nodeModulesDir ??= getGlobalNodeModulesDir();
    options.sourceDir ??= "src";
    link(dir, options);
  });

program.parse(process.argv);
