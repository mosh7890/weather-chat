var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/day3_weather_chat', function () {
    console.log("DB connection established!!!");
})

var WeatherPost = require('./models/weatherPostModel.js');

var app = express();

app.use(express.static('public'));
app.use(express.static('node_modules'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// 1 - Get All Posts
app.get('/posts', function (req, res) {
    WeatherPost.find(function (err, data) {
        if (err) { return console.error(err); }
        res.send(data);
    });
});

function kelvinToCelsius(tKelvin) {
    return tKelvin - 273.15;
}

// 2 - Add Posts
app.post('/posts', function (req, res) {
    var myPost = new WeatherPost({
        city: req.body.name,
        country: req.body['sys[country]'],
        temperature: kelvinToCelsius(req.body['main[temp]']).toFixed(2),
        comments: []
    });
    WeatherPost.findOne({ city: myPost.city }, function (err, data) {
        if (!data) {
            myPost.save(function (err, data) {
                if (err) { return console.error(err); }
                res.send(data);
            });
        }
    });
});

// 3 - Delete Posts
app.delete('/posts/:id', function (req, res) {
    WeatherPost.findByIdAndRemove(req.params.id, function (err, data) {
        if (err) { return console.error(err); }
        res.send(data);
    });
});

// 4 - Add Comments
app.post('/posts/:id/comments', function (req, res) {
    WeatherPost.findById(req.params.id, function (err, data) {
        if (err) { return console.error(err); }
        data.comments.push(req.body);
        data.save(function (err, data_) {
            if (err) { return console.error(err); }
            res.send(data_);
        });
    });
});

//5 - Delete Comments
app.delete('/posts/:id/comments/:id2', function (req, res) {
    var postID = req.params.id;
    var commentID = req.params.id2;
    WeatherPost.findById(postID, function (err, data) {
        if (err) { return console.error(err); }
        data.comments.id(commentID).remove();
        data.save(function (err, data_) {
            if (err) { return console.error(err); }
            res.send(data_);
        });
    });
});

app.listen(8000, function () {
    console.log("What do you want from me! Get me on 8000 ;-)");
});
