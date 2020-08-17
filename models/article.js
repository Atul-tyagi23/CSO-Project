var mongoose = require('mongoose');

// things will need to be changed later
var articleSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			index: true,
			required: true,
		},
		body: {},
		featuredPhoto: {
			data: Buffer,
			contentType: String,
		},
		category: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('Article', articleSchema);


// body={} means any time of data
// category will be multiple a blog van lie in more than 1 cat