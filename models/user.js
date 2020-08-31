var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			unique: true,
			required: true,
			index: true,
		},
		email: {
			type: String,
			unique: true,
			required: true,
			index: true,
		},
		name: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			minlength: 6,
		},
		about: {
			type: String,
			minlength: 25,
		},
		avatar: {
			type: String,
			default:
				'https://images.unsplash.com/photo-1594007759138-855170ec8dc0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=334&q=80',
		},
		articles: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Article',
			},
		],
		isAdmin: { type: Boolean, default: false },
	},
	{
		timestamps: true,
	}
);
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
