const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { decodeToken } = require('../helpers/auth');

let middlewareObj = {};

middlewareObj.checkUserOwnership = async (req, res, next) => {
// //	Is user logged in ?
// 	if(req.isAuthenticated()){
// 	    let foundUser ;
// 	    try{
// 	        foundUser = await User.findById(req.params.id);
// 	    }
// 	    catch(err){
// 	        return res.status(500).json({ message: 'Could not update user' });
// 	    }
// 	    // Does User own this page ?
// 	    if (!foundUser) {
// 	        return res.status(500).json({ message: 'Error in updating user' });
// 	    }
// 	    if(foundUser._id.equals(req.user._id))
// 	    {
// 	        next();
// 	    }
// 	    else {
// 	        return res.status(400).json({ error: 'You do not have permission to do that' });
// 	    }
// 	}
// 	else {
// 	    return res.status(400).json({ error: 'You do not have permission to do that!' });
// 	}
next();
 
 };

middlewareObj.extractAuthToken = async (req, res, next) => {
	let token;

	// console.log(req.headers);
	try {
		token = req.header('authorization'); // Bearer token
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
