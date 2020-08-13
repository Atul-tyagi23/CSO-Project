const express = require('express'),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
<<<<<<< HEAD
	Article = require('./models/article'),
	passport = require('passport');
	localStrategy = require('passport-local');
	User = require('./models/user');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');



// importing routes
const categoryRoutes = require('./routes/categories');
const userRoutes = require('./routes/user');

// using routes
app.use("/api",categoryRoutes);
app.use(userRoutes);



 
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
// Connecting our app to our Data-Base and setting up DB

mongoose.connect('mongodb://localhost:27017/cso', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connected to DB!'))
    .catch(error => console.log(error.message));
mongoose.set('useCreateIndex', true);
mongoose.set("useFindAndModify", false);


// PASSPORT CONFIGURATION 

app.use(require("express-session")({
    secret: "Secrets of Prisons",
    resave: false,
    saveUninitialized: false
}));
=======
	Article = require('./models/article');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// importing routes
const categoryRoutes = require('./routes/categories');

// using routes
app.use("/api",categoryRoutes)
>>>>>>> 5df0a51cc10933bf0fd52cc3ed854fbf0baeec80

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const PORT = process.env.PORT || 8000;

<<<<<<< HEAD



var port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log('Yelp camp has started');
})
=======
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
// Connecting our app to our Data-Base and setting up DB
mongoose
	.connect('mongodb://localhost:27017/cso', {
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
>>>>>>> 5df0a51cc10933bf0fd52cc3ed854fbf0baeec80
