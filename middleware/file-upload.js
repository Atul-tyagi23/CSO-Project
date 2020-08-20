const multer = require('multer');

const fileUpload = multer({
	// limit of file
	limits: 1024 * 1024 * 5, // 5MB
	storage: multer.diskStorage({
		destination: (req, file, cb) => {
			cb(null, 'uploads/images');
		},
		// if the above one gives error try with this one
		// destination: path.join(__dirname, '/uploads/images'),
		filename: (req, file, cb) => {
			cb(null, `${Date.now()}` + path.extname(file.originalname));
		},

		fileFilter: (req, file, cb) => {
			if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png' || file.mimetype === 'image/jpg') {
				cb(null, true);
			} else {
				cb(null, false);
			}
		},
	}),
});

module.exports = fileUpload;
