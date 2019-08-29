const path = require("path");
const express = require('express')
const multer = require("multer");
const Future = require("fluture");
const http = require("http");
const fs = require("fs");
const exphbs = require("express-handlebars");
const request = require("./request");
const whereml = require("./whereml");
const absolute = require("./absolute");
const env = require(absolute("@root/env.json"));

const app = express();

// Setup handlebars
app.engine( ".hbs", exphbs({ 
    extname: ".hbs", 
    helpers: { 
        json: JSON.stringify,
        abs: p => env.host + p
    }
}));
app.set("view engine", ".hbs");
app.set("views", absolute("@root/src/views"));

app.use("/static", express.static(absolute("@root/src/static")));

app.get('/', (req, res) => res.render("index"))

const upload = multer({ 
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, whereml.IMAGES_DIR),
        filename: (req, file, cb) => cb(null, Date.now() + file.originalname)
    })
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

app.post(
	"/", 
	upload.single("file"), 
	(req, res) => {
        const fileName = req.file.filename;
        const filePath = path.join(whereml.IMAGES_DIR, fileName);

        whereml.locate(fileName)
            .lastly(deleteFile(filePath))
            .fork(
                err => res.send(err), 
                markers => res.render( "result", { markers }) 
            );
	}
)

const PORT = 9090
app.listen(PORT, () => console.log(`Listening on port ${PORT}!`))

