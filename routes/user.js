const express = require("express"),
  router = express.Router(),
  mongoose = require("mongoose"),
  passport = require("passport"),
  userModule = require("../controllers/user"),
  middlewareObj = require("../middleware/middleware");
const authValidators = require("../validators/auth");
const userValidators = require("../validators/edit");
const { runValidation } = require("../validators/index.js");

require("dotenv").config();

var multer = require("multer");
var storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname);
  },
});
var imageFilter = function (req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter });

// All users
router.get("/", userModule.getAllUsers);

// Sign up route
router.post(
  "/register",
  upload.single("image"),
  authValidators.signupValidator,
  runValidation,
  userModule.newUser
);

// Edit user info route

router.patch(
  "/edit/:username",
  upload.single("image"),
  middlewareObj.extractAuthToken,
  middlewareObj.checkUserOwnership,
  userValidators.userEditValidator,
  runValidation,
  userModule.updateUserInfo
);

// Login route
router.post(
  "/login",
  authValidators.loginValidator,
  runValidation,
  userModule.doLogin
);

router.post("/googleSignin", userModule.googleSignin);

// Logout route
router.get("/logout", userModule.doLogout);

// Get user info

router.get("/profile/:username", userModule.getDetails);

// Get fav articles of user

router.get(
  "/favourites/:username",
  middlewareObj.extractAuthToken,
  userModule.getFavourites
);

//
router.get("/articles/:username", userModule.getArticlesBySpecificUser);

// Send email verification mail
router.get(
  "/emailverification/:username",
  middlewareObj.extractAuthToken,
  userModule.emailSend
);

// Email verification
router.patch(
  "/emailverification/:username",
  middlewareObj.extractAuthToken,
  userModule.emailVerify
);

// Forget password
router.get("/recoverpassword/:username", userModule.emailForPassword);

// changing password
router.patch(
  "/recoverpassword/:username",
  middlewareObj.checkValidToken,
  userModule.passwordRecover
);

module.exports = router;
