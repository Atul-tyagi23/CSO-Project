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

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());





var port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log('Yelp camp has started');
})