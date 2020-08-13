const express = require('express');
const category = require('../controllers/categories');


const router = express.Router();


router.get("/categories",category.getAllCategories);
router.post("/categories/create",category.createCategory);

module.exports = router;
