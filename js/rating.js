window.addEventListener('DOMContentLoaded', function () {
    $.ajax({
        type: "POST",
        cache: false,
        url: _url + 'api/getRating',
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({'site': _site, 'game': _game}),
        success: function (_data) {
            if(_data.like != -1) {
                $('#averagerate').text(_data.value);
                $('#countrate').text(_data.count + ' votes ');
                $('#default-demo').attr('data-score', _data.value);
            }
            ratingJs();
        },
        error: function () {
            ratingJs();
        }
    })
});

function ratingJs() {
    let style = '-big';
    let readOnly = $('#default-demo').attr('data-readonly');
    $('#default-demo').raty({
        readOnly: readOnly,
        cancelOn: 'images/cancel-on.png',
        cancelOff: 'images/cancel-off.png',
        starOn: 'images/star-on' + style + '.png',
        starOff: 'images/star-off' + style + '.png',
        starHalf: 'images/star-half' + style + '.png',
        half: true,
        number: 5,
        numberMax: 5,
        score: function () {
            return $(this).attr('data-score');
        },
        click: function (score, evt) {
            $.ajax({
                type: "POST",
                cache: false,
                url: _url + 'api/rating',
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify({'site': _site, 'game': _game, 'rating': score }),
                success: function (_data) {
                    if(_data.like == -1) { return; }

                    $('#averagerate').text(_data.value);
                    $('#countrate').text(_data.count + ' votes ');
                    $('#default-demo').attr('data-score', _data.value);

                    $('#default-demo').raty('score', _data.value);
                    $('#default-demo').raty('readOnly', true);
                    $("#default-demo").css("cursor: pointer;");
                }
            });
        }
    });
}