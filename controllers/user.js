const User = require("../models/user");
const Article = require("../models/article");
const { OAuth2Client } = require("google-auth-library");
const shortId = require("shortid");

const client = new OAuth2Client(
  `705156089973-dolscpja0fjq8pg1ckcskd7b1ltblr6h.apps.googleusercontent.com`
);

const cloudinary = require("cloudinary");
const { createToken, decodeToken } = require("../helpers/auth");
const bcrypt = require("bcryptjs");
const sgMail = require('@sendgrid/mail');
const router = require("../routes/user");
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// Get all users
exports.getAllUsers = (req, res) => {
  // find all users
  User.find({})
    .lean()
    .then(
      (users) => {
        // if error then 4xx or 5xx codes
        if (!users) {
          return res.status(500).json({ error: "Server error" });
        }
        // if length is 0 then 404 error as not found
        if (users.length === 0) {
          return res.status(404).json({ error: "No users  found" });
        }
        // if found then send with 200 code the users  in json form
        return res.status(200).json({
          users,
        });
      },
      (err) => {
        // if error then 4xx or 5xx codes
        if (err) {
          return res.status(500).json({ error: err });
        }
      }
    );
};

cloudinary.config({
  cloud_name: "dr6pkartq",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Handling Signup

exports.newUser = async (req, res) => {
  // Chech for same email
  let sameUser;

  try {
    sameUser = await User.findOne({ email: req.body.email }).exec();
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }

  if (sameUser) {
    return res.status(400).json({
      error: `Email already registered. Please login with different email`,
    });
  }
  //Check for same Username

  try {
    sameUser = await User.findOne({ username: req.body.username }).exec();
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }

  if (sameUser) {
    return res.status(400).json({
      error: `Username already registered. Please login with different username`,
    });
  }

  let image_url;
  if (req.file) {
    let result;
    try {
      result = await cloudinary.v2.uploader.upload(req.file.path);
    } catch (error) {
      return res.status(500).json({ error: "Server error" });
    }
    image_url = result.secure_url;
  }

  //Hash password
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(req.body.password, 12);
  } catch (error) {
    return res.status(500).json({ error: error });
  }

  const newUser = new User({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
    avatar: image_url,
    password: hashedPassword,
  });
  let savedUser;
  try {
    savedUser = newUser.save();
  } catch (error) {
    res.status(500).json({ error: "Cannot create user!" });
  }

  let token = createToken({
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
    avatar: newUser.avatar,
    favs: newUser.favs,
  });

  return res.status(200).json({ message: "Successfully Signed up!", token });
};

// Handling login
exports.doLogin = async (req, res, next) => {
  let sameUser;

  try {
    sameUser = await User.findOne({ username: req.body.username }).exec();
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
  if (!sameUser) {
    return res
      .status(400)
      .json({ error: "User with given username does not exists" });
  }

  //Password is correct ?
  let validUser;
  try {
    validUser = await bcrypt.compare(req.body.password, sameUser.password);
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
  if (!validUser) {
    return res.status(400).json({ error: "Incorrect password" });
  }

  let token = createToken({
    id: sameUser.id,
    username: sameUser.username,
    email: sameUser.email,
    avatar: sameUser.avatar,
    favs: sameUser.favs,
  });

  return res.status(200).json({ message: "Logged you in!", token });
};

// Handling logout

exports.doLogout = (req, res) => {
  // clear req.user and clear the login session (if any)
  // req.logOut();
  return res.status(200).json({ message: "Logged you out!" });
};

// Updating user info
exports.updateUserInfo = async (req, res) => {
  let image_url;
  //console.log(req.body);

  let existingUser;

  try {
    existingUser = await User.findOne({ username: req.params.username }).exec();
  } catch (error) {
    return res
      .status(503)
      .json({ message: "Server Unreachable. Try again later" });
  }
  // Verifying password

  let validUser;
  if (req.body.oldpassword) {
    try {
      validUser = await bcrypt.compare(
        req.body.oldpassword,
        existingUser.password
      );
    } catch (error) {
      return res.status(500).json({ error: "Server error" });
    }
    if (!validUser) {
      return res.status(400).json({ error: "Incorrect password" });
    }
  }

  if (!existingUser) {
    return res.status(404).json({ message: "User not found" });
  } else {
    image_url = existingUser["avatar"];
  }

  if (req.file) {
    let result;
    try {
      result = await cloudinary.v2.uploader.upload(req.file.path);
    } catch (error) {
      return res.status(500).json({ error: "Server error" });
    }
    image_url = result.secure_url;
  }

  let update = {
    name: req.body.name,
    username: req.body.username,
    avatar: image_url,
    about: req.body.about,
    website: req.body.website,
    contactNumber: req.body.contactNumber,
    github: req.body.github,
    instagram: req.body.instagram,
    twitter: req.body.twitter,
    linkedin: req.body.linkedin,
  };
  let hashedPassword;
  if (req.body.newpassword) {
    //Hash new password
    try {
      hashedPassword = await bcrypt.hash(req.body.newpassword, 12);
    } catch (error) {
      return res.status(500).json({ error: error });
    }
    update.password = hashedPassword;
  }

  if (!req.body.username) update.username = existingUser["username"];
  if (!req.body.name) update.name = existingUser["name"];
  if (!req.body.about) update.about = existingUser["about"];
  if (!req.body.linkedin) update.facebook = existingUser["linkedin"];
  if (!req.body.twitter) update.twitter = existingUser["twitter"];
  if (!req.body.github) update.github = existingUser["github"];
  if (!req.body.instagram) update.instagram = existingUser["instagram"];
  if (!req.body.contactNumber)
    update.contactNumber = existingUser["contactNumber"];
  if (!req.body.website) update.website = existingUser["website"];

  if (update.username != req.params.username) {
    let sameUser;

    try {
      sameUser = await User.findOne({ username: req.body.username }).exec();
    } catch (error) {
      return res.status(500).json({ error: "Server error" });
    }
    if (sameUser) {
      return res
        .status(400)
        .json({ error: "User with given username Already exists" });
    }
  }

  let updatedUser;

  try {
    updatedUser = await User.findOneAndUpdate(
      { username: existingUser.username },
      update,
      { new: true }
    ).exec();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Could not update user" });
  }

  if (!updatedUser) {
    return res.status(500).json({ message: "Error in updating user" });
  }
  let result, token;
  token = createToken({
    id: updatedUser.id,
    username: updatedUser.username,
    email: updatedUser.email,
    avatar: updatedUser.avatar,
    favs: updatedUser.favs,
  });
  return res.status(200).json({
    message: "Updated user credentials successfully.",
    token,
    username: updatedUser.username,
  });
};

// Get single user detail

exports.getDetails = async (req, res) => {
  let foundUser;
  try {
    foundUser = await User.findOne({ username: req.params.username })
      .select("-password")
      .populate({
        path: "articles",
        select: "slug title mdesc updatedAt",
      })
      .lean()
      .exec();
    if (foundUser) {
      foundUser.articles.sort((a, b) => b.updatedAt - a.updatedAt);
    }
  } catch (error) {
    console.log(error);
    return res
      .status(503)
      .json({ message: "Server Unreachable. Try again later" });
  }

  if (!foundUser) {
    return res.status(404).json({ message: "User not found" });
  }
  let userInfo = foundUser;

  return res.status(200).json({ userInfo: userInfo });
};

// Get fav articles of a particluar user

exports.getFavourites = async (req, res) => {
  let user;
  try {
    user = await User.findOne({ username: req.params.username }).exec();
  } catch (error) {
    return res
      .status(503)
      .json({ message: "Server Unreachable. Try again later" });
  }
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.username !== req.userData.username) {
    return res
      .status(403)
      .json({ error: "You are not allowed to see this page." });
  }

  let articles;
  try {
    articles = await Article.find({
      favouritedBy: { $in: user._id },
    })
      .select("slug title category featuredPhoto mdesc")
      .exec();
  } catch (error) {
    return res.status(500).json({ message: error.message || "Server down" });
  }
  return res.status(200).json({ articles });
};

exports.getArticlesBySpecificUser = async (req, res) => {
  let user;
  try {
    user = await User.findOne({ username: req.params.username }).exec();
  } catch (error) {
    return res
      .status(503)
      .json({ message: "Server Unreachable. Try again later" });
  }
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  let articles;
  try {
    articles = await Article.find({ postedBy: user._id })
      .select("-body -likes -likedBy -favouritedBy")
      .populate("category")
      .populate("postedBy", "name username")
      .lean()
      .exec();
  } catch (error) {
    return res.status(500).json({ message: error.message || "Server down" });
  }
  return res.status(200).json({ articles });
};

// google login
exports.googleSignin = async (req, res) => {
  const idToken = req.body.gToken;
  let ticket, payload;
  try {
    ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error in logging with google" });
  }

  payload = ticket.getPayload();

  let existingUser;

  try {
    existingUser = await User.findOne({ email: payload.email }).lean().exec();
  } catch (error) {
    return res.status(500).json({
      error:
        error.message ||
        "Some problem occurred while google login. Please try again later",
    });
  }

  if (existingUser) {
    let token = createToken({
      id: existingUser._id,
      username: existingUser.username,
      email: existingUser.email,
      avatar: existingUser.avatar,
      favs: existingUser.favs,
    });
    return res.status(200).json({ message: "Logged you in!", token });
  }

  let newUserUsername = shortId.generate();

  let newUser = new User({
    name: payload.name,
    email: payload.email,
    avatar: payload.picture,
    password: payload.jti,
    username: newUserUsername,
  });

  try {
    await newUser.save();
  } catch (error) {
    return res.status(500).json({
      error:
        error.message ||
        "Google Login failed. Please try again after sometime.",
    });
  }

  let token = createToken({
    id: newUser._id,
    username: newUser.username,
    email: newUser.email,
    avatar: newUser.avatar,
    favs: newUser.favs,
  });
  return res
    .status(200)
    .json({ message: "Made your account succefully!", token });
};

// route for sending email for verification 
exports.emailSend = async (req, res)=>{
  let user;
  try {
    user = await User.findOne({ username: req.params.username }).exec();
  } catch (error) {
    return res
      .status(503)
      .json({ message: "Server Unreachable. Try again later" });
  }
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.username !== req.userData.username) {
    return res
      .status(403)
      .json({ error: "You are not allowed to see this page." });
  }

  let token = createToken({
    id: user.id,
    username: user.username,
    email: user.email,
  });


const msg = {
  to: user.email , // Change to your recipient
  from: `atultyagibest@gmail.com`, // Change to your verified sender
  subject: `Click on the below hyperlink to verify your email`,
  text: `and easy to do anywhere, even with Node.js`,
  html: `<p> Titan Read requires a verified email address so you can take full advantage of its features </p> <a href = "${process.env.CLIENT_URL}/api/user/profile/${user.username}?token=${token}">CLICK HERE TO VERIFY</a>`,
}
sgMail
  .send(msg)
  .then(() => {
    return res
    .status(200)
    .json({ message: "Email sent! please check your email to verify it." });
  })
  .catch((error) => {
    return res
      .status(503)
      .json({ message: "Server Unreachable. Try again later" });
  }) 
}

// Route for User email verification 
exports.emailVerify = async (req, res)=>{
  if(!req.body.isVerified){
    return res.status(500).json({ message: "Could not verify user, Incorrect token" });
  }
  let updatedUser;
  try {
    updatedUser = await User.findOneAndUpdate(
      { username: user.username },
      {isVerified: true},
      { new: true }
    ).exec();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Could not verify user" });
  }

  if (!updatedUser) {
    return res.status(500).json({ message: "Error in verifying user" });
  }

  return res
  .status(200)
  .json({ message: "Email Verified Successfully!" });

}

// route for sending email for forgotten password
exports.emailSend = async (req, res)=>{
  let user;
  try {
    user = await User.findOne({ username: req.params.username }).exec();
  } catch (error) {
    return res
      .status(503)
      .json({ message: "Server Unreachable. Try again later" });
  }
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.username !== req.userData.username) {
    return res
      .status(403)
      .json({ error: "You are not allowed to see this page." });
  }

  let token = createToken({
    id: user.id,
    username: user.username,
    email: user.email,
  });


const msg = {
  to: user.email , // Change to your recipient
  from: `atultyagibest@gmail.com`, // Change to your verified sender
  subject: `Password recovery`,
  text: `and easy to do anywhere, even with Node.js`,
  html: `<p>Please click  on the below hyperlink to change your password  </p> <a href = "${process.env.CLIENT_URL}/api/user/profile/${user.username}?token=${token}">Click here</a>`,
}
sgMail
  .send(msg)
  .then(() => {
    return res
    .status(200)
    .json({ message: "Email sent! please check your email." });
  })
  .catch((error) => {
    return res
      .status(503)
      .json({ message: "Server Unreachable. Try again later" });
  }) 
}


// Route to create new Password
exports.emailVerify = async (req, res)=>{
  if(!req.body.isVerified){
    return res.status(500).json({ message: "Could not verify user, Incorrect token" });
  }
  if(req.body.oldpassword !== req.body.newpassword)
  return res.status(500).json({ error: 'Password not matched, Please retry' });
  
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(req.body.newpassword, 12);
  } catch (error) {
    return res.status(500).json({ error: error });
  }

  let updatedUser;
  try {
    updatedUser = await User.findOneAndUpdate(
      { password: hashedPassword },
      {isVerified: true},
      { new: true }
    ).exec();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Could not verify user" });
  }

  if (!updatedUser) {
    return res.status(500).json({ message: "Error in verifying user" });
  }

  return res
  .status(200)
  .json({ message: "Email Verified Successfully!" });
}


// route for sending email for forgotten password
exports.emailForPassword = async (req, res)=>{
  let user;
  try {
    user = await User.findOne({ username: req.params.username }).exec();
  } catch (error) {
    return res
      .status(503)
      .json({ message: "Server Unreachable. Try again later" });
  }
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }


  let token = createToken({
    id: user.id,
    username: user.username,
    email: user.email,
  });


const msg = {
  to: user.email , // Change to your recipient
  from: `atultyagibest@gmail.com`, // Change to your verified sender
  subject: `Password recovery`,
  text: `and easy to do anywhere, even with Node.js`,
  html: `<p>Please click  on the below hyperlink to change your password  </p> <a href = "${process.env.CLIENT_URL}/api/user/reset-password?token=${token}">Click here</a>`,
}
sgMail
  .send(msg)
  .then(() => {
    return res
    .status(200)
    .json({ message: "Email sent! please check your email." });
  })
  .catch((error) => {
    return res
      .status(503)
      .json({ message: "Server Unreachable. Try again later" });
  }) 
}


// Route to create new Password
exports.passwordRecover = async (req, res)=>{
  if(!req.body.isVerified){
    return res.status(500).json({ message: "Could not verify user, Incorrect token" });
  }
  if(req.body.oldpassword !== req.body.newpassword)
  return res.status(500).json({ error: 'Password not matched, Please retry' });
  
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(req.body.newpassword, 12);
  } catch (error) {
    return res.status(500).json({ error: error });
  }

  let updatedUser;
  try {
    updatedUser = await User.findOneAndUpdate(
      { password: hashedPassword },
      {isVerified: true},
      { new: true }
    ).exec();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Could not change password please try again" });
  }

  if (!updatedUser) {
    return res.status(500).json({ message: "Error in updating password" });
  }

  return res
  .status(200)
  .json({ message: "Email Verified Successfully!" });
}
