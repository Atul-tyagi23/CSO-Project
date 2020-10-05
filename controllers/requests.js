const mongoose = require("mongoose");
const slugify = require("slugify");

const User = require("../models/user");
const Category = require("../models/category");
const Article = require("../models/article");
const Request = require("../models/requests");

exports.createRequest = async (req, res) => {
  const { title, impPoints, desc } = req.body;

  let generatedSlug = slugify(title.toLowerCase());

  let user;
  try {
    user = await User.findById(req.userData.id);
  } catch (error) {
    return res.status.json({ error: error.message || "Server Error" });
  }

  if (!user) {
    return res.status(404).json({
      error:
        "Unable to create request as the user doesn't exist. Please register yourself first",
    });
  }

  let isRequestThere;
  try {
    isRequestThere = await Request.findOne({ slug: generatedSlug })
      .lean()
      .exec();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

  if (isRequestThere) {
    return res.status(400).json({
      message:
        "Request with same title already exists. Please change the title",
    });
  }

  let newRequest = new Request({
    title,
    slug: generatedSlug,
    impPoints,
    desc,
    postedBy: req.userData.id,
  });
  let savedRequest;
  try {
    savedRequest = await newRequest.save();
  } catch (error) {
    return res.status(500).json({ error: error });
  }

  return res
    .status(200)
    .json({ message: "Request sent successfully", savedRequest });
};

exports.allRequests = async (req, res) => {
  let requests;
  try {
    requests = await Request.find({})
      .populate("postedBy", "name email username avatar")
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error in fetching requests" });
  }

  return res.status(200).json({ requests });
};
