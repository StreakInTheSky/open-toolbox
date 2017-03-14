var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var app = express();
var path = require('path');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cookieParser());

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {Tool} = require('./model');

// WEB
app.get('/', (req, res) => {
	res.json({test: true});
})

app.get('/edit-listing/:itemId', (req, res) => {
	res.cookie('item-id', req.params.itemId);
	res.sendFile(path.resolve(__dirname, 'public/edit-listing/index.html'));
})
// END WEB

// API
app.get('/tools', (req, res) => {
	Tool
    .find()
    .limit(10)
    .exec()
    .then(tools => {
      res.json({
        tools: tools.map(
          (tool) => tool.apiRepr())
      });
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
})

let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }

      app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};
