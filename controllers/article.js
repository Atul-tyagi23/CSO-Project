const express = require('express');
const slugify = require('slugify');

const Article = require('../models/article');

exports.createArticle = (req, res) => {
	const { title, featuredPhoto, categories, body } = req.body;
	let isArticleThere;
	let generatedSlug = slugify(title);
	try {
		isArticleThere = Article.findOne({ slug: generatedSlug });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}

	if (isArticleThere) {
		return res.status(400).json({ message: 'An article with same title already exists. Please change the name' });
	}

	return res.status(201).json({ message: `Article named "${title} published successfully".` });
};
