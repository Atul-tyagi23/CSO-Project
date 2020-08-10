var mongoose = require("mongoose");
  
var UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    articles : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Article"
        }

    ],
    isAdmin: {type: Boolean, default: false}
});

 
module.exports = mongoose.model("User", UserSchema);