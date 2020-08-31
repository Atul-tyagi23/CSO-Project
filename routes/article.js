const express = require('express');
const { createArticle } = require('../controllers/article');

const router = express.Router();

router.post('/create', createArticle);

module.exports = router;
