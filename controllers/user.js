const express = require('express'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = require('../models/user'),
	localStrategy = require('passport-local'),
	userModule = require('../controllers/user');

// Get all users
exports.getAllUsers = (req, res) => {
	// find all users
	User.find({}).then(
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

var cloudinary = require('cloudinary');
cloudinary.config({
	cloud_name: 'dr6pkartq',
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Handling Signup

exports.newUser = async (req, res) => {
	let image_url ;
	if (req.file) {
		let result; 
	try{
		result = await cloudinary.v2.uploader.upload(req.file.path);
	 }
	 catch(error){
		return res.status(500).json({ error: 'Server error' });
	 }
	 image_url = result.secure_url;}


	const newUser = new User({
		username: req.body.username,
		name: req.body.name,
		email: req.body.email,
		avatar: image_url,
	});
	if (req.body.adminCode == 'adarsh_noob') {
		newUser.isAdmin = true;
	}

	User.findOne({ email: req.body.email }).exec((err, sameUser) => {
		if (err) {
			return res.status(500).json({ error: 'Server error' });
		} // checking if same email exists in DB or not
		if (sameUser) {
			return res.status(400).json({ error: `Email address already registered. Please login instead` });
		} else {
			User.register(newUser, req.body.password, (err, user) => {
				if (err) {
					return res.status(500).json({ error: 'Cannot create user' });
				} else {
					passport.authenticate('local')(req, res, () => {
						return res.status(200).json({ message: 'Welcome to website: ' + req.body.username });
					});
				}
			});
		}
	});
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
			return res.status(200).json({ message: 'Successfully logged In!!' });
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
	try{
		result =	await cloudinary.v2.uploader.upload(req.file.path);
	 }
	 catch(error){
		return res.status(500).json({ error: 'Server error' });
	 }
	 image_url = result.secure_url;
	//   result =	await cloudinary.v2.uploader.upload(req.file.path, function (err, result) {
	// 		if (err) {
	// 		}
	// 		image_url = result.secure_url;
	// 	});
	}

	let update = {
		name: req.body.name,
		username: req.body.username,
		avatar: image_url,
		about: req.body.about
	};

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
	let result;
	if (req.body.oldpassword) {
		try {
			result = await updatedUser.changePassword(req.body.oldpassword, req.body.newpassword);
		} catch (error) {
			if (error.message === 'Password or username is incorrect') {
				return res.status(400).json({ error: 'Please enter valid old password to reset your password' });
			}
		}
	}
	return res.status(200).json({ message: 'Updated user credentials successfully.' });

	// console.log('update is', update);

	// await User.findById(req.params.id, (err, foundUser) => {
	// 	// storing previous user image
	// 	if (err) {
	// 		return res.status(500).json({ error: err });
	// 	}
	// 	image_url = foundUser['avatar'];
	// });

	// if (req.file) {
	// 	await cloudinary.v2.uploader.upload(req.file.path, function (err, result) {
	// 		if (err) {
	// 			return res.status(500).json({ error: 'Server error' });
	// 		}
	// 		image_url = result.secure_url;
	// 	});
	// }

	// update = {
	// 	name: req.body.name,
	// 	username: req.body.username,
	// 	image: image_url,
	// };

	// // find and update
	// User.findByIdAndUpdate(req.params.id, update, (err, updatedUser) => {
	// 	// console.log(`update is`, update);
	// 	console.log(updatedUser);
	// 	if (err) {
	// 		console.log(err);
	// 		return res.status(500).json({ error: err.message });
	// 	} else {
	// 		if (req.body.oldpassword) {
	// 			// Password update
	// 			updatedUser.changePassword(req.body.oldpassword, req.body.newpassword, (err) => {
	// 				if (err) {
	// 					console.log(err);
	// 					return res.status(500).json({ error: err.message });
	// 				}
	// 			});
	// 		}

	// 		return res.status(200).json({ message: 'Successfully updated' });
	// 	}
	// });
};
