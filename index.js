const path = require("path");
const express = require('express')
const multer = require("multer");
const Future = require("fluture");
const http = require("http");
const fs = require("fs");
const StaticMaps = require("staticmaps");
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
app.engine( ".hbs", exphbs({ extname: ".hbs", defaultLayout: false }));
app.set("view engine", ".hbs");
app.set("views", "views");

app.get('/', (req, res) => res.render("index"))

app.use("/static", express.static("static"));

const mapPath = path.join(__dirname, "static/map.jpg");
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
        .chain(results => {
            const markers = results.map(v => v[0].reverse());
            return createMap(mapPath, markers);
        })
        .lastly(deleteFile(filePath))
        .fork(res.send, (b64) => res.send(b64))
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


const mapOptions = { width: 600, height: 400 };
const markerImage = path.join(__dirname, "static/marker.png");
// Returns a base64-encoded image url
const createMap = (filePathAndName, markers) => 
    Future((reject, resolve) => {
        const map = new StaticMaps(mapOptions);

        markers.forEach(coord => {
            const marker = { 
                img: markerImage,
                offsetX: 24,
                offsetY: 48,
                width: 48,
                height: 48,            
                coord 
            };

            map.addMarker(marker);
        });

        map.render()            
            .then(() => map.image.buffer())
            .then(buffer => "data:image/png;base64," + buffer.toString('base64'))
            .then(resolve, reject)
    })

