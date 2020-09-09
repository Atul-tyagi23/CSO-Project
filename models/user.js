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
				'https://res.cloudinary.com/dr6pkartq/image/upload/v1599653070/cuwmqrs5zilbmkchik3i.png',
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
