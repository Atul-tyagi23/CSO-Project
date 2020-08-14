const express = require('express'),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	Article = require('./models/article'),
	passport = require('passport');
	localStrategy = require('passport-local');
	User = require('./models/user');
 
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// importing routes
const categoryRoutes = require('./routes/categories');
const userRoutes = require('./routes/user');

// using routes
app.use("/api",categoryRoutes);
app.use( '/user' ,userRoutes);
 

// PASSPORT CONFIGURATION 

app.use(require("express-session")({
    secret: "Secrets of Prisons",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




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

 