/* Use absolute paths */

const path = require("path");
const assert = require("assert");
const ROOT = path.resolve(__dirname, "..");

module.exports = p => {
	assert(p.startsWith("@root"), "Relative paths are not allowed");
    return path.resolve(p.replace("@root", ROOT))
}