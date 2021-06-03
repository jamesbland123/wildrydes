'use strict';

const express = require('express');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';


// App
const app = express();
app.use(express.static('public'))

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

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

//SQL
app.post('/register', (req, res) => {
  //req.email
  var mysql = require('mysql');
  console.log(req.body);
  res.send(req.body);

  var connection = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'user',
    password: 'mypassword',
    database: 'wildrydes'
  });
  
  ////reference https://github.com/mysqljs/mysql
  //Establishing a connection
  /*connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
  
    console.log('connected as id ' + connection.threadId);
  });
  
  console.log('second');
  connection.query('CREATE TABLE user (email varchar,password varchar)', function (error, results, fields) {
    if (error) throw error;
    // connected!
  });
  
  var inputEmail=  document.getElementById("emailInputRegister").value;
  var inputPassword = document.getElementById("passwordInputRegister").value;
  
  var post  = {email: inputEmail, password: inputPassword};
  
  connection.query('INSERT INTO user SET?', post, function (error, results, fields) {
    if (error) throw error;
    // connected!
  });*/

});
