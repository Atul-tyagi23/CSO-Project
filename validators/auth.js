const { check } = require('express-validator');
 

const signupValidator = [
	check('name').notEmpty().withMessage('Name field cannot be empty'),
	check('username').notEmpty().withMessage('No username given'),
	check('email').isEmail().normalizeEmail().withMessage('Email not Valid'),
	check('password')
		.notEmpty()
		.withMessage('Password must be given')
		.isLength({ min: 6 })
		.withMessage('Password must be atleast 6 characters long'),
];

const loginValidator = [
	check('username').notEmpty().withMessage('No username given'),
	check('password')
	.notEmpty()
	.withMessage('Password must be given')
	.isLength({ min: 6 })
	.withMessage('Password must be atleast 6 characters long'),
];




module.exports = { signupValidator, loginValidator};
