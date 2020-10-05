var mongoose = require("mongoose");

var requestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      index: true,
      required: true,
    },
    impPoints: {
      type: String,
      index: true,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["OPEN", "PENDING", "CLOSED"],
      default: "OPEN",
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Request", requestSchema);
