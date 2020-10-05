const express = require("express");
const router = express.Router();
const middlewareObj = require("../middleware/middleware");


const {
    createRequest,
    allRequests,
    editRequest,
  } = require("../controllers/requests");

// Create requested Article
router.post('/create', middlewareObj.extractAuthToken, createRequest);



// get all 'Requested Articles'
router.get('/', allRequests)

// edit Request
router.patch(
  "/one/:slug",
  middlewareObj.extractAuthToken,
  editRequest,
);


module.exports = router;
