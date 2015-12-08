var express = require('express');
var app = express();
var path = require('path');

var index = path.join(__dirname + '/views/index.html');

app.use(express.static(__dirname));

app.get('/', function(req, res){
  res.sendFile(index);
});

app.listen(3000);
