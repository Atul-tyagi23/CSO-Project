const express = require('express'),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	Article = require('./models/article');
 const helmet = require('helmet');
const User = require('./models/user');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));




// importing routes
const categoryRoutes = require('./routes/categories');
const userRoutes = require('./routes/user');
const articleRoutes = require('./routes/article');

// using routes
app.use('/api', categoryRoutes);

app.use('/api/user', userRoutes);

app.use('/api/article', articleRoutes);

// for multer upload of images
var multer = require('multer');
const { uploadsController } = require('./controllers/upload');
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

app.get('/uploads', (req, res) => {
	return res.status(200).json({ yes: 'working' });
});
app.post('/uploads', upload.single('image'), uploadsController);

const PORT = process.env.PORT || 8000;

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
// Connecting our app to our Data-Base and setting up DB

mongoose
	.connect(process.env.DATABASEURL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log('Connected to DB!');
		app.listen(PORT, () => {
			console.log('Server has started');
		});
	})
	.catch((error) => console.log(error.message));
