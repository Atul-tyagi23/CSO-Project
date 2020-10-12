const slugify = require("slugify");
const cloudinary = require("cloudinary");
const mongoose = require("mongoose");

const User = require("../models/user");
const Category = require("../models/category");
const Article = require("../models/article");
const defaultImagesArray = require("../helpers/defaultImages");
const { decodeToken } = require("../helpers/auth");

cloudinary.config({
  cloud_name: "dr6pkartq",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.createArticle = async (req, res) => {
  const { title, categories, body, mdesc } = req.body;

  let user;
  try {
    user = await User.findById(req.userData.id);
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Server error occurred. Try again later",
    });
  }

  if (!user) {
    return res.status(404).json({
      message:
        "Unable to create article as the user doesn't exist. Please register yourself first",
    });
  }

  let isArticleThere;
  let generatedSlug = slugify(title.toLowerCase());

  let category = categories.split(",");

  try {
    isArticleThere = await Article.findOne({ slug: generatedSlug })
      .lean()
      .exec();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

  if (isArticleThere) {
    return res.status(400).json({
      message:
        "An article with same title already exists. Please change the name",
    });
  }

  let image_url;
  if (req.file) {
    let result;
    try {
      result = await cloudinary.v2.uploader.upload(req.file.path);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
    image_url = result.secure_url;
  }

  if (!image_url) {
    image_url = defaultImagesArray[category[0]];
  }

  //console.log("body is");
  //console.log(body);
  //console.log("body is");
  let z;

  try {
    z = JSON.parse(body);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: "Bad body" });
  }

  let createdArticle = new Article({
    title,
    slug: generatedSlug,
    mdesc,
    body,
    category,
    postedBy: req.userData.id,
    featuredPhoto: image_url,
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdArticle.save({ session: sess });
    user.articles.push(createdArticle);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error in creating article" });
  }

  return res.status(201).json({
    message: `Article named "${title}" published successfully.`,
    createdArticle,
  });
};

exports.allArticles = async (req, res) => {
  let articles;
  try {
    articles = await Article.find({})
      .populate("category")
      .populate("postedBy", "name email username avatar")
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error in fetching articles" });
  }

  return res.status(200).json({ articles });
};

exports.articlesOfOneCategory = async (req, res) => {
  let paramsCategory =
    req.params.category[0].toUpperCase() + req.params.category.slice(1);

  let givenCategory;
  try {
    givenCategory = await Category.findOne({ name: paramsCategory });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Server down. Please try again later" });
  }

  if (!givenCategory) {
    return res.status(404).json({ error: "No Such Category exists" });
  }

  let articles;
  try {
    articles = await Article.find({ category: { $in: [givenCategory._id] } })
      .select("-body")
      .populate("category")
      .populate("postedBy", "-password")
      .exec();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  // if (articles.length == 0) {
  //   return res
  //     .status(404)
  //     .json({ message: "No Articles for this Category yet" });
  // }
  // console.log(articles);
  return res.status(200).json({ articles });
};

exports.articleBySlug = async (req, res) => {
  let slg = req.params.slug;
  let article;
  try {
    article = await Article.findOne({ slug: slg })
      .populate("category")
      .populate("postedBy", "-password -articles -isAdmin")
      .exec();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

  if (!article) {
    return res.status(404).json({ message: "Article not found " });
  }

  // adding this to fetch the article only not similar ones
  if (req.headers.fetchtype === "Single") {
    return res.status(200).json({ article });
  }

  let category;
  category = article.category;
  let articles;
  try {
    articles = await Article.find({
      category: { $in: category },
      slug: { $ne: article.slug },
    })
      .select("slug title category featuredPhoto")
      .populate("category")
      .populate("postedBy", "name username")
      .limit(4)
      .exec();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

  let dToken;
  if (!req.headers.token) {
    return res.status(200).json({ article, articles });
  }

  try {
    dToken = decodeToken(req.headers.token);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "There occurred a problem in fecthing the article" });
  }
  if (!dToken) {
    return res.status(200).json({ article, articles });
  }
  let isFav = false;

  isFav = article.favouritedBy.includes(dToken.id);

  return res.status(200).json({ article, articles, isFav });
};

exports.editOneArticle = async (req, res) => {
  let user;
  const { categories, body, mdesc, featuredPhoto } = req.body;

  try {
    user = await User.findById(req.userData.id);
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Server error occurred. Try again later",
    });
  }

  if (!user) {
    return res.status(404).json({
      message:
        "Unable to create article as the user doesn't exist. Please register yourself first",
    });
  }

  let image_url;
  if (req.file) {
    let result;
    try {
      result = await cloudinary.v2.uploader.upload(req.file.path);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
    image_url = result.secure_url;
  }

  if (!image_url) {
    image_url = featuredPhoto;
  }
  let category = categories.split(",");

  let update = {
    body,
    image_url,
    mdesc,
    category,
    featuredPhoto: image_url,
  };

  let updatedArticle;
  try {
    updatedArticle = await Article.findOneAndUpdate(
      {
        slug: req.params.slug,
        postedBy: req.userData.id,
      },
      update,
      { new: true }
    )
      .lean()
      .exec();
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Could not update article. Please try again later" });
  }

  if (!updatedArticle) {
    return res.status(404).json({
      error:
        "The article either doesn't exist or you are updating someone else's article.",
    });
  }

  return res.status(200).json({ message: "Succesfully updated the article" });
};

exports.deleteOneAricle = async (req, res) => {
  let slug = req.params.slug;
  let article;
  try {
    article = await Article.findOne({ slug }).populate("postedBy").exec();
  } catch (error) {
    return res.status(500).json({ error: error.message || "Server Error" });
  }

  if (!article) {
    return res.status(404).json({ error: "No article found " });
  }

  if (article.postedBy.id !== req.userData.id) {
    return res
      .status(403)
      .json({ error: "You are not allowed to perform this operation" });
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await article.remove({ session: sess });
    article.postedBy.articles.pull(article);
    await article.postedBy.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    return res.status(500).json({
      error:
        error.message || "Unable to delete the article. Please try again later",
    });
  }

  return res.status(200).json({ message: "Deleted article succesfully" });
};

// Route for favourite articles

exports.favouritedBy = async (req, res) => {
  let user;
  try {
    user = await User.findOne({ username: req.userData.username }).exec();
  } catch (error) {
    return res
      .status(503)
      .json({ message: "Server Unreachable. Try again later" });
  }

  let article;
  let slug = req.params.slug;
  try {
    article = await Article.findOne({ slug }).exec();
  } catch (error) {
    return res.status(500).json({ error: error.message || "Server Error" });
  }

  if (!article) {
    return res.status(404).json({ error: "No article found " });
  }

  // check if req.userData._id exists in article.favs
  function check(fav) {
    return fav.equals(user._id);
  }
  let foundUser;
  try {
    foundUser = await article.favouritedBy.some(check);
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Looks like some error occurred. Try again later",
    });
  }
  let flag;
  if (foundUser) {
    flag = 0;
    try {
      await article.favouritedBy.pull(user._id);
    } catch (error) {
      return res.status(500).json({
        error:
          error.message || "Unable to remove from favourite, please try later",
      });
    }
  } else {
    flag = 1;
    try {
      await article.favouritedBy.push(user._id);
    } catch (error) {
      return res.status(500).json({
        error: error.message || "Unable to add to favourite, please try later",
      });
    }
  }

  let savedArticle;
  try {
    savedArticle = article.save();
  } catch (error) {
    if (!flag) {
      return res.status(500).json({
        error: error.message || "Unable to add to favourite, please try later",
      });
    } else {
      return res.status(500).json({
        error:
          error.message || "Unable to remove from favourite, please try later",
      });
    }
  }
  if (!savedArticle) {
    return res.status(404).json({
      error:
        "The article either doesn't exist or you are updating someone else's article.",
    });
  }
  if (flag == 1)
    return res
      .status(200)
      .json({ message: "Succesfully added to favourites", addedFav: true });
  else {
    return res
      .status(200)
      .json({
        message: "Succesfully removed from favourites",
        addedFav: false,
      });
  }
};
