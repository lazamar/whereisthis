const path = require("path");
const express = require('express')
const multer = require("multer");
const app = express()
const port = 9090

const IMAGES_DIR = path.join(__dirname, "images");
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

app.get('/', (req, res) => res.send('Hello World!'))

app.use("/public/", express.static(IMAGES_DIR));
app.post(
	"/find", 
	upload.single("file"), 
	(req, res) => {
		  var imagePath = req.file.path.replace(/^public\//, '');
		  res.redirect(imagePath);
	}
)

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
