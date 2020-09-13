const express = require('express'),
	mongoose = require('mongoose'),
	User = require('../models/user'),
	userModule = require('../controllers/user');
const cloudinary = require('cloudinary');
const { createToken, decodeToken } = require('../helpers/auth');
const slugify = require('slugify');
const bcrypt = require('bcryptjs');

// Get all users
exports.getAllUsers = (req, res) => {
	// find all users
	User.find({})
		.lean()
		.then(
			(users) => {
				// if error then 4xx or 5xx codes
				if (!users) {
					return res.status(500).json({ error: 'Server error' });
				}
				// if length is 0 then 404 error as not found
				if (users.length === 0) {
					return res.status(404).json({ error: 'No users  found' });
				}
				// if found then send with 200 code the users  in json form
				return res.status(200).json({
					users,
				});
			},
			(err) => {
				// if error then 4xx or 5xx codes
				if (err) {
					return res.status(500).json({ error: err });
				}
			}
		);
};

cloudinary.config({
	cloud_name: 'dr6pkartq',
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Handling Signup

exports.newUser = async (req, res) => {
	// Chech for same email
	let sameUser;

	try {
		sameUser = await User.findOne({ email: req.body.email }).exec();
	} catch (error) {
		return res.status(500).json({ error: 'Server error' });
	}

	if (sameUser) {
		return res.status(400).json({ error: `Email already registered. Please login with different email` });
	}
	//Check for same Username

	try {
		sameUser = await User.findOne({ username: req.body.username }).exec();
	} catch (error) {
		return res.status(500).json({ error: 'Server error' });
	}

	if (sameUser) {
		return res.status(400).json({ error: `Username  already registered. Please login with different username` });
	}

	let image_url;
	if (req.file) {
		let result;
		try {
			result = await cloudinary.v2.uploader.upload(req.file.path);
		} catch (error) {
			return res.status(500).json({ error: 'Server error' });
		}
		image_url = result.secure_url;
	}

	//Hash password
	let hashedPassword;
	try {
		hashedPassword = await bcrypt.hash(req.body.password, 12);
	} catch (error) {
		return res.status(500).json({ error: error });
	}

	const newUser = new User({
		username: req.body.username,
		name: req.body.name,
		email: req.body.email,
		avatar: image_url,
		password: hashedPassword,
	});
	let savedUser;
	try {
		savedUser = newUser.save();
	} catch (error) {
		res.status(500).json({ error: 'Cannot create user!' });
	}

	let token = createToken({
		id: newUser.id,
		username: newUser.username,
		email: newUser.email,
		avatar: newUser.avatar,
	});

	return res.status(200).json({ message: 'Successfully Signed up!', token });

	// User.register(newUser, req.body.password, (err, newUser) => {
	// 	if (err) {
	// 		return res.status(500).json({ error: 'Cannot create user' });
	// 	} else {
	// 		passport.authenticate('local')(req, res, () => {
	// 			let token = createToken({
	// 				id: newUser.id,
	// 				username: newUser.username,
	// 				email: newUser.email,
	// 				avatar: newUser.avatar,
	// 			});
	// 			return res.status(200).json({ message: 'Welcome to website: ' + req.body.username, token });
	// 		});
	// 	}
	// });
};

// Handling login
exports.doLogin = async (req, res, next) => {
	let sameUser;

	try {
		sameUser = await User.findOne({ username: req.body.username }).exec();
	} catch (error) {
		return res.status(500).json({ error: 'Server error' });
	}
	if (!sameUser) {
		return res.status(400).json({ error: 'User with given username does not exists' });
	}

	//Password is correct ?
	let validUser;
	try {
		validUser = await bcrypt.compare(req.body.password, sameUser.password);
	} catch (error) {
		return res.status(500).json({ error: 'Server error' });
	}
	if (!validUser) {
		return res.status(400).json({ error: 'Incorrect password' });
	}

	let token = createToken({
		id: sameUser.id,
		username: sameUser.username,
		email: sameUser.email,
		avatar: sameUser.avatar,
	});

	return res.status(200).json({ message: 'Logged you in!', token });

	// passport.authenticate('local', function (err, user, info) {
	// 	if (err) {
	// 		return res.status(500).json({ error: err.message });
	// 	}
	// 	if (!user) {
	// 		return res.status(401).jsoPOSTe,
	// 			email: user.email,
	// 			avatar: user.avatar,
	// 		});
	// 		return res.status(200).json({ token, message: 'Successfully logged In!!', avatar: user.avatar });
	// 	});
	// })(req, res, next);
};

// Handling logout

exports.doLogout = (req, res) => {
	// clear req.user and clear the login session (if any)
	// req.logOut();
	return res.status(200).json({ message: 'Logged you out!' });
};

// Updating user info
exports.updateUserInfo = async (req, res) => {
	let image_url;
	//console.log(req.body);

	let existingUser;

	try {
		existingUser = await User.findOne({ username: req.params.username }).exec();
	} catch (error) {
		return res.status(503).json({ message: 'Server Unreachable. Try again later' });
	}
	// Verifying password

	let validUser;
	if (req.body.oldpassword) {
		try {
			validUser = await bcrypt.compare(req.body.oldpassword, existingUser.password);
		} catch (error) {
			return res.status(500).json({ error: 'Server error' });
		}
		if (!validUser) {
			return res.status(400).json({ error: 'Incorrect password' });
		}
	}

	if (!existingUser) {
		return res.status(404).json({ message: 'User not found' });
	} else {
		image_url = existingUser['avatar'];
	}

	if (req.file) {
		let result;
		try {
			result = await cloudinary.v2.uploader.upload(req.file.path);
		} catch (error) {
			return res.status(500).json({ error: 'Server error' });
		}
		image_url = result.secure_url;
	}

	let update = {
		name: req.body.name,
		username: req.body.username,
		avatar: image_url,
		about: req.body.about,
	};
	let hashedPassword;
	if (req.body.newpassword) {
		//Hash new password
		try {
			hashedPassword = await bcrypt.hash(req.body.newpassword, 12);
		} catch (error) {
			return res.status(500).json({ error: error });
		}
		update.password = hashedPassword;
	}

	if (!req.body.username) update.username = existingUser['username'];
	if (!req.body.name) update.name = existingUser['name'];
	if (!req.body.about) update.about = existingUser['about'];

	let updatedUser;

	try {
		updatedUser = await User.findOneAndUpdate({ username: existingUser.username }, update, { new: true }).exec();
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: 'Could not update user' });
	}

	if (!updatedUser) {
		return res.status(500).json({ message: 'Error in updating user' });
	}
	let result, token;
	token = createToken({
		id: updatedUser.id,
		username: updatedUser.username,
		email: updatedUser.email,
		avatar: updatedUser.avatar,
	});
	return res.status(200).json({ message: 'Updated user credentials successfully.', token });
};

// Get single user detail

exports.getDetails = async (req, res) => {
	let foundUser;
	try {
		foundUser = await User.findOne({ username: req.params.username }).lean().exec();
	} catch (error) {
		return res.status(503).json({ message: 'Server Unreachable. Try again later' });
	}

	if (!foundUser) {
		return res.status(404).json({ message: 'User not found' });
	}
	let userInfo = {
		id: foundUser['_id'],
		username: foundUser['username'],
		name: foundUser['name'],
		email: foundUser['email'],
		about: foundUser['about'],
		image: foundUser['avatar'],
	};

	return res.status(200).json({ userInfo: userInfo });
};

// Changing user password
