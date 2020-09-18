const slugify = require("slugify");
const cloudinary = require("cloudinary");

const Article = require("../models/article");

cloudinary.config({
  cloud_name: "dr6pkartq",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.createArticle = async (req, res) => {
  const { title, categories, body, mdesc } = req.body;

  let isArticleThere;
  let generatedSlug = slugify(title);

  let category = categories.split(",");

  try {
    isArticleThere = await Article.findOne({ slug: generatedSlug })
      .lean()
      .exec();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

  if (isArticleThere) {
    return res
      .status(400)
      .json({
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
    await createdArticle.save();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error in creating article" });
  }

  return res
    .status(201)
    .json({
      message: `Article named "${title}" published successfully.`,
      createdArticle,
    });
};

exports.allArticles = async (req, res) => {
  let articles;
  try {
    articles = await Article.find({}).lean().exec();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error in fetching articles" });
  }

  return res.status(200).json({ articles });
};
