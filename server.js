require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');                  // *** use json web token
// *** Use cookie parser

app = express();

//models
const Post = require('./models/post')
const User = require('./models/user')
const Comment = require('./models/comment')
//controllers
const post = require('./controllers/post');
const login = require('./controllers/auth-controller')
const replies = require('./controllers/replies')

//Creating a static folder for static files(css, images)
app.use(express.static(__dirname + '/public'));
//Use body parser to get infromation from forms
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
//Cookie parser for login info
app.use(cookieParser());
//Added to Update, and Delete
app.use(methodOverride('_method'));

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//Setting up database
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/reddit-clone' || process.env.MONGODB_URI  , {useMongoClient: true});

const checkAuth = function(req, res, next){
	if(req.cookies.nToken === undefined || req.cookies.nToken === null){
		req.user = null
	} else {
		var token = req.cookies.nToken
		var decodedToken = jwt.decode(token, {complete: true} || {});
		req.user = decodedToken.payload;
	}
	next();
}

//Middleware
app.use(checkAuth);

//Routes for posts
app.use('/', post);
// Routes for Login
app.use('/', login);
app.use('/', replies)

// Homepage for RedditClone
app.get('/', function(req, res){
	Post.find({}).populate('author').then((posts) => {
		res.render('posts-index', {posts:posts, current_user: req.user});
	});
});

app.get('/about', (req, res)=>{
	res.render('about')
})

// When user inputs an invalid url
app.use(function(req,res,next){
	res.status(404);
	res.render('404');
});

//Running server on port 3000.
app.listen(3000, function(){
	console.log("running on port 3000");
});
