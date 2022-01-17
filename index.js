'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const xhub = require('express-x-hub');
const app = express();
const axios = require('axios');


const PORT = process.env.PORT || 8080;

app.use(xhub({algorithm: 'sha1', secret: process.env.APP_SECRET }));
app.use(bodyParser.json());

var received_updates = [];

app.get('/', function(req, res) {
  res.send('<pre>' + JSON.stringify(received_updates, null, 2) + '</pre>');
});

app.get('/webhooks', function(req, res) {
  console.log('get /webhooks');
  if (req.params('hub.mode') != 'subscribe'
      || req.params('hub.verify_token') != process.env.VERIFY_TOKEN) {
    console.log('get error');
    res.sendStatus(401);
    return;
  }

  console.log('hub.challenge: ' + req.params('hub.challenge'));
  res.send(req.params('hub.challenge'));
});

app.post('/webhooks', function(req, res) {
  // if (!req.isXHubValid()) {
  //   console.log('Received webhooks update with invalid X-Hub-Signature');
  //   res.sendStatus(401);
  //   return;
  // }
  const body = req.body;
  console.log(JSON.stringify(body, null, 2));
  received_updates.unshift(body);

  console.log(body['entry'][0]);

  axios.post('http://test-wa-webhook-server.herokuapp.com:' + PORT + '/v1/messages', {
    "preview_url": true,
    "recipient_type": "individual",
    "to": "wamid.HBgLMTU3MTg4ODAxNjcVAgASGBQzQTA3MzBENTY5MEQ5Q0Y3NDA4RAA=",
    "type": "text",
    "text": {
      "body": "yo what's up!!!"
    }
  })
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });

  res.sendStatus(200);
});

app.listen(PORT, function() {
  console.log('Starting webhooks server listening on port:' + PORT);
});
