var mongoose = require("mongoose");

// things will need to be changed later
var articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      index: true,
      required: true,
    },
    slug: {
      type: String,
      index: true,
      required: true,
      unique: true,
    },
    mdesc: {
      type: String,
      required: true,
    },
    body: {},
    featuredPhoto: {
      type: String,
    },
    category: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    favouritedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Article", articleSchema);

// body={} means any time of data
// category will be multiple a blog van lie in more than 1 cat
// slug will be used in seo(if done)
// blog mdesc will be used to display starting 200 chars of blog
// for now required is false will be true later
