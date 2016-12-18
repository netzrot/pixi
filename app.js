var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use('/public', express.static(__dirname + "/public"));
var session = require('express-session');
var passwordHash = require('password-hash');
var moment = require('moment');

var models = require('./models');

var multer = require('multer');
var upload = multer({ dest: 'public/uploads/' });

var port = process.env.PORT || 3000;

models.sequelize.sync().then(function(){
	app.listen(port, function(){
		console.log(`ExpressJS started on port ${port}`);
	});
}).catch(function(err){
	console.error(err);
});

app.get('/', function(req, res){
	res.redirect('/login');
})

app.use(session({
  secret: 'password-protected site',
  resave: false,
  saveUninitialized: true
}));


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
      req.session.userName = row.dataValues.username;
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
	var userName = req.session.userName;
	res.render('index', {currentUser: userName});
});

app.post('/image-upload', upload.single('file-to-upload'), function(req, res, next){
	var userId = req.session.userId;
	var userName = req.session.userName;
	
	var image = {
		'userId': userId,
		'original_name': req.file.originalname,
		'image_url': req.file.path,
		'created_by': userName
	};

	var caption = {
		'userId': userId,
		'body': req.body.caption,
		'created_by': userName
	};

	if(req.body.tags != ''){
		var user_tags = req.body.tags.split(' ');
	};

	models.images.create(image).then(function(image){
		var imageId = image.dataValues.id;
		caption.imageId = imageId;
		models.captions.create(caption).then(function(){
			if(user_tags){
				models.sequelize.transaction(function(t){
		        	var userPromises = [];

			       for (var i = 0; i < user_tags.length; i++) {
			        	var userPromise = models.users.findOne({where: {username: user_tags[i]}}, {transaction: t});
			        	userPromises.push(userPromise);
			        };
			        return Promise.all(userPromises).then(function(users){
			        	var tagPromises = [];
			        	for(var i = 0; i < users.length; i++){
			        		var tagPromise = models.user_tags.create({'userId': users[i].dataValues.id, 'imageId': imageId}, {transaction: t});
			        		tagPromises.push(tagPromise);
			        	}
			        	return Promise.all(tagPromises).then(function(){
							models.images.findById(image.id, {
								include: [{model: models.captions}, {model: models.users}]
							}).then(function(row){
								row.dataValues.createdAt = moment(row.dataValues.createdAt).format("dddd, MMMM Do YYYY, h:mm:ss a");
								res.json({
									pixi: row.dataValues,
									currentUser: userId
								})
							})
			        	})
			        })

				})
			}
			else{
				models.images.findById(image.id, {
					include: [{model: models.captions}]
				}).then(function(row){
					row.dataValues.createdAt = moment(row.dataValues.createdAt).format("dddd, MMMM Do YYYY, h:mm:ss a");
					res.json({
						pixi: row.dataValues,
						currentUser: userId
					})
				})
			}

		})
	});
});

app.get('/get-all', function(req, res){
	var userId = req.session.userId;
	models.images.findAll({
	  include: [{model: models.captions}, {model: models.comments}, {model: models.users}]
	}).then(function(rows){
		pixis = [];
		for(var i = 0; i < rows.length; i++){
			rows[i].dataValues.createdAt = moment(rows[i].dataValues.createdAt).format("dddd, MMMM Do YYYY, h:mm:ss a");
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
	var userName = req.session.userName;
	var comment = {
		'userId': userId,
		'imageId': req.body.imageId,
		'body': req.body.body,
		'created_by': userName
	};
	models.comments.create(comment).then(function(){
		res.json(this.dataValues);
	});
});

app.delete('/delete-image', function(req, res) {
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

app.get('/:username', function(req, res){
	if(req.params.username){

		var userName = req.params.username;

		models.users.findOne({where: {username: userName}}).then(function(user){
			models.images.findAll({where: {userId: user.id}, include: [{model: models.captions}, {model: models.comments}, {model: models.users}]}).then(function(rows){
				pixis = [];
				for(var i = 0; i < rows.length; i++){
					rows[i].dataValues.createdAt = moment(rows[i].dataValues.createdAt).format("dddd, MMMM Do YYYY, h:mm:ss a");
					pixis.push(rows[i].dataValues);
				};
				res.render('user', {
					username: userName,
					pixis: pixis
				});
			})
		})
	}
})