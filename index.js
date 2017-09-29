var mysql      = require('mysql');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser')
var session = require('express-session')

var app = express()
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.use(session({ secret: 'I_AM_5ECRE7', resave: true, saveUninitialized: false, cookie: { path: '/', httpOnly: true, maxAge: null }}))
var connection = mysql.createConnection({
		host     : 'localhost',
		user     : 'root',
		password : '12345678',
		database : 'lunch'
	});
connection.connect();

function checkLogin(req, res, next) {
  if (!req.session.username) {
    res.redirect('/login')
  } else {
    next();
  }
}

var restaurant_list = function () {
	connection.query('SELECT * FROM restaurant', function(err, results, fields) {
		if (err) { 
			throw err
		}
		if (results.length !== 0) {
			console.log(results)
			return results
		}else {
			console.log('nothing')
			return []
		}	
	});
}

var item_list = function (res_id) {
	connection.query('SELECT * FROM item WHERE restaurant_id = ?', res_id, function(err, results, fields) {
		if (err) { 
			throw err
		}
		if (results.length !== 0) {
			console.log(results)
			return results
		}else {
			console.log('nothing')
			return []
		}	
	});
}

var type_list = function (res_id) {
	connection.query('SELECT item_type.* FROM item_type WHERE item_type.id in (SELECT item.type_id from item WHERE item.res_id = ?)', res_id, function(err, results, fields) {
		if (err) { 
			throw err
		}
		if (results.length !== 0) {
			console.log(results)
			return results
		}else {
			console.log('nothing')
			return []
		}	
	});
}



// var ac = {
// 	name: 'dragon',
// 	password: '12345678',
// 	email: 'dragon.chen@104.com.tw'
// }
// connection.query('INSERT INTO account SET ?', ac, function(err, results, fields) {
//   if (err) throw err;
//   console.log('rows: ', results);
//   console.log('fields: ', fields);
// });
// connection.query('SELECT * FROM account WHERE id = ?', '1', function(err, results, fields) {
//   if (err) throw err;
//   console.log('rows: ', results);
//   console.log('fields: ', fields);
// });
// connection.query('INSERT INTO account SET ?', ac, function(err, rows, fields) {
//   if (err) throw err;
//   console.log('rows: ', rows);
//   console.log('fields: ', fields);
// // });
// connection.end();



app.get('/', checkLogin, function(req, res){
	res.end('logined')
})

app.get('/login', function(req, res){
	if (!req.session.username) {
		console.log('username session: ' + req.session.username)
		res.render('login', {})
	}else {
		res.redirect('/')
	}
})

app.get('/logout', function(req, res){
	delete req.session.username;
  res.redirect('/login');
})

app.post('/login', function(req, res){
	console.log(req.body)
	console.log('username session: ' + req.session.username)
	
	connection.query('SELECT * FROM account WHERE name = ?', req.body.username, function(err, results, fields) {
		if (err) { 
			throw err
		}
		if (results.length !== 0) {
			if (results[0].password == req.body.password) {
				req.session.username = req.body.username
				res.end('success');
			}else {
				res.end('forbidden')
			}
		}else {
			res.end('forbidden')
		}	
	});
	// connection.end();
})

app.get('/create', checkLogin,function(req, res){
	var res_list = restaurant_list()
	console.log(res_list)
	res.end('123')
})

app.listen(8888, () => {
	console.log('server up on port 8888')
})
