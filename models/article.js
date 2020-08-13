var mongoose = require('mongoose');


// things will need to be changed later
var articleSchema = new mongoose.Schema({
	title: {
		type: String,
		index: true,
	},
<<<<<<< HEAD
	body: {type: String
	},
=======
	body: {},
>>>>>>> 5df0a51cc10933bf0fd52cc3ed854fbf0baeec80
	featuredPhoto: {
		data: Buffer,
		contentType: String,
	},
});

<<<<<<< HEAD
module.exports = mongoose.model('Article', articleSchema);
=======
module.exports = mongoose.model('Article', articleSchema);
>>>>>>> 5df0a51cc10933bf0fd52cc3ed854fbf0baeec80
