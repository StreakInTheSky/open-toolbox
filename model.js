const mongoose = require('mongoose');
const dateRangeSchema = require('./schemas/dateRangeSchema');

const toolSchema = mongoose.Schema({
	category: [{type: String, required: true}],
	rented: {type: Boolean, required: true},
	disabled: {type: Boolean, required: true},
	toolName: {type: String, required: true},
	description: {type: String, required: true},
	rate: {type: Number, required: true},
	datePosted: {type: Date},
	availability: dateRangeSchema,
	rentedDates: [dateRangeSchema],
	image: String
})

// *virtuals* (http://mongoosejs.com/docs/guide.html#virtuals)
// allow us to define properties on our object that manipulate
// properties that are stored in the database. Here we use it
// to generate a human readable string based on the address object
// we're storing in Mongo.
// restaurantSchema.virtual('addressString').get(function() {
//   return `${this.address.building} ${this.address.street}`.trim()});
//
// // this virtual grabs the most recent grade for a restaurant.
// restaurantSchema.virtual('grade').get(function() {
//   const gradeObj = this.grades.sort((a, b) => {return b.date - a.date})[0] || {};
//   return gradeObj.grade;
// });

function computeUserStart(date) {
	var givenDate = new Date(date);
	if (givenDate < new Date()) {
		return new Date();
	} else {
		return givenDate;
	}
}

toolSchema.methods.apiRepr = function() {
  return {
    id: this._id,
    category: this.category,
  	rented: this.rented,
  	disabled: this.disabled,
  	toolName: this.toolName,
  	description: this.description,
  	rate: this.rate,
  	datePosted: this.datePosted,
  	availability: this.availability,
		userStart: computeUserStart(this.availability.start),
		rentedDates: this.rentedDates,
  	image: this.image
  }
}

const categorySchema = mongoose.Schema({
	category: String
})

categorySchema.methods.apiRepr = function() {
	return {
		id: this._id,
		category: this.category
	}
}

const Tool = mongoose.model('Tool', toolSchema);
const Category = mongoose.model('Category', categorySchema);

module.exports = {Tool, Category};
