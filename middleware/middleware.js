const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { decodeToken } = require('../helpers/auth');

let middlewareObj = {};

middlewareObj.checkUserOwnership = async (req, res, next) => {
	if (
		req.userData.id.toString() === (req.params.id && req.params.id.toString()) ||
		req.userData.username.toString() === (req.params.username && req.params.username.toString())
	) {
		next();
	} else {
		return res.status(403).json({ error: "You don't have permission to do that" });
	}
};

middlewareObj.extractAuthToken = async (req, res, next) => {
	let token;

	// console.log(req.headers);
	try {
		token = req.header('authorization'); //token
		if (!token) {
			return res.status(401).json({ error: 'Unauthorized User ' });
		}
		let decodedToken = decodeToken(token);
		if (!decodedToken) {
			return res.status(401).json({ error: 'Not Authenticated' });
		}
		req.userData = { ...decodedToken };
 	} catch (error) {
		return res.status(500).json({ error: 'Authentication failed. Please try again later' });
	}
	next();
};

module.exports = middlewareObj;
