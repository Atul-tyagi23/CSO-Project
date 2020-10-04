var mongoose = require('mongoose');

var requestSchema = new mongoose.Schema({
    title: {
        type: String,
        index: true,
        required: true,
    },
    impPoints: {
        type: String,
        index: true,
        required: true,
    },
    mdesc: {
        type: String,
        required: true,
    },
    article: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article'
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    closedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }},
  
    {
		timestamps: true,
	}
);

module.exports = mongoose.model('RequestedArticle', requestSchema);