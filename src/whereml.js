/* Talk to the WhereML docker container */

const Future = require("fluture");
const request = require("./request");
const path = require("path");
const absolute = require("./absolute");

const WHEREML_PORT =  8080;
const WHEREML_HOST = "localhost";

module.exports = {};

module.exports.IMAGES_DIR = absolute("@root/images");

module.exports.locate = filePath => 
	request({
	  	method: "GET",
	    hostname: WHEREML_HOST,
	    port: WHEREML_PORT,
	    path: "/from_local?path=" + filePath
	})
	.map(({ body }) => JSON.parse(body))
	.map(results => results .map(v => v[0]))
