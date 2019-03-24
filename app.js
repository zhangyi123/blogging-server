var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();


let MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';

const dbName = 'BlogServer';

let db;

MongoClient.connect(url, (err, database) =>{
	db = database.db(dbName);
	//app.listen(3000); bin.www
	console.log('Listening on port 3000');
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.get('/blog/:username', function(req, res){
	let start;
	if(req.query.hasOwnProperty('start'))start = req.query.start;
	else start =0;
	let user = req.params.username;
		var posts;
		const collection = db.collection('Posts');
		collection.find({username: user}).toArray((err,items)=>{
			posts=items;
			res.render('temp' , {p: posts, num: start, name: user}  );  //can revise , no need to pass name as param
		});
	
})
app.get('/blog/:username/:postid', (req, res)=>{
	let pid = parseInt(req.params.postid);
	let user = req.params.username;

		var posts;
		const collection = db.collection('Posts');
		collection.findOne({ username: user, postid: pid }, (err, item)=>{
			if(item!=null)res.render('postpage', {post: item}  ); 
			else res.render('error', {message: "No post", 
				error: {
						status: 404,
						stack: "not found"
					}
				});

		
		
	})

})
app.route('/login')
	.get((req, res) =>{
		res.render('login');
	})
	.post((req, res) =>{
		let name = req.params.username;
		let password = req.params.password;
		if(name=="aa"&&password=="bb")res.send("hello");
		else{
			res.status(401);
			res.send("hi");
			
		} 
	})
app.route('/api/:username/:postid')

	.get((req, res) =>{
		let pid = parseInt(req.params.postid);
		let user = req.params.username;
		const collection = db.collection('Posts');
		collection.findOne({ username: user, postid: pid }, (err, item)=>{
			if(item!=null){
				let json_obj = new Object();
				json_obj.title = item.title;
				json_obj.body = item.body;
				json_obj.created = item.created;
				json_obj.modified = item.modified;
				res.status(200);
				res.send(json_obj);
				
			}
			else {
				res.status(404);
				res.send("404"); //to be done
			}

		})
	})
	.post((req, res) =>{
		
	})
	.put((req, res) =>{
		
	})
	.delete((req, res) =>{
		let pid = parseInt(req.params.postid);
		let user = req.params.username;
		const collection = db.collection('Posts');
		collection.deleteOne({username: user, postid: pid}, (err, item)=>{
			if(item!=null){
				res.status(204);
				res.send("204 no content");
			}else{
				res.status(400);
				res.send("400");
			}
		})
		
	})
app.get('/api/:username', (req, res)=>{
	let user = req.params.username;
	const collection = db.collection('Posts');
	collection.find({username: user}).toArray((err,items)=>{
		let json_obj = new Object();
		json_obj.username = user;
		json_obj.posts =  items;
		res.status(200);
		res.send(json_obj);
	});
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
