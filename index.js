const path = require("path");
const express = require('express')
const multer = require("multer");
const Future = require("fluture");
const http = require("http");
const fs = require("fs");

const IMAGES_DIR = path.join(__dirname, "images");
const PORT = 9090
const WHEREML = {
    port: 8080,
    hostname: "localhost"
}

const id = a => a;
const app = express();
var upload = multer({ 
	storage: multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, IMAGES_DIR);
		},
		filename: function (req, file, cb) {
			cb(null, Date.now() + file.originalname);
		}
	})
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, "index.html")))

app.post(
	"/find", 
	upload.single("file"), 
	(req, res) => {
        const fileName = req.file.filename;
        const filePath = path.join(IMAGES_DIR, fileName);

		request({
		  	method: "GET",
		    hostname: WHEREML.hostname,
		    port: WHEREML.port,
		    path: "/from_local?path=" + fileName
		})
        .bimap(
          err => res.send(err),
          ({ body }) => res.send(JSON.parse(body))
        )
        .chain(() => deleteFile(filePath))
        .chainRej(() => deleteFile(filePath))
		.fork(id, id)
	}
)

app.listen(PORT, () => console.log(`Listening on port ${PORT}!`))

// ==================

const request = (options, payload = "") =>
    Future((reject, resolve) => {
        const req = http.request(options, res => {
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

 const deleteFile = filePath => 
 	Future((reject, resolve) => {
		fs.unlink(filePath , (err) => {
            if (err) { 
                reject(err)
			} 
			resolve();
    	});
 	})



