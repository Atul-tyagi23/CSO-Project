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

  return res.status(200).json({
    message: `Request named "${savedRequest.title}" created successfully`,
    savedRequest,
  });
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

exports.editRequest = async (req, res) => {
  let user;
  const { title, desc } = req.body;

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

  let currentRequest;
  try {
    currentRequest = await Request.findOne({ slug: req.params.slug });
  } catch (error) {
    return res.status(500).json({ error: "Server error please try later" });
  }

  if (!currentRequest) {
    return res.status(404).json({
      error: "Request not found ",
    });
  }

  //console.log((new Date().getTime() - currentRequest.createdAt.getTime())<1);

  if (
    currentRequest.status != "OPEN" ||
    new Date().getTime() - currentRequest.createdAt.getTime() > 1.728e8
  ) {
    return res.status(500).json({
      message: "Cannot update request after 2 days of its creation",
    });
  }

  let update = {
    title,
    desc,
  };
  if (!update.title) {
    update.title = currentRequest.title;
    update.slug = currentRequest.slug;
  } else {
    update.slug = slugify(title.toLowerCase());
  }
  if (!desc) update.desc = currentRequest.desc;

  let updatedRequest;
  try {
    updatedRequest = await Request.findOneAndUpdate(
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

  if (!updatedRequest) {
    return res.status(404).json({
      error:
        "The request either doesn't exist or you are updating someone else's request.",
    });
  }

  return res.status(200).json({ message: "Succesfully updated the request" });
};

exports.requestBySlug = async (req, res) => {
  let slg = req.params.slug;
  let request;
  try {
    request = await Request.findOne({ slug: slg })
      .populate("article", "title slug mdesc")
      .populate("postedBy", "name username email avatar")
      .populate("closedBy", "name username email avatar")
      .lean()
      .exec();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

  if (!request) {
    return res.status(404).json({ message: "Request not found " });
  }
  return res.status(200).json({ request });
};
