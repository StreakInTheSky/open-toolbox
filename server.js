var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var app = express();
var path = require('path');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cookieParser());
app.listen(process.env.PORT || 8080);
console.log('App listening on http://localhost:' + (process.env.PORT || 8080));

app.get('/', (req, res) => {
	res.json({test: true});
})

app.get('/edit-listing/:itemId', (req, res) => {
	res.cookie('item-id', req.params.itemId);
	res.sendFile(path.resolve(__dirname, 'public/edit-listing/index.html'));
})

module.exports = {app};
