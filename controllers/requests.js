const mongoose = require("mongoose");
const slugify = require("slugify");

const User = require("../models/user");
const Category = require("../models/category");
const Article = require("../models/article");
const Request = require("../models/requests");

exports.createRequest = async (req, res) => {
  const { title, impPoints, mdesc } = req.body;

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

  let newRequest = new Request({
    title,
    generatedSlug,
    impPoints,
    mdesc,
    postedBy: req.userData.id,
  });
  let savedRequest;
  try {
    savedRequest = await newRequest.save();
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Cannot make request write now please try later" });
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
