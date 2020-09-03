const jwt = require('jsonwebtoken');

const createToken = (data) => {
	return jwt.sign(data, process.env.JWTSECRET, { expiresIn: '1d' });
};

module.exports = createToken;
