const express = require("express");
const {
  createArticle,
  allArticles,
  articlesOfOneCategory,
  articleBySlug,
  deleteOneAricle,
  editOneArticle,
  favouritedBy,
  likedBy,
  listSearch,
} = require("../controllers/article");
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

router.get("/category/:category", articlesOfOneCategory);

router.get("/one/:slug", articleBySlug);

router.patch(
  "/one/:slug",
  upload.single("image"),
  middlewareObj.extractAuthToken,
  editOneArticle
);

router.delete(`/one/:slug`, middlewareObj.extractAuthToken, deleteOneAricle);

// route for fav articles
router.patch("/favourite/:slug", middlewareObj.extractAuthToken, favouritedBy);

// route for like/ unlike article

router.patch("/react/:slug", middlewareObj.extractAuthToken, likedBy);

router.get("/search", listSearch);

module.exports = router;
