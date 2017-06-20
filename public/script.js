var fetch = function (url) {
    $.ajaxSetup({
        beforeSend: function () {
            $(".loading").show();
        },
        complete: function () {
            $(".loading").hide();
        }
    })
    $.ajax({
        method: "GET",
        url: url,
        success: function (data) {
            addToEntries(data);
            render();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus);
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
        windSpeed: data.wind.speed,
        comments: []
    }
    entries.push(tempObj);
    saveToLocalStorage();
}

var render = function () {
    $('.myResults1').empty();
    $.get('weather-results.hbs', function (source) {
        var template = Handlebars.compile(source);
        var newHTML = template(entries);
        $('.myResults1').append(newHTML);
    }, 'html');
}

var deleteFromEntries = function (element) {
    var temp = $(element).closest('.resultsList');
    var index = temp.index();
    entries.splice(index, 1);
    render();
    saveToLocalStorage();
}

var toggleComments = function (element) {
    var temp = $(element).closest('.resultsList');
    temp = $(temp).find('.commentContainer');
    $(temp).toggle();
}

var addComment = function (element, data) {
    var temp = $(element).closest('.resultsList');
    var index = temp.index();
    entries[index].comments.push(data);
    saveToLocalStorage();
}

var saveToLocalStorage = function () {
    localStorage.setItem(STORAGE_ID, JSON.stringify(entries));
}

var getFromLocalStorage = function () {
    return JSON.parse(localStorage.getItem(STORAGE_ID) || '[]');
}

var clearLocalStorage = function () {
    localStorage.clear();
    entries = getFromLocalStorage();
}

var STORAGE_ID = 'weather_app';
var entries = getFromLocalStorage();

render();

$('.mySearchBtn1').on('click', function () {
    var input = $('#myInput1').val();
    var apiKey = '&APPID=d703871f861842b79c60988ccf3b17ec';
    var completeUrl = 'http://api.openweathermap.org/data/2.5/weather?q=' + input + apiKey;
    fetch(completeUrl);
});

$('.myClearBtn1').on('click', function () {
    clearLocalStorage();
    render();
});

$('.myResults1').on('click', '.commentIcon1', function () {
    toggleComments(this);
});

$('.myResults1').on('click', '.trashIcon1', function () {
    deleteFromEntries(this);
});

$('.myResults1').on('click', '.myCommentBtn1', function () {
    var input = $(this).siblings('#myInput2').val();
    addComment(this, input);
    render();
    toggleComments(this);
});



