const jwt = require('jsonwebtoken');

const createToken = (data) => {
	return jwt.sign(data, process.env.JWTSECRET, { expiresIn: '1d' });
};

const decodeToken = (token) => {
	try {
		const decodedToken = jwt.verify(token, process.env.JWTSECRET);
		return decodedToken;
	} catch (error) {
		return false;
	}
};

module.exports = { createToken, decodeToken };
