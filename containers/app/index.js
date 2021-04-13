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