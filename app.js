var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use('/public', express.static(__dirname + "/public"));

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
	res.render('index', {});
});

app.post('/image-upload', upload.single('file-to-upload'), function(req, res, next){
	var newImage = {
		'original_name': req.file.originalname,
		'image_url': req.file.path
	};

	var caption = {
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
	// models.images.findAll().then(function(rows) {
	// 	var pixis = [];
	// 	for (var i = 0; i < rows.length; i++) {
	// 		var pixi = {};
	// 		pixi.image = rows[i].dataValues;

	// 		//var image_id = pixi.image.id;

	// 		models.captions.findAll().then(function(){
	// 			console.log(t)
	// 		});

			

	// 		// pixi.caption = {
	// 		// 	'body': caption
	// 		// };

	// 		pixis.push(pixi);
	// 	}
	// 	//console.log(pixis)
	// 	res.json(pixis);
	// });


	models.images.findAll({
	  include: [{
	  	model: models.captions
	  }]
	}).then(function(rows){
		var pixis = [];
		for(var i = 0; i < rows.length; i++){
			var pixi = rows[i];
			console.log(pixi.dataValues)
			// post.dataValues.username = post.dataValues.user.username;
			// posts.push(post);
		};
		//res.json(posts);
	});

});