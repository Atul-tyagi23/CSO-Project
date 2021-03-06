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
      .populate("closedBy", "name username")
      .populate("article", "title slug")
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
    new Date().getTime() - new Date(currentRequest.createdAt).getTime() >
      1.728e8
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
      .populate("article", "title slug ")
      .populate("postedBy", "name username ")
      .populate("closedBy", "name username ")
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

// delete one request
exports.deleteRequest = async (req, res) => {
  let slug = req.params.slug;
  let request;
  try {
    request = await Request.findOne({ slug }).populate("postedBy").exec();
  } catch (error) {
    return res.status(500).json({ error: error.message || "Server Error" });
  }

  if (!request) {
    return res.status(404).json({ error: "No request found" });
  }

  if (request.postedBy.id !== req.userData.id) {
    return res
      .status(403)
      .json({ error: "You are not allowed to perform this operation" });
  }

  if (request.status !== "OPEN") {
    return res
      .status(403)
      .json({ error: "You cannot delete request as status is not open" });
  }

  try {
    await request.remove();
  } catch (error) {
    return res.status(500).json({
      error:
        error.message || "Unable to delete the request. Please try again later",
    });
  }
  return res.status(200).json({ message: "Deleted request succesfully" });
};

// article suggestion
exports.suggestedArticle = async (req, res) => {
  //console.log(req.params);
  // console.log(req.body);
  let user;
  try {
    user = await User.findOne({ username: req.userData.username }).exec();
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Server error",
    });
  }

  if (!user) {
    return res.status(404).json({
      error: "No such user. Please create an account instead",
    });
  }

  let article;
  let slug = slugify(req.body.article.toLowerCase());
  try {
    article = await Article.findOne({ slug }).exec();
  } catch (error) {
    return res.status(500).json({
      error: error.message || "server error",
    });
  }

  if (!article) {
    return res.status(404).json({
      error: "No article of such title exists. Please Provide a valid title",
    });
  }

  let update = {
    article: article,
    closedBy: user,
    status: "PENDING",
  };

  let updatedRequest;
  try {
    updatedRequest = await Request.findOneAndUpdate(
      {
        slug: req.params.slug,
      },
      update,
      { new: true }
    )
      .lean()
      .exec();
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Could not Suggest. Please try again later" });
  }

  if (!updatedRequest) {
    return res.status(404).json({
      error: " The request doesn't exist.",
    });
  }
  return res.status(200).json({ message: "Succesfully made the suggestion" });
};

// Changing status
exports.changeRequestStatus = async (req, res) => {
  if (!req.body.approve) {
    return res.status(404).json({ error: "Approval not found " });
  }

  let request;
  try {
    request = await Request.findOne({ slug: req.params.slug })
      .populate("postedBy")
      .exec();
  } catch (error) {
    return res.status(500).json({ error: error.message || "Server Error" });
  }

  if (!request) {
    return res.status(404).json({ error: "No request found" });
  }

  if (request.postedBy.id !== req.userData.id) {
    return res
      .status(403)
      .json({ error: "You are not allowed to perform this operation" });
  }
  let status,
    update = {};
  if (req.body.approve === "YES") {
    status = "CLOSED";
  } else {
    status = "OPEN";
    update.article = null;
    update.closedBy = null;
  }

  update.status = status;

  let updatedRequest;
  try {
    updatedRequest = await Request.findOneAndUpdate(
      {
        slug: req.params.slug,
      },
      update,
      { new: true }
    )
      .lean()
      .exec();
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Could not update status. Please try again later" });
  }

  if (!updatedRequest) {
    return res.status(404).json({
      error: " The request doesn't exist.",
    });
  }
  return res
    .status(200)
    .json({ message: "Succesfully updated status for route" });
};
