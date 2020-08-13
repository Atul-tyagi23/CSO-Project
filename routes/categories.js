const express = require('express');
const { getAllCategories } = require('../controllers/categories');

const router = express.Router();


router.get("/categories",getAllCategories)
router.post("/categories/create",createCategory)

<<<<<<< HEAD
module.exports = router;
=======
module.exports = router;
>>>>>>> 5df0a51cc10933bf0fd52cc3ed854fbf0baeec80
