var mongoose = require('mongoose');


// things will need to be changed later
var articleSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			index: true,
			required: true
		},
		body: {
			type: String,
			required: true
		},
		featuredPhoto: {
			data: Buffer,
			contentType: String,
		},
		category:{
			type: String,
			required:true,
			index: true,
		}

	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('Article', articleSchema);
