const fileUpload = require('../middleware-file-upload');

const express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = require('../models/user'),
	localStrategy = require('passport-local'),
	userModule = require('../controllers/user');

require('dotenv').config();

var multer = require('multer');
const { update } = require('../models/user');
var storage = multer.diskStorage({
	filename: function (req, file, callback) {
		callback(null, Date.now() + file.originalname);
	},
});
var imageFilter = function (req, file, cb) {
	// accept image files only
	if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
		return cb(new Error('Only image files are allowed!'), false);
	}
	cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter });

// All users
router.get('/', userModule.getAllUsers);

// Sign up route
 router.post('/register', upload.single('image'), userModule.newUser);

// Edit user info route

router.put('/:id', upload.single('image'), userModule.updateUserInfo);

// Login route
router.post('/login', userModule.doLogin);

// Logout route
router.get('/logout', userModule.doLogout);

module.exports = router;
