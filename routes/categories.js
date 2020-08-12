const express = require('express');
const { getAllCategories } = require('../controllers/categories');

const router = express.Router();


router.get("/categories",getAllCategories)
router.post("/categories/create",createCategory)

module.exports = router;
