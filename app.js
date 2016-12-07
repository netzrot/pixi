var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use('/public', express.static(__dirname + "/public"));

var Sequelize = require("sequelize");
var databaseURL = process.env.DATABASE_URL || "sqlite://pixis.sqlite";
var sequelize = new Sequelize(databaseURL);

var multer = require('multer');
var upload = multer({ dest: 'public/uploads/' });

var port = process.env.PORT || 3000;

var Image = sequelize.define("images", {
	image_url: {
		type: Sequelize.STRING,
		allowNull: false,
		unique: true
	},
	original_name: {
		type: Sequelize.STRING,
		allowNull: false
	}
});

Image.sync();

app.get('/', function(req, res){
	res.render('index', {});
});

app.post('/image-upload', upload.single('file-to-upload'), function(req, res, next){
	var newImage = {
		'original_name': req.file.originalname,
		'image_url': req.file.path
		// ,
		// caption: req.body.caption
	};

	Image.create(newImage).then(function() {
		res.json(newImage);
	})
});

app.get('/get-all', function(req, res){
	Image.findAll().then(function(rows) {
		var pixis = [];
		for (var i = 0; i < rows.length; i++) {
			pixis.push(rows[i]);
		}
		res.json(pixis);
	});

});


app.listen(port, function(){
	console.log(`ExpressJS started on port ${port}`);
});