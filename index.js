'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const xhub = require('express-x-hub');
const app = express();
var crypto = require('crypto');

const PORT = process.env.PORT || 8080;

app.use(xhub({algorithm: 'sha1', secret: process.env.APP_SECRET }));
app.use(bodyParser.json());

var received_updates = [];

app.get('/', function(req, res) {
  res.send('<pre>' + JSON.stringify(received_updates, null, 2) + '</pre>');
});

app.get('/webhooks', function(req, res) {
  if (req.params('hub.mode') != 'subscribe'
      || req.params('hub.verify_token') != process.env.VERIFY_TOKEN) {
    console.log('get error');
    res.sendStatus(401);
    return;
  }

  res.send(req.params('hub.challenge'));
});

app.post('/webhooks', function(req, res) {
  console.log('req verify token: ' + req.headers['  ']);
  var hmac = crypto.createHmac("sha1", process.env.APP_SECRET);
  hmac.update(res, "utf-8");
  console.log('vf: ' + "sha1=" + hmac.digest("hex"));
  var isValid = req.isXHubValid();
  console.log('isValid: ' + isValid);
  // if (!req.isXHubValid()) {
  //   console.log('Received webhooks update with invalid X-Hub-Signature');
  //   res.sendStatus(401);
  //   return;
  // }
  console.log(JSON.stringify(req.body, null, 2));
  received_updates.unshift(req.body);
  res.sendStatus(200);
});

app.listen(PORT, function() {
  console.log('Starting webhooks server listening on port:' + PORT);
});
