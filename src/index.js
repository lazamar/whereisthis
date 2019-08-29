const path = require("path");
const express = require('express')
const multer = require("multer");
const Future = require("fluture");
const http = require("http");
const fs = require("fs");
const exphbs = require("express-handlebars");
const request = require("./request");
const whereml = require("./whereml");

const ROOT = path.resolve(__dirname, "..");
const absolute = p => 
    p.startsWith("@root")
        ? path.resolve(p.replace("@root", ROOT))
        : path.resolve(__dirname, p);

const PORT = 9090

const id = a => a;
var upload = multer({ 
	storage: multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, whereml.IMAGES_DIR);
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

app.set("views", absolute("./views"));

app.get('/', (req, res) => res.render("index"))

app.use("/static", express.static(absolute("./static")));

app.post(
	"/find", 
	upload.single("file"), 
	(req, res) => {
        const fileName = req.file.filename;
        const filePath = path.join(whereml.IMAGES_DIR, fileName);

        whereml.locate(fileName)
            .lastly(deleteFile(filePath))
            .fork(
                res.send, 
                markers => res.render( "result", { markers }) 
            );
	}
)

app.listen(PORT, () => console.log(`Listening on port ${PORT}!`))

// ==================

 const deleteFile = filePath => 
 	Future((reject, resolve) => {
		fs.unlink(filePath , (err) => {
            if (err) { 
                reject(err)
			} 
			resolve();
    	});
 	})
