var WeatherApp = function () {

    var entries = [];
    var weatherTemplate;
    var commentTemplate;

    // 1 - Get All Posts
    var fetchData = function () {
        $.ajax({
            method: "GET",
            url: '/posts',
            success: function (data) {
                entries = data;
                // Get Handlebars Templates Once and Render Page on Load
                $.get('weather-results.hbs', function (source) {
                    weatherTemplate = Handlebars.compile(source);
                    $.get('weather-comments.hbs', function (source) {
                        commentTemplate = Handlebars.compile(source);
                        renderWeather();
                    }, 'html');
                }, 'html');
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus);
            }
        });
    };

    // Render Weather Entries 
    var renderWeather = function () {
        $('.myResults1').empty();
        for (var i = 0; i < entries.length; i++) {
            var newHTML = weatherTemplate(entries[i]);
            $('.myResults1').append(newHTML);
            renderComments(i);
        }
    }

    // Render Weather Comments inside of the Corresponding Weather Entry
    var renderComments = function (weatherIndex) {
        var weather = $('.weather')[weatherIndex];
        var comments = $(weather).find('.comments-list');
        comments.empty();
        for (var i = 0; i < entries[weatherIndex].comments.length; i++) {
            var newHTML = commentTemplate(entries[weatherIndex].comments[i]);
            comments.append(newHTML);
        }
    }

    // 2 - Add Posts
    var fetchFromUrl = function (url) {
        $.ajax({
            method: "GET",
            url: url,
            beforeSend: function () {
                $(".loading").show();
            },
            success: function (data) {
                // Received Weather Data from API
                $.ajax({
                    type: "POST",
                    url: '/posts',
                    data: data,
                    success: function (data) {
                        // POST the Weather Data we received from API
                        entries.push(data);
                        renderWeather();
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log(textStatus);
                    }
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus);
            },
            complete: function () {
                $(".loading").hide();
            }
        });
    };

    // 3 - Delete Posts
    var deleteWeather = function (index, id) {
        $.ajax({
            type: "DELETE",
            url: '/posts/' + id,
            success: function (data) {
                entries.splice(index, 1);
                renderWeather();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus);
            }
        })
    }

    // 4 - Add Comments
    var addComment = function (data, index, id) {
        console.log(data)
        $.ajax({
            type: "POST",
            url: '/posts/' + id + '/comments',
            data: data,
            success: function (data) {
                entries[index] = data;
                renderComments(index);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus);
            }
        });
    }
    // 5 - Delete Comments
    var deleteComment = function (entryID, entryIndex, commentID) {
        $.ajax({
            type: "DELETE",
            url: '/posts/' + entryID + '/comments/' + commentID,
            success: function (data) {
                entries[entryIndex] = data;
                renderComments(entryIndex);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus);
            }
        })
    }

    return {
        fetchData: fetchData,
        fetchFromUrl: fetchFromUrl,
        deleteWeather: deleteWeather,
        addComment: addComment,
        deleteComment: deleteComment
    };
};

var app = WeatherApp();

// 1 - Get All Posts
app.fetchData();

// 2 - Add Posts
$('.searchCity').on('click', function () {
    var input = $('.cityInput').val();
    var apiKey = '&APPID=d703871f861842b79c60988ccf3b17ec';
    var completeUrl = 'http://api.openweathermap.org/data/2.5/weather?q=' + input + apiKey;
    app.fetchFromUrl(completeUrl);
});

// 3 - Delete Posts
$('.myResults1').on('click', '.trashIcon1', function () {
    var index = $(this).closest('.weather').index();
    var id = $(this).closest('.weather').data().id;
    app.deleteWeather(index, id);
});

// 4 - Add Comments
$('.myResults1').on('click', '.postNewComment', function () {
    var input = $(this).siblings('.newComment').val();
    var index = $(this).closest('.weather').index();
    var id = $(this).closest('.weather').data().id;
    app.addComment({ text: input }, index, id);
});

// 5 - Delete Comments
$('.myResults1').on('click', '.trashIcon2', function () {
    var entryID = $(this).closest('.weather').data().id;
    var entryIndex = $(this).closest('.weather').index();
    var commentsID = $(this).closest('.comment').data().id;
    app.deleteComment(entryID, entryIndex, commentsID);
});

// Toggle Comments Box's
$('.myResults1').on('click', '.commentIcon1', function () {
    $(this).closest('.weather').find('.comments-container').toggle();
    $(this).closest('.weather').siblings().find('.comments-container').hide();
});
