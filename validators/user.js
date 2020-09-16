const { check } = require('express-validator');

let urlExp = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
let phoneExp = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/g;
let socialUsernameExp = /^[a-zA-Z0-9_.-]*$/;
let usernameExp = /^[a-zA-Z0-9_]*$/;

const userEditValidator = [
	check('facebook').optional({ checkFalsy: true }).matches(urlExp).withMessage('Not valid facebook url'),

	check('github').optional({ checkFalsy: true }).matches(socialUsernameExp).withMessage('Not valid github username'),

	check('twitter')
		.optional({ checkFalsy: true })
		.matches(socialUsernameExp)
		.withMessage('Not valid Twitter username'),

	check('instagram')
		.optional({ checkFalsy: true })
		.matches(socialUsernameExp)
		.withMessage('Not valid Instagram username'),

	check('username')
		.optional({ checkFalsy: true })
		.isLength({ min: 3 })
		.withMessage('Username length should be greater than 3')
		.matches(usernameExp)
		.withMessage('Min 3 characters required'),

	check('name').optional({ checkFalsy: true }),

	check('about')
		.optional({ checkFalsy: true })
		.isLength({ min: 25 })
        .withMessage('About description should be atleast 25 characters long'),
        
	check('contactNumber')
		.optional({ checkFalsy: true })
		.matches(phoneExp)
		.isLength({ max: 15 })
		.withMessage('Invalid Contact Number'),

	check('oldpassword')
		.optional({ nullable: true })
		.isLength({ min: 6 })
		.withMessage('Password length must be atleast 6 characters'),

	check('newpassword')
		.optional({ nullable: true })
		.isLength({ min: 6 })
		.withMessage('Password must be atleast 6 characters long'),
];

module.exports = { userEditValidator };
