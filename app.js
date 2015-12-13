var http = require("http");
var express = require('express');
var app = express();
var path = require('path');
var port = process.env.PORT || 3000;

var index = path.join(__dirname + '/index.html');

app.use(express.static(__dirname));

app.get('/', function(req, res){
  res.sendFile(index);
});

var server = http.createServer(app);
server.listen(port);
console.log("listening on port " + port);
