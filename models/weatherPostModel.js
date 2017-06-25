var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var commentSchema = new Schema({
    text: String,
});

var weatherPostSchema = new Schema({
    city: String,
    country: String,
    temperature: Number,
    comments: [commentSchema]
});

var Comment = mongoose.model('Comment', commentSchema);

var WeatherPost = mongoose.model('WeatherPost', weatherPostSchema);

module.exports = WeatherPost;