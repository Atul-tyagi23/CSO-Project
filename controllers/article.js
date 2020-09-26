const slugify = require("slugify");
const cloudinary = require("cloudinary");
const mongoose = require("mongoose");

const User = require("../models/user");
const Article = require("../models/article");
const defaultImagesArray = require("../helpers/defaultImages");

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
  let givenCategory = req.params.category;
  let articles;
  try {
    articles = await Article.find({ category: { $in: [givenCategory] } })
      .select("-body")
      .populate("category")
      .populate("postedBy", "name email username avatar")
      .exec();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  if (articles.length == 0) {
    return res
      .status(404)
      .json({ message: "No Articles for this Category yet" });
  }
  return res.status(200).json({ articles });
};

exports.articleBySlug = async (req, res) => {
  let slg = req.params.slug;
  let article;
  try {
    article = await Article.findOne({ slug: slg })
      .populate("category")
      .populate("postedBy", "name email username avatar")
      .exec();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

  if (!article) {
    return res.status(404).json({ message: "Article not found " });
  }
  return res.status(200).json({ article });
};
