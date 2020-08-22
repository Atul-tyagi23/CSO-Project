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
  api_secret: process.env.CLOUDINARY_API_SECRET
});
       			
			
// Handling Signup

exports.newUser = async (req, res) => {
	var image_url;
	 
	await cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
		if(err) {
			return res.status(500).json({ error: 'Server error' });

		} 
		image_url = result.secure_url;
        

	});
     const newUser = new User({ username: req.body.username, name: req.body.name, email: req.body.email, avatar: image_url });
	if (req.body.adminCode == 'adarsh_noob') {
		newUser.isAdmin = true;
	}
	User.findOne({ email: req.body.email }).exec((err, sameUser) => {
		if (err) {
			return res.status(500).json({ error: 'Server error' });
		} // checking if same email exists in DB or not
		if (sameUser) {
			return res
				.status(400)
				.json({ error: `Email address already registered. Please login instead` });
		} else {
			User.register(newUser, req.body.password, (err, user) => {
				if (err) {
					return res.status(500).json({ error: 'Server error' });
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
