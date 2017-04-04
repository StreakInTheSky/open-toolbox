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
const {Tool, Category} = require('./model');

// WEB

app.get('/edit-listing/:itemId', (req, res) => {
	res.cookie('item-id', req.params.itemId);
	res.sendFile(path.resolve(__dirname, 'public/edit-listing/index.html'));
})
// END WEB

// API

function categoryCheckIsValid(req, res, categories) {
	function lookupCategories(entry) {
		for(let i=0; i < categories.length; i++) {
			if (categories[i].category === entry) {
				return true;
			}
		}
		return false;
	};

	let checked = req.body.category.map(lookupCategories);

	for(let i = 0; i < checked.length; i++) {
		if (checked[i] === false) {
			const message = `\`${req.body.category[i]}\` is not a valid category`
			console.error(message);
			res.status(400).send(message);
			return false;
		}
	}
	return true;
}

// GET categories to be used for testing
app.get('/categories', (req, res) => {
	Category
	.find()
	.exec()
	.then(Categories => res.json(
		Categories.map(category => category.apiRepr())
	))
	.catch(
		err => {
			console.error(err);
			res.status(500).json({message: 'Internal server error'});
		});
	})

// // GET all listings with a limit of 10 results
// app.get('/tools', (req, res) => {
// 	Tool
//     .find()
//     .limit(10)
//     .exec()
//     .then(tools => {
//       res.json({
//         tools: tools.map(
//           (tool) => tool.apiRepr())
//       });
//     })
//     .catch(
//       err => {
//         console.error(err);
//         res.status(500).json({message: 'Internal server error'});
//     });
// })

// GET queryable listings
app.get('/tools', (req, res) => {
    const filters = req.query;
    const queryableFields = ['category', 'toolName'];
    queryableFields.forEach(field => {
        if (req.query[field]) {
            filters[field] = req.query[field];
        }
    });
    Tool
        .find(filters)
        .exec()
        .then(Tools => res.json(
            Tools.map(tool => tool.apiRepr())
        ))
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'})
        });
});

// can also request by ID
app.get('/tools/:id', (req, res) => {
  Tool
    .findById(req.params.id)
    .exec()
    .then(tool =>res.json(tool.apiRepr()))
    .catch(err => {
      console.error(err);
        res.status(500).json({message: 'Internal server error'})
    });
});

app.post('/tools', (req, res) => {
	//gets list of categories from categories db
	Category.find().exec().then(categories => { postTool(categories); })

	//posts new document into tools db
 	function postTool(categories) {
		const requiredFields = ['category', 'toolName', 'description', 'rate'];

		for (let i=0; i<requiredFields.length; i++) {
		  const field = requiredFields[i];
		  if (!(field in req.body)) {
		    const message = `Missing \`${field}\` in request body`
		    console.error(message);
		    return res.status(400).send(message);
		  }
		}

		if (req.body.category && categoryCheckIsValid(req, res, categories)){
			return executePost(req, res);
		}
	}

	function executePost(req, res) {
		Tool
			.create({
				category: req.body.category,
				rented: false,
				disabled: false,
				toolName: req.body.toolName,
				description: req.body.description,
				rate: req.body.rate,
				datePosted: Date(),
				availability: req.body.availability,
				images: req.body.images})
			.then( tool => {
						console.log("Success!")
						res.status(201).json(tool.apiRepr())
					})
			.catch(err => {
				console.error(err);
				res.status(500).json({message: 'Internal server error'});
			});
	}
});

app.put('/tools/:id', (req, res) => {
	Category.find().exec().then(categories => { putInfo(categories); })

	let toUpdate = {};

	function putInfo(categories) {
		if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
	    const message = (
	      `Request path id (${req.params.id}) and request body id ` +
	      `(${req.body.id}) must match`);
	    console.error(message);
	    res.status(400).json({message: message});
	  }

	  const updateableFields = ['toolName', 'categories', 'description', 'rate', 'images', 'disabled', 'rented', 'availability'];

	  updateableFields.forEach(field => {
	    if (field in req.body) {
	      toUpdate[field] = req.body[field];
	    }
	  });

		if (!(req.body.category) || (req.body.category && categoryCheckIsValid(req, res, categories))){
			return executePut(req, res);
		}

		const message = `\`${req.body.category[i]}\` is not a valid category`
		console.error(message);
		return res.status(400).send(message);
	}

	function executePut(req, res) {
	  Tool
	    .findByIdAndUpdate(req.params.id, {$set: toUpdate})
	    .exec()
	    .then(tool => {
							res.status(204).json(tool.apiRepr())
						})
	    .catch(err => res.status(500).json({message: 'Internal server error'}));
	}
});

app.delete('/tools/:id', (req, res) => {
  Tool
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(() => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }

      server = app.listen(port, () => {
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
