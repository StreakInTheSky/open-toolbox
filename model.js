const mongoose = require('mongoose');

const toolSchema = mongoose.Schema({
	category: [{type: String, required: true}],
	rented: {type: String, required: true},
	disabled: {type: Boolean, required: true},
	toolName: {type: String, required: true},
	description: {type: String, required: true},
	rate: {type: Number, required: true},
	datePosted: {type: Date, required: true},
	availability: [
		{
			start: Date,
			end: Date
		}
	],
	images: [String]
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
  	images: this.images
  }
}

const Tool = mongoose.model('Tool', toolSchema);

module.exports = {Tool};
