/* Make HTTP requests and get a Future as a result */
const Future = require("fluture");
const http = require("http");
const https = require("https");

module.exports = (options, payload = "") =>
    Future((reject, resolve) => {
    	const protocol = options.hostname.startsWith("https") ? https : http;

        const req = protocol.request(options, res => {
            res.setEncoding("utf8");
            res.on("data", (body) => {
                const statusCode = res.statusCode || 200;
                return resolve({ statusCode, headers: res.headers, body });
            });
        });

        req.on("error", reject);
        req.write(payload);
        req.end();
    });


