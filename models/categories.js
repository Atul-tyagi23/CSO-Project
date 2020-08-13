
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true,
			index: true,
			minlength: 3,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('Category', categorySchema);