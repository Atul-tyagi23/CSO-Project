var express = require('express'),
    bodyParser = require('body-parser'),
    mongoose = require("mongoose"),
    Article = require('./models/article');

    

var app = express();

// Connecting our app to our Data-Base and setting up DB
mongoose.connect('mongodb://localhost:27017/cso', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connected to DB!'))
    .catch(error => console.log(error.message));

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/", (req, res)=>{
    //
});








var PORT = process.env.PORT || 8000 ;
app.listen(PORT, ()=>{
    console.log("Server has started");
})