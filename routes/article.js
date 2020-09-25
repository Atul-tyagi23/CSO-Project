const express = require("express");
const { createArticle, allArticles, articlesOfOneCategory, articleBySlug } = require("../controllers/article");
const multer = require("multer");
const middlewareObj = require("../middleware/middleware");

const router = express.Router();
const storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname);
  },
});
const imageFilter = function (req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: imageFilter });

router.get("/", allArticles);
router.post(
  "/create",
  upload.single("image"),
  middlewareObj.extractAuthToken,
  createArticle
);
router.get('/:slug', articleBySlug);

router.get('/category/:category', articlesOfOneCategory);


module.exports = router;
