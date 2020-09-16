const { check } = require('express-validator');

let Exp = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
let facebookExp = /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%.\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%\+.~#?&//=]*)/ig;
 

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

const userEditValidator = [

	check("facebook").optional({checkFalsy: true}).matches(facebookExp).withMessage('Not a fb valid Url'),
	check("github").optional({checkFalsy: true}).matches(Exp).withMessage('Not a valid Url'),
	check("twitter").optional({checkFalsy: true}).matches(Exp).withMessage('Not a valid Url'),
	check("instagram").optional({checkFalsy: true}).matches(Exp).withMessage('Not a valid Url'),

	check('username')
	.optional({checkFalsy: true, })
	.isLength({min:3}).withMessage('Min 3 characters required'), 
	check('name')
	.optional({checkFalsy: true, }),
	check('about')
	.optional({checkFalsy: true, }),
	check('contactNumber')
	.optional({checkFalsy: true, })
	.isDecimal()
	.withMessage('Must contain only Numeric character')
	.isLength({min:3}).withMessage('Invalid Contact Number'), 

	check('oldpassword')
	.optional({nullable: true, }) 
	.isLength({ min: 6 })
	.withMessage('Wrong Password'),

	check('newpassword')
	.optional({nullable: true, }) 
	.isLength({ min: 6 })
	.withMessage('Password must be atleast 6 characters long')
	.custom((value, {req}) => (value === req.body.confirmpassword))
	.withMessage('Passwords do not match')
	.custom((value, {req}) => (req.body.oldpassword))
	.withMessage('Please Enter Current password'),

	check('confirmpassword', 'New password not given!').custom((value, {req}) => (req.body.newpassword)),
 	
 
];



module.exports = { signupValidator, loginValidator, userEditValidator };
