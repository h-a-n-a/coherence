#!/usr/bin/env node

import parser from "./lerna";

const PATH = "/Users/bytedance/Desktop/Projects/ds/ds-material-next";
const result = parser(PATH);

console.log(result);
