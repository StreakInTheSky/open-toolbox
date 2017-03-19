const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const {app, runServer, closeServer} = require('../server');
const {Tool} = require('../model');
const {PORT, TEST_DATABASE_URL} = require('../config');

const should = chai.should();

chai.use(chaiHttp);

describe('Test', function() {
	it('should give status 200', function() {
		return chai.request(app)
			.get('/')
			.then(function(res) {
				res.should.have.status(200);
			});
	});
});
