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

const app = express();

// Setup handlebars
app.engine( ".hbs", exphbs({ 
    extname: ".hbs", 
    helpers: { json: JSON.stringify }
}));
app.set("view engine", ".hbs");
app.set("views", absolute("@root/src/views"));

app.get('/', (req, res) => res.render("index"))

app.use("/static", express.static(absolute("@root/src/static")));

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

const PORT = 9090
app.listen(PORT, () => console.log(`Listening on port ${PORT}!`))

// ==================

