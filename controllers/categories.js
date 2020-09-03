const Category = require('../models/category');

exports.getAllCategories = (req, res) => {

	// find all categories
	Category.find({}).lean().then((categories) => {

		// if error then 4xx or 5xx codes
		if (!categories) {
			return res.status(500).json({ error: 'Server error' });
		}
		// if length is 0 then 404 error as not found 
		if (categories.length === 0) {
			return res.status(404).json({ error: 'No categories found' });
		}
		// if found then send with 200 code the categories in json form
		return res.status(200).json({
			categories,
		}); 
	  }, (err)=>{

		// if error then 4xx or 5xx codes
		if (err) {
			return res.status(500).json({ error: 'Server error' });
		}

	  }

	);
};

exports.createCategory = (req, res) => {
	// request data from user
 
	// find a category
	Category.findOne({ name: req.body.name }).lean().exec((err, category) => {
		// send back response with 4xx or 5xx error codes if error occurs
		if (err) {
			return res.status(500).json({ error: 'Server error' });
		}

		// category creation not possible as it already exists
		if (category) {
			return res
				.status(400)
				.json({ error: `Category named ${name} already exists. Cannot create category with same name` });
		} else {
			// create a new category
			const createdCat = new Category({ name: req.body.name, });
			createdCat.save((err, result) => {
				// if error then 4xx or 5xx
				if (err) {
					return res.status(500).json({
						error: 'An internal server error occurred. Try again later',
						err: err,
					});
				} else {
					// error
					if (!result) {
						return res.status(500).json({
							error: 'Cannot create category currently. Please try again later',
						});
					} else {
						// send the created caetgory succesffuly with 200 status code
						return res.status(200).json({
							message: 'Category created succesfully',
							category: result.name,
						});
					}
				}
			});
		}
	});
};
