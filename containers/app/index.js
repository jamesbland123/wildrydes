'use strict';

const express = require('express');
var mysql = require('mysql'); 

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

var con = mysql.createConnection({
  host: "mysql",
  user: "root",
  password: "mypassword",
  database: "wildrydes",
  port: '3306'
});

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
    cognito: {
        userPoolId: '${process.env.POOL_ID}', 
        userPoolClientId: '${process.env.POOL_CLIENT_ID}', 
        region: '${process.env.REGION}' 
    },
    api: {
        invokeUrl: '${process.env.INVOKE_URL}' 
    }
  };`)
});

app.post('/register', function(req, res){
  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    
    const userDetails = req.body;
    let sql = 'INSERT INTO users SET ?';
    con.query(sql, userDetails, function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
    });
  });
  res.send("Thanks for registering");
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);