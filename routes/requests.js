const express = require("express");
const router = express.Router();
const middlewareObj = require("../middleware/middleware");


const {
    createRequest,
    allRequests,
    editRequest,
    requestBySlug,
    deleteRequest,
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

router.get("/one/:slug", requestBySlug);

router.delete(`/one/:slug`, middlewareObj.extractAuthToken, deleteRequest);



module.exports = router;
