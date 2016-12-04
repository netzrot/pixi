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

var port = process.env.PORT || 3000;

app.get('/', function(req, res){
	res.render('index', {});
});

app.listen(port, function(){
	console.log(`ExpressJS started on port ${port}`);
});