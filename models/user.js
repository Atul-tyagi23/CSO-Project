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

		// koi default photo daal dio
		// ek folder bna le defaults usme ek folder aur usme ek default avatar
		// phir path.join() se uska path aur isme daal dio
		// wrna koi url se utha lio
		// par sabme same ho bas ye yaad rkhio
		avatar: { type: String, default: '' },
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
