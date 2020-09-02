const express = require('express');
const slugify = require('slugify');
const cloudinary = require('cloudinary');

const Article = require('../models/article');

cloudinary.config({
	cloud_name: 'dr6pkartq',
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.createArticle = (req, res) => {
	const { title, featuredPhoto, categories, body, mdesc } = req.body;
	let image_url;
	if (req.file) {
		let result;
		try {
			result = await cloudinary.v2.uploader.upload(req.file.path);
		} catch (error) {
			return res.status(500).json({ error: 'Server error' });
		}
		image_url = result.secure_url;
	}
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

	let createdArticle = new Article({
		title,
		slug:generatedSlug,
		body,
		categories
	})

	return res.status(201).json({ message: `Article named "${title} published successfully".` });
};
