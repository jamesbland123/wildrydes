'use strict';

const express = require('express');
const mysql = require('mysql'); 
const bcrypt = require("bcrypt");

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

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
    console.log("Connected!");
    
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
            // todo set authorization header with jwt
            res.redirect('/ride');
          }
          else {
            res.json({ "signin" : "bad username or password" });
          }
        }
      }
    );
  }); 
});

app.get('/ride', (req, res) => {
  res.sendFile('public/ride.html', { root: __dirname });
});

app.post('/ride', (req, res) => {
  res.json(fleet[Math.floor(Math.random() * fleet.length)]);
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);