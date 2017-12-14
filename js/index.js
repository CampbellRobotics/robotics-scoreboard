'use strict';

var scores = {
    left: ko.observable(0),
    right: ko.observable(0)
};

var viewModel = {
    scores: scores
}

ko.applyBindings(viewModel);

function changeScore(sidename, amountToAdd) {
    scores[sidename](scores[sidename]() + amountToAdd);
}

$(window).keypress(function (key) {

    if (key.which === 'p'.charCodeAt(0)) {
        $("#rscore").html(parseInt($("#rscore").html()) + 1);
    } else if (key.which === 'l'.charCodeAt(0)) {
        if (!parseInt($("#rscore").html()) == 0) {
            $("#rscore").html(parseInt($("#rscore").html()) - 1);
        }
    } else if (key.which === 'q'.charCodeAt(0)) {
        $("#lscore").html(parseInt($("#lscore").html()) + 1);
    } else if (key.which === 'a'.charCodeAt(0)) {
        if (!parseInt($("#lscore").html()) == 0) {
            $("#lscore").html(parseInt($("#lscore").html()) - 1);
        }
    }
});

let directions = {
    plus: 1,
    minus: -1
}

for (let scoreSide of $('.score_side')) {
    for (let btn of $(scoreSide).find('> .button')) {
        $(btn).click(function (a) {
            let direction;
            $(btn).attr('class').split(' ').forEach(function (cls) {
                let tryDir;
                if ((tryDir = directions[cls]) !== undefined) {
                    direction = tryDir;
                }
            });
            if (direction === null) {
                return;
            }
            changeScore($(scoreSide).attr('data-score-attr'), direction);
        })
    }
}
