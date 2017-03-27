const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const {app, runServer, closeServer} = require('../server');
const {Tool, Category} = require('../model');
const {TEST_DATABASE_URL} = require('../config');

const should = chai.should();

chai.use(chaiHttp);

function generateToolName() {
	const tools = ["screwdriver", "hammer", "drill"];

	return tools[Math.floor(Math.random() * tools.length)];
}

function generateCategories() {
	let categories = ["home tools", "power tools", "automechanics", "gardening", "carpentry", "metal-working", "plumbing"];

	function pickCategory() {
		return categories.splice(Math.floor(Math.random() * categories.length), 1).join();
	}

	let randomCategories = [];
	let randomNumber = Math.floor(Math.random() * (categories.length - 1) + 1);

	for (var i=0; i < randomNumber; i++) {
		randomCategories.push(pickCategory());
	}
	// console.log(randomCategories);
	return randomCategories;
}

function generateRate() {
	return Math.floor(Math.random() * (10000 - 1) + 1);
}

function generateAvailability() {
	return [{start: Date.parse('Mar 1, 2017'), end: Date.parse('Apr 1, 2017')}];
}

function generateBoolean() {
	return Math.round(Math.random()) ? true : false;
}

function generateTool() {
	const toolName = generateToolName()

	return {
		category: generateCategories(),
		rented: generateBoolean(),
		disabled: generateBoolean(),
		toolName: toolName,
		description: faker.lorem.sentence(),
		rate: generateRate(),
		datePosted: Date.parse('Feb 15, 2017'),
		availability: generateAvailability(),
		images: [toolName + '1.jpg']
	}
}

function seedToolData(number) {
  console.info('seeding tool data');
	return new Promise((success, failure) => {
    let tools = [];

    for (let i = 0; i < number; i++) {
      tools.push(generateTool());
    }

    Tool.insertMany(tools).then(() => {
      success()
    });
  });
}

function seedCatagoryData() {
  return new Promise((success, failure) => {
    categories = [{category: "home tools"}, {category: "power tools"}, {category: "automechanics"}, {category: "gardening"}, {category: "carpentry"}, {category: "metal-working"}, {category: "plumbing"}];
    Category.insertMany(categories).then(() => {
      success()
    });
  })
}

function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}


describe('Open-toolbox API resource', function() {

  // we need each of these hook functions to return a promise
  // otherwise we'd need to call a `done` callback. `runServer`,
  // `seedRestaurantData` and `tearDownDb` each return a promise,
  // so we return the value returned by these function calls.
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function(done) {
    const categoryPromise = seedCatagoryData();
    const toolPromise = seedToolData(20);
    Promise.all([categoryPromise, toolPromise]).then(() => {
      done()
    });
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  })

  // this makes sure that the app can connect to the categories collection
  // which is needed to evaluate categories that are sent to the app
  describe('GET for categories', function() {

    it('should return all categories', function() {
      let res;
      return chai.request(app)
        .get('/categories')
        .then(function(_res) {
          res = _res;
          res.should.have.status(200);
          return Category.count();
        })
        .then(function(count) {
          res.body.should.have.length.of(count);
        })
    })
  })

	describe('GET endpoint', function() {

    it('should return all tool listings', function() {
      // strategy:
      //    1. get back all tools returned by GET request to `/tools`
      //    2. prove res has right status, data type
      //    3. prove the number of lisitngs we got back is equal to number
      //       in db.
      //
      // need to have access to mutate and access `res` across
      // `.then()` calls below, so declare it here so can modify in place
      let res;
      return chai.request(app)
        .get('/tools')
        .then(function(_res) {
          // so subsequent .then blocks can access resp obj.
          res = _res;
          res.should.have.status(200);
          // otherwise our db seeding didn't work
          res.body.should.have.length.of.at.least(1);
          return Tool.count();
        })
        .then(function(count) {
          res.body.should.have.length.of(count);
        });
    });


    it('should return tool listings with right fields and correct data when requested by id', function() {
      // Strategy: Get back all tools, and ensure they have expected keys

      let resTool;
      return chai.request(app)
        .get('/tools')
        .then(function(res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          res.body.should.have.length.of.at.least(1);

          res.body.forEach(function(tool) {
            tool.should.be.a('object');
            tool.should.include.keys("id", "category", "rented", "disabled", "toolName", "description", "rate", "datePosted", "availability", "images")
          });

          resTool = res.body[0];

          // return tool listing when requested by id;
          return chai.request(app)
                 .get(`/tools/${resTool.id}`)
                 .then(function(res) {
                   return res.body;
                 });
        })
        .then(function(tool) {
          resTool.id.should.equal(tool.id);
					for (let i = 0; i < tool.length; i++) {
						resTool.category[i].should.equal(tool.category[i]);
					}
          resTool.rented.should.equal(tool.rented);
          resTool.disabled.should.equal(tool.disabled);
          resTool.toolName.should.contain(tool.toolName);
          resTool.description.should.equal(tool.description);
          resTool.rate.should.equal(tool.rate);
          Date.parse(resTool.datePosted).should.equal(Date.parse(tool.datePosted));
					for (let i = 0; i < tool.availability.lenth; i++) {
						Date.parse(resTool.availability[i].start).should.equal(Date.parse(tool.availability[i].start));
						Date.parse(resTool.availability[i].end).should.equal(Date.parse(tool.availability[i].end));
					}
					for (let i = 0; i < tool.images.length; i++) {
						resTool.images[i].should.equal(tool.images[i]);
					}
        });
    });
  });

	describe('POST endpoint', function() {
	    // strategy: make a POST request with data,
	    // then prove that the tool listing we get back has
	    // right keys, and that `id` is there (which means
	    // the data was inserted into db)
	    it('should add a new tool listing', function() {

	      const newTool = generateTool();

	      return chai.request(app)
	        .post('/tools')
	        .send(newTool)
	        .then(function(res) {
	          res.should.have.status(201);
	          res.should.be.json;
	          res.body.should.be.a('object');
	          res.body.should.include.keys(
	            "id", "category", "rented", "disabled", "toolName", "description", "rate", "datePosted");
	          // cause Mongo should have created id on insertion
	          res.body.id.should.not.be.null;
						for (let i = 0; i < res.body.category.length; i++) {
							res.body.category[i].should.equal(newTool.category[i]);
						}
						res.body.rented.should.equal(false);
	          res.body.disabled.should.equal(false);
	          res.body.toolName.should.contain(newTool.toolName);
	          res.body.description.should.equal(newTool.description);
	          res.body.rate.should.equal(newTool.rate);
	          // Date.parse(res.body.datePosted).should.equal(newTool.datePosted);
	          return Tool.findById(res.body.id);
	        })
					.then(function(tool) {
						for (let i = 0; i < tool.length; i++) {
							tool.category[i].should.equal(newTool.category[i]);
						}
	          tool.rented.should.equal(false);
	          tool.disabled.should.equal(false);
	          tool.toolName.should.contain(newTool.toolName);
	          tool.description.should.equal(newTool.description);
	          tool.rate.should.equal(newTool.rate);
	          // Date.parse(newTool.datePosted).should.equal(Date.parse(newTool.datePosted));
						for (let i = 0; i < tool.availability.lenth; i++) {
							Date.parse(tool.availability[i].start).should.equal(Date.parse(newTool.availability[i].start));
							Date.parse(tool.availability[i].end).should.equal(Date.parse(newTool.availability[i].end));
						}
						for (let i = 0; i < tool.images.length; i++) {
							tool.images[i].should.equal(newTool.images[i]);
						}
	        });
	    });
	  });

    describe('PUT endpoint', function() {

      // strategy:
      //  1. Get an existing tool listing from db
      //  2. Make a PUT request to update that listing
      //  3. Prove listing returned by request contains data we sent
      //  4. Prove tool listing in db is correctly updated
      it('should update fields you send over', function() {
        const updateData = generateTool();

        return Tool
          .findOne()
          .exec()
          .then(function(tool) {
            updateData.id = tool.id;

            // make request then inspect it to make sure it reflects
            // data we sent
            return chai.request(app)
              .put(`/tools/${tool.id}`)
              .send(updateData);
          })
          .then(function(res) {
            res.should.have.status(204);

            return Tool.findById(updateData.id).exec();
          })
          .then(function(tool) {
            for (let i = 0; i < tool.length; i++) {
              updateData.category[i].should.equal(tool.category[i]);
            }
            updateData.rented.should.equal(tool.rented);
            updateData.disabled.should.equal(tool.disabled);
            updateData.toolName.should.contain(tool.toolName);
            updateData.description.should.equal(tool.description);
            updateData.rate.should.equal(tool.rate);
            // Date.parse(updateData.datePosted).should.equal(Date.parse(tool.datePosted));
            for (let i = 0; i < tool.availability.lenth; i++) {
              Date.parse(updateData.availability[i].start).should.equal(Date.parse(tool.availability[i].start));
              Date.parse(updateData.availability[i].end).should.equal(Date.parse(tool.availability[i].end));
            }
            for (let i = 0; i < tool.images.length; i++) {
              updateData.images[i].should.equal(tool.images[i]);
            }
          });
        });
    });

    describe('DELETE endpoint', function() {
      // strategy:
      //  1. get a tool listening
      //  2. make a DELETE request for that listing's id
      //  3. assert that response has right status code
      //  4. prove that listing with the id doesn't exist in db anymore
      it('delete a tool listing by id', function() {

        let tool;

        return Tool
          .findOne()
          .exec()
          .then(function(_tool) {
            tool = _tool;
            return chai.request(app).delete(`/tools/${tool.id}`);
          })
          .then(function(res) {
            res.should.have.status(204);
            return Tool.findById(tool.id).exec();
          })
          .then(function(_tool) {
            // when a variable's value is null, chaining `should`
            // doesn't work. so `_restaurant.should.be.null` would raise
            // an error. `should.be.null(_restaurant)` is how we can
            // make assertions about a null value.
            should.not.exist(_tool);
          });
      });
    });
});
