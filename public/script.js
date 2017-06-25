var getFromLocalStorage = function () {
    return JSON.parse(localStorage.getItem(STORAGE_ID) || '[]');
}

var saveToLocalStorage = function () {
    localStorage.setItem(STORAGE_ID, JSON.stringify(entries));
}

var clearLocalStorage = function () {
    localStorage.clear();
    entries = getFromLocalStorage();
}

var STORAGE_ID = 'weather_app';

// Load Data from Local Storage into Array
var entries = getFromLocalStorage();

var weatherTemplate;
var commentTemplate;

// Get Handlebars Templates Once and Render Page on Load
$.get('weather-results.hbs', function (source) {
    weatherTemplate = Handlebars.compile(source);
    $.get('weather-comments.hbs', function (source) {
        commentTemplate = Handlebars.compile(source);
        renderWeather();
    }, 'html');
}, 'html');

var renderWeather = function () {
    $('.myResults1').empty();
    for (var i = 0; i < entries.length; i++) {
        var newHTML = weatherTemplate(entries[i]);
        $('.myResults1').append(newHTML);
        renderComments(i);
    }
}

var renderComments = function (weatherIndex) {
    var weather = $('.weather')[weatherIndex];
    var comments = $(weather).find('.comments-list');
    comments.empty();
    for (var i = 0; i < entries[weatherIndex].comments.length; i++) {
        var newHTML = commentTemplate(entries[weatherIndex].comments[i]);
        comments.append(newHTML);
    }
}

var fetch = function (url) {
    $.ajax({
        method: "GET",
        url: url,
        beforeSend: function () {
            $(".loading").show();
        },
        success: function (data) {
            addToEntries(data);
            renderWeather();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus);
        },
        complete: function () {
            $(".loading").hide();
        }
    });
};

function kelvinToCelsius(tKelvin) {
    return tKelvin - 273.15;
}

var addToEntries = function (data) {
    var temp = data.main.temp;
    temp = kelvinToCelsius(temp).toFixed(2);
    var tempObj = {
        city: data.name,
        country: data.sys.country,
        temperature: temp,
        comments: []
    }
    entries.push(tempObj);
    saveToLocalStorage();
}

var deleteWeather = function (element) {
    var index = $(element).closest('.weather').index();
    entries.splice(index, 1);
    renderWeather();
    saveToLocalStorage();
}

var addComment = function (element, data) {
    var index = $(element).closest('.weather').index();
    entries[index].comments.push(data);
    saveToLocalStorage();
}

var deleteComment = function (element) {
    var entryIndex = $(element).closest('.weather').index();
    var commentsIndex = $(element).closest('.comment').index();
    entries[entryIndex].comments.splice(commentsIndex, 1);
    renderComments(entryIndex);
    saveToLocalStorage();
}

$('.searchCity').on('click', function () {
    var input = $('.cityInput').val();
    var apiKey = '&APPID=d703871f861842b79c60988ccf3b17ec';
    var completeUrl = 'http://api.openweathermap.org/data/2.5/weather?q=' + input + apiKey;
    fetch(completeUrl);
});

$('.clearLocalStorage').on('click', function () {
    clearLocalStorage();
    renderWeather();
});

$('.myResults1').on('click', '.trashIcon1', function () {
    deleteWeather(this);
});

$('.myResults1').on('click', '.postNewComment', function () {
    var input = $(this).siblings('.newComment').val();
    addComment(this, input);
    var index = $(this).closest('.weather').index();
    renderComments(index);
    $(this).closest('.weather').find('.comments-container').show();
});

$('.myResults1').on('click', '.trashIcon2', function () {
    deleteComment(this);
});

$('.myResults1').on('click', '.commentIcon1', function () {
    $(this).closest('.weather').find('.comments-container').toggle();
    $(this).closest('.weather').siblings().find('.comments-container').hide();

});