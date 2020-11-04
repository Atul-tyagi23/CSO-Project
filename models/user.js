var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      minlength: 6,
    },
    about: {
      type: String,
      minlength: 25,
    },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/dr6pkartq/image/upload/v1599653070/cuwmqrs5zilbmkchik3i.png",
    },
    articles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Article",
      },
    ],
    contactNumber: {
      type: String,
    },
    github: {
      type: String,
    },

    linkedin: {
      type: String,
    },

    instagram: {
      type: String,
    },

    twitter: {
      type: String,
    },

    website: {
      type: String,
    },
    isVerified: {
      type:Boolean, default:false
    },
    isAdmin: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
