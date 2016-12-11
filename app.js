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


app.get('/signup', function(req, res){
	res.render('signup', {});
})

app.post('/signup', function(req, res){
	var hashedPassword = passwordHash.generate(req.body.password);
	models.users.create({
		first_name: req.body.first_name,
		last_name: req.body.last_name,
		email: req.body.email,
	 	username: req.body.username,
	 	password: hashedPassword
	 });
	res.redirect('/login');
});

app.use(session({
  secret: 'password-protected site',
  resave: false,
  saveUninitialized: true
}));

models.sequelize.sync().then(function(){
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
	var userId = req.session.userId;
	
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
		var image = this.dataValues;
		caption.imageId = image.id;
		models.captions.create(caption).then(function(){
			models.images.findById(image.id, {
				include: [{
					model: models.captions
				}]
			}).then(function(row){
				res.json({
					pixi: row.dataValues,
					currentUser: userId
				})
			})
		})
	})
});

app.get('/get-all', function(req, res){
	var userId = req.session.userId;
	models.images.findAll({
	  include: [{
	  		model: models.captions
	  	},
	  	{
	  		model: models.comments
	  }]
	}).then(function(rows){
		pixis = [];
		for(var i = 0; i < rows.length; i++){
			pixis.push(rows[i].dataValues);
		};
		res.json({
			pixis: pixis,
			currentUser: userId
		});
	});
});

app.post('/new-comment', function(req, res){
	var userId = req.session.userId;
	var comment = {
		'userId': userId,
		'imageId': req.body.imageId,
		'body': req.body.body
	};
	models.comments.create(comment).then(function(){
		res.json(this.dataValues);
	});
});

app.post('/delete-image', function(req, res) {
	var imageId = req.body.imageId;
	models.images.findById(imageId).then(function(row){
		if (row.dataValues.userId == req.session.userId){
		 	models.images.destroy({
		    	where: {
		    		id: imageId
		    	}
		    }).then(function(){
		 		res.send("deleted");
			});
		}
	});
});

app.post('/edit-caption', function(req, res){
	var captionId = req.body.captionId;
	models.captions.findById(captionId).then(function(row){
		if (row.dataValues.userId == req.session.userId){
			models.captions.update({
				body: req.body.caption
			},
			{
				where: {id: captionId}
			}).then(function(){
				res.json({editedCaption: req.body.caption})
			});
		};
	});
});