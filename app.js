var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use('/public', express.static(__dirname + "/public"));
var session = require('express-session');
var passwordHash = require('password-hash');

var models = require('./models');

var multer = require('multer');
var upload = multer({ dest: 'public/uploads/' });

var port = process.env.PORT || 3000;

app.use(session({
  secret: 'password-protected site',
  resave: false,
  saveUninitialized: true
}));

models.sequelize.sync().then(function(){

	// var first_name = 'Darren';
	// var last_name = 'Klein';
	// var email = 'dklein@test.com';
	// var username = 'dklein';
	// var password = 'pass';

	// var hashedPassword = passwordHash.generate(password);

	// models.users.create({
	// 	first_name: first_name,
	// 	last_name: last_name,
	// 	email: email,
	// 	username: username,
	// 	password: hashedPassword
	// });

	app.listen(port, function(){
		console.log(`ExpressJS started on port ${port}`);
	});
}).catch(function(err){
	console.error(err);
});

app.get('/login', function(req, res){
	res.render('login', {});
});

app.post('/login', function(req, res){
  models.users.findOne({
    where: { username: req.body.username }
  }).then(function(row){

	var correctPW = passwordHash.verify(req.body.password, row.dataValues.password);

    if(correctPW){
      req.session.userId = row.dataValues.id;
      res.redirect('/')
    } else {
      console.error("Incorrect password");
      res.status(401).send("Could not login!");
    }
  }).catch(function(err) {
    console.error(err);
    res.status(401).send("Could not login!");
  });
});

app.get('/logout', function(req, res){
	req.session.userId = null;
	res.send("Logged out");
});

app.use(function(req, res, next) {
  if (req.session.userId){
    next();
    return;
  }
  res.status(401).send("Please login to view this page.");
});

app.get('/', function(req, res){
	res.render('index', {});
});

app.post('/image-upload', upload.single('file-to-upload'), function(req, res, next){
	var userId = req.session.userId; //FOR TESTING PURPOSES

	var newImage = {
		'userId': userId,
		'original_name': req.file.originalname,
		'image_url': req.file.path
	};

	var caption = {
		'userId': userId,
		'body': req.body.caption
	};

	models.images.create(newImage).then(function(){
		var imageId = this.dataValues.id;
		caption.imageId = imageId;
		models.captions.create(caption).then(function(){
			res.json({	'image': newImage,
						'caption': caption  })
		})
	})
});

app.get('/get-all', function(req, res){
	models.captions.findAll({
	  include: [{
	  	model: models.images
	  }]
	}).then(function(rows){
		var pixis = [];
		for(var i = 0; i < rows.length; i++){
		 	var pixi = {};
		 	pixi.image = rows[i].dataValues.image;
		 	pixi.caption = {
		 		'body': rows[i].dataValues.body
		 	}
			pixis.push(pixi);
		};
		res.json(pixis);
	});
});