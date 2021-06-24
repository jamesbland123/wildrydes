'use strict';

const express = require('express');
const mysql = require('mysql'); 
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';
const jwtSecret = "supersecret"

const db_con = mysql.createPool({
  host: "mysql",
  user: "root",
  password: "mypassword",
  database: "wildrydes",
  port: '3306'
});


// return fleet
const fleet = [
  {
      Name: 'Bucephalus',
      Color: 'Golden',
      Gender: 'Male',
  },
  {
      Name: 'Shadowfax',
      Color: 'White',
      Gender: 'Male',
  },
  {
      Name: 'Rocinante',
      Color: 'Yellow',
      Gender: 'Female',
  },
];

// App
const app = express();
app.use(express.static('public'))
// for parsing application/json
app.use(express.json()); 
// for parsing form data
app.use(express.urlencoded({ extended: true })); 
// cookies
app.use(cookieParser());


app.get('/', (req, res) => {
  res.sendFile('public/index.html', { root: __dirname });
});

app.get('/js/config.js', function (req, res) {
  res.type('.js');
  res.send(`window._config = {
    api: {
        invokeUrl: '${process.env.INVOKE_URL}' 
    }
  };`)
});

app.post('/register', function(req, res){
  db_con.getConnection(function(err,con) {
    if (err) throw err;
    console.log("Connected! mySQL register");
    
    // req.body has username and password
    req.body.password = bcrypt.hashSync(req.body.password , 10);
    const userDetails = req.body;
    let sql = 'INSERT INTO users SET ?';
    con.query(sql, userDetails, function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
    });
  });
  res.redirect('/sign-in');

});

app.get('/sign-in', (req, res) => {
  res.sendFile('public/signin.html', { root: __dirname });
});

app.post('/sign-in', (req, res) => {
  db_con.getConnection(function(err,con) {
    if (err) throw err;
    console.log("Connected! MySQL signin");

    con.query(
      'SELECT * FROM users WHERE username = ?', [req.body.username], (err, results) => {
        if (err) {console.log("signin connection error")}
    
        
        else if (results[0]) {
          console.log(results[0].password + " " + req.body.password);
          if (bcrypt.compareSync(req.body.password, results[0].password)) {
            var token = jwt.sign(
              {
              "username": req.body.password,
              "role": "user"
              }, jwtSecret, { expiresIn: '4h'}
            );
            res.cookie('auth_token', token, 
              {expires: new Date(Date.now() + 4 * 3600000)} ); // expires 4 hours
            res.redirect('/ride');
          }
          else {
            //res.json({ "signin" : "bad username or password" });
            console.log("Wrong password");
            res.status(200).json({ error: 'Wrong credentials' });
            //res.redirect('back');
            //res.send("Wrong password");
          }
        }
      }
    );
  }); 
});

app.get('/ride', (req, res) => {
  const authToken = req.cookies.auth_token;
  console.log("auth: " + authToken)
  // Missing token from cookie
  if (!authToken) {
    console.log("ride: no auth cookie token");
    res.clearCookie('auth_token');
    res.redirect('/sign-in');
  }
  else {
    var decoded = jwt.verify(authToken, jwtSecret);
    if (!decoded) {
      console.log("ride: bad token");
      res.clearCookie('auth_token');
      res.redirect('/sign-in');
    }
    // Token verification failed
    else {
      console.log("ride: token verified");
      res.sendFile('public/ride.html', { root: __dirname });
    }
  }
});

app.post('/ride', (req, res) => {
  console.log('unicorn data ' + JSON.stringify(req.body));
  var unicorn = fleet[Math.floor(Math.random() * fleet.length)];
  console.log('unicorn' + JSON.stringify(unicorn));
  
  db_con.getConnection(function(err,con) {
    if (err) throw err;
    console.log("Connected! MySQL signin");
    
    let sql = 'INSERT INTO unicorns SET ?';
    con.query(sql, unicorn, function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
    });
  });
  res.json(unicorn);
});

app.get('/logout', (req, res) => {
  res.clearCookie('auth_token');
  // todo: consider replacing with redirect to sign-in, but need to test.
  res.sendFile('public/signin.html', { root: __dirname });
});

app.get('/unicorns', (req, res) => {
  db_con.getConnection(function(err,con) {
    if (err) throw err;
    console.log("Connected! MySQL signin");

    con.query(
      'SELECT * FROM unicorns', (err, results) => {
        if (err) {console.log("bad connection to database")}
    
        res.json(results);
    
    });
  }); 
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);