const express = require('express'),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	Article = require('./models/article');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// importing routes
const categoryRoutes = require('./routes/categories');

// using routes
app.get("/api",categoryRoutes)



const PORT = process.env.PORT || 8000;

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
