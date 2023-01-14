var path = require("path");

const { NODE_ENV } = process.env;

const isProduction = NODE_ENV === "production";
const dir = isProduction ? "/dist" : "/src";
const root = path.resolve("./").replace(/\\/g, "/") + dir;

const getSrcPath = () => {
  return root;
};

export default getSrcPath;
