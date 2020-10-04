const express = require("express");
const router = express.Router();
const middlewareObj = require("../middleware/middleware");


const {
    createRequestedArticle,
    allRequestedArticles ,
  } = require("../controllers/requestedArticle");

// Create requested Article
router.post('/create', middlewareObj.extractAuthToken, createRequestedArticle);



// get all 'Requested Articles'
router.get('/', allRequestedArticles)


module.exports = router;
