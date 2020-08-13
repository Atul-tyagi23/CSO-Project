var mongoose = require('mongoose');


// things will need to be changed later
var articleSchema = new mongoose.Schema({
	title: {
		type: String,
		index: true,
	},
	body: {},
	featuredPhoto: {
		data: Buffer,
		contentType: String,
	},
});

module.exports = mongoose.model('Article', articleSchema);
