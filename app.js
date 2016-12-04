var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static('public'));

var Sequelize = require("sequelize");
var databaseURL = process.env.DATABASE_URL || "sqlite://instagram-clone.sqlite";
var sequelize = new Sequelize(databaseURL);

var multer = require('multer');
var upload = multer({ dest: 'uploads/' });

var port = process.env.PORT || 3000;

var db = [];

app.get('/', function(req, res){
	res.render('index', {db: db});
});

app.post('/image-upload', upload.single('file-to-upload'), function(req, res, next){
	var newImage = {
		//originalname: req.file.originalname,
		//path: req.file.path,
		caption: req.body.caption
	};
	db.push(newImage);
	res.json(db);
});

app.listen(port, function(){
	console.log(`ExpressJS started on port ${port}`);
});