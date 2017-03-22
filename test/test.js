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
	let tools = [];

	for (let i = 0; i < number; i++) {
		tools.push(generateTool());
	}

	return tools;
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

  beforeEach(function() {
		categories = [{category: "home tools"}, {category: "power tools"}, {category: "automechanics"}, {category: "gardening"}, {category: "carpentry"}, {category: "metal-working"}, {category: "plumbing"}];
    Tool.insertMany(seedToolData(20));
		Category.insertMany(categories);
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  })

	describe('Test', function() {
		it('should give status 200', function() {
			return chai.request(app)
				.get('/tools')
				.then(function(res) {
					res.should.have.status(200);
				});
		});
	});
});
