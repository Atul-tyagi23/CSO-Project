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
				'https://images.discordapp.net/avatars/503791976706211840/f7e48fdce47da3cc760a7eff444f93cc.png?size=512',
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
