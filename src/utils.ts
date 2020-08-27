import { execSync } from "child_process";

export const getGlobalNodeModulesDir = () => {
  return String(execSync("npm root -g")).trim();
};
