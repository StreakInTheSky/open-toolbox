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
		rented: Math.round(Math.random()),
		disabled: Math.round(Math.random()),
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
  return new Promise((catdog, bacteria) => {
    categories = [{category: "home tools"}, {category: "power tools"}, {category: "automechanics"}, {category: "gardening"}, {category: "carpentry"}, {category: "metal-working"}, {category: "plumbing"}];
    Category.insertMany(categories).then(() => {
      catdog()
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

	// describe('GET endpoint', function() {
	// 	it('should get all tool listings', function() {
	// 		return chai.request(app)
	// 			.get('/tools')
	// 			.then(function(res) {
	// 				res.should.have.status(200);
	// 			});
	// 	});
	// });

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


    it('should return tool listings with right fields', function() {
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
          return Tool.findById(resTool.id);
        })
        .then(function(tool) {

          resTool.id.should.equal(tool.id);
        //   resTool.category.should.equal(tool.name);
        //   resTool.cuisine.should.equal(tool.cuisine);
        //   resTool.borough.should.equal(tool.borough);
        //   resTool.address.should.contain(tool.address.building);
        //
        //   resTool.grade.should.equal(tool.grade);
        // });
    });
  });
});
