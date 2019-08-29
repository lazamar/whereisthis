const path = require("path");
const express = require('express')
const multer = require("multer");
const Future = require("fluture");
const http = require("http");
const fs = require("fs");
const exphbs = require("express-handlebars");

const IMAGES_DIR = path.join(__dirname, "images");
const PORT = 9090
const WHEREML = {
    port: 8080,
    hostname: "localhost"
}

const id = a => a;
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

const app = express();

// Setup handlebars
app.engine( ".hbs", exphbs({ 
    extname: ".hbs", 
    helpers: { json: JSON.stringify }
}));

app.set("view engine", ".hbs");
app.set("views", "views");

app.get('/', (req, res) => res.render("index"))

app.use("/static", express.static("static"));

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
        .map(({ body }) => JSON.parse(body))
        .map(results => results .map(v => v[0]))
        .lastly(deleteFile(filePath))
        .fork(
            res.send, 
            markers => res.render( "result", { markers, test: 2 }) 
        );
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
