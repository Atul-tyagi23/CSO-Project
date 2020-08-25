const cloudinary = require('cloudinary');
cloudinary.config({
	cloud_name: 'dr6pkartq',
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.uploadsController = async (req, res, next) => {
	var image_url;

	try {
		await cloudinary.v2.uploader.upload(req.file.path, function (err, result) {
			if (err) {
				return res.status(500).json({ error: 'Server error' });
			}
			image_url = result.secure_url;
		});
	} catch (error) {
		console.log(error);
		return res.status(400).json({ error });
	}

	return res.status(200).json({ url: image_url });
};
