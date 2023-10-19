import fs from "fs-extra";

// Copy the contents of the public folder to the dist folder
//eslint-disable-next-line
fs.copySync("public", "dist/public");
