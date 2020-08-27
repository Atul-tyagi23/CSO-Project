const express = require('express'),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	Article = require('./models/article'),
	passport = require('passport');
localStrategy = require('passport-local');
(User = require('./models/user')), (cors = require('cors'));
require('dotenv').config()

const app = express();
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// PASSPORT CONFIGURATION
// importing routes
 


app.use(
	require('express-session')({
		secret: 'Secrets of Prisons',
		resave: false,
		saveUninitialized: false,
	})
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// importing routes
const categoryRoutes = require('./routes/categories');
const userRoutes = require('./routes/user');

// using routes
app.use('/api', categoryRoutes);

app.use('/api/user', userRoutes);

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
app.post('/uploads', upload.single('file'), uploadsController); 

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
