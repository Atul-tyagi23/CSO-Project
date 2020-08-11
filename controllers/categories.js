const Category = require('../models/category');

exports.getAllCategories = async (req, res) => {
	try {
		let categories = await Category.find({});
	} catch (error) {
		return res.status(500).json({ message: 'Server error' });
	}

	if (!categories) {
		return res.status(500).json({ message: 'Server error' });
	}
	if (categories.length === 0) {
		return res.status(404).json({ message: 'No categories found' });
	}

	return res.status(200).json({
		categories,
	});
};
