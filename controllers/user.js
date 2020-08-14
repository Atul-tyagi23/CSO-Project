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
				return res.status(500).json({ message: 'Server error' });
			}
			// if length is 0 then 404 error as not found
			if (users.length === 0) {
				return res.status(404).json({ message: 'No users  found' });
			}

			// if found then send with 200 code the users  in json form
			return res.status(200).json({
				users,
			});
		},
		(err) => {
			// if error then 4xx or 5xx codes
			if (err) {
				return res.status(500).json({ message: err });
			}
		}
	);
};

// Handling Signup
exports.newUser = (req, res) => {
	const newUser = new User({ username: req.body.username, name: req.body.name, email: req.body.email });
	if (req.body.adminCode == 'adarsh_noob') {
		newUser.isAdmin = true;
	}

	User.findOne({ email: req.body.email }).exec((err, sameUser) => {
		if (err) {
			return res.status(500).json({ message: 'Server error' });
		} // checking if same email exists in DB or not
		if (sameUser) {
			return res
				.status(400)
				.json({ message: `Email address already registered. Please login instead` });
		} else {
			User.register(newUser, req.body.password, (err, user) => {
				if (err) {
					return res.status(500).json({ message: err.message });
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
			return res.status(500).json({ message: err.message });
		}

		if (!user) {
			return res.status(401).json({ message: 'Incorrect username or password' });
		}

		req.logIn(user, function (err) {
			if (err) {
				return res.status(500).json({ message: err });
			}
			return res.status(200).json({ message: 'Successfully loggen In!!' });
		});
	})(req, res, next);
};

// Handling logout

exports.doLogout = (req, res) => {
	// clear req.user and clear the login session (if any)
	req.logOut();
	return res.status(200).json({ message: 'Logged you out!' });
};
