const express = require('express'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = require('../models/user'),
	localStrategy = require('passport-local'),
	userModule = require('../controllers/user');

const cloudinary = require('cloudinary');
const { createToken, decodeToken } = require('../helpers/auth');
const slugify = require('slugify');

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

	const newUser = new User({
		username: req.body.username,
		name: req.body.name,
		email: req.body.email,
		avatar: image_url,
	});
	if (req.body.adminCode == 'adarsh_noob') {
		newUser.isAdmin = true;
	}

	let sameUser;

	try {
		sameUser = await User.findOne({ email: req.body.email }).exec();
	} catch (error) {
		return res.status(500).json({ error: 'Server error' });
	}

	if (sameUser) {
		return res.status(400).json({ error: `Email address already registered. Please login instead` });
	}

	User.register(newUser, req.body.password, (err, newUser) => {
		if (err) {
			return res.status(500).json({ error: 'Cannot create user' });
		} else {
			passport.authenticate('local')(req, res, () => {
				let token = createToken({ id: newUser.id, username: newUser.username, email: newUser.email });
				return res.status(200).json({ message: 'Welcome to website: ' + req.body.username, token });
			});
		}
	});

	// User.findOne({ email: req.body.email })
	// 	.lean()
	// 	.exec((err, sameUser) => {
	// 		if (err) {
	// 			return res.status(500).json({ error: 'Server error' });
	// 		} // checking if same email exists in DB or not
	// 		if (sameUser) {
	// 			return res.status(400).json({ error: `Email address already registered. Please login instead` });
	// 		} else {
	// 			User.register(newUser, req.body.password, (err, newUser) => {
	// 				if (err) {
	// 					return res.status(500).json({ error: 'Cannot create user' });
	// 				} else {
	// 					passport.authenticate('local')(req, res, () => {
	// 					 	let token = createToken({ id: newUser.id, username: newUser.username });
	// 						return res.status(200).json({ message: 'Welcome to website: ' + req.body.username, token });
	// 					});
	// 				}
	// 			});
	// 		}
	// 	});
};

// Handling login
exports.doLogin = (req, res, next) => {
	passport.authenticate('local', function (err, user, info) {
		if (err) {
			return res.status(500).json({ error: err.message });
		}
		if (!user) {
			return res.status(401).json({ error: 'Incorrect username or password' });
		}
		req.logIn(user, function (err) {
			if (err) {
				return res.status(500).json({ error: err });
			}
			let token = createToken({ id: newUser.id, username: newUser.username, email: newUser.email });
			return res.status(200).json({ token, message: 'Successfully logged In!!' });
		});
	})(req, res, next);
};

// Handling logout

exports.doLogout = (req, res) => {
	// clear req.user and clear the login session (if any)
	req.logOut();
	return res.status(200).json({ message: 'Logged you out!' });
};

// Updating user info
exports.updateUserInfo = async (req, res) => {
	let image_url;

	let existingUser;

	try {
		existingUser = await User.findById(req.params.id);
	} catch (error) {
		return res.status(503).json({ message: 'Server Unreachable. Try again later' });
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
	if (!req.body.username) update.username = existingUser['username'];
	if (!req.body.name) update.name = existingUser['name'];
	if (!req.body.about) update.about = existingUser['about'];

	let updatedUser;

	try {
		updatedUser = await User.findByIdAndUpdate(req.params.id, update, { new: true }).exec();
	} catch (error) {
		// console.log(error);
		return res.status(500).json({ message: 'Could not update user' });
	}

	if (!updatedUser) {
		return res.status(500).json({ message: 'Error in updating user' });
	}
	let result, token;
	if (req.body.oldpassword) {
		try {
			result = await updatedUser.changePassword(req.body.oldpassword, req.body.newpassword);
		} catch (error) {
			console.log(error);
			console.log(req.body.oldpassword);
			console.log(req.body.newpassword);
			if (error.message === 'Password or username is incorrect') {
				return res.status(400).json({ error: 'Password or username is incorrect' });
			} else {
				return res.status(400).json({ error: error.message });
			}
		}
	}
	token = createToken({ id: updatedUser.id, username: updatedUser.username, email: updatedUser.email });
	return res.status(200).json({ message: 'Updated user credentials successfully.', token });
};
