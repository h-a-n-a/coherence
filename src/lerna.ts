import fs from "fs";
import path from "path";
import { execSync } from "child_process";

function getPkgAliasForPath(absPath: string) {
  const result = [path.basename(absPath), absPath];
  const pkgPath = path.join(absPath, "package.json");

  // use package.name if exists
  if (fs.existsSync(pkgPath)) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    result[0] = require(pkgPath).name;
  }

  return result as [packageName: string, absolutePath: string];
}

export default (cwd: string) => {
  const isLerna = fs.existsSync(path.join(cwd, "lerna.json"));
  const pkgs = [] as [packageName: string, absolutePath: string][];

  if (isLerna) {
    // for lerna repo
    const lernaVersion = execSync(
      `${path.join(cwd, "node_modules/.bin/lerna")} -v`,
      {
        cwd,
      }
    ).toString();

    if (lernaVersion.startsWith("3")) {
      JSON.parse(
        execSync(`${path.join(cwd, "node_modules/.bin/lerna")} ls --json`, {
          stdio: "pipe",
          cwd,
        }).toString()
      ).forEach((pkg: any) => {
        pkgs.push([pkg.name, pkg.location]);
      });
    } else if (
      require.resolve("lerna/lib/PackageUtilities", { paths: [cwd] })
    ) {
      // reference: https://github.com/azz/lerna-get-packages/blob/master/index.js
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const PackageUtilities = require(require.resolve(
        "lerna/lib/PackageUtilities",
        {
          paths: [cwd],
        }
      ));
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Repository = require(require.resolve("lerna/lib/Repository", {
        paths: [cwd],
      }));

      PackageUtilities.getPackages(new Repository(cwd)).forEach((pkg: any) => {
        pkgs.push([pkg._package.name, pkg._location]);
      });
    }
  } else {
    // for standard repo
    pkgs.push(getPkgAliasForPath(cwd));
  }

  return pkgs;
};
