'use strict';

var scores = {
    left: ko.observable(0),
    right: ko.observable(0)
};

var viewModel = {
    scores: scores
}

ko.applyBindings(viewModel);

function getScore(sidename) {
    return scores[sidename]();
}

function setScore(sidename, newValue) {
    scores[sidename](newValue);
}

function changeScore(sidename, amountToAdd) {
    setScore(sidename, getScore(sidename) + amountToAdd);
}

function clearScores() {
    for (let side of ['left', 'right']) {
        setScore(side, 0);
    }
}

const keys = {
    l: [changeScore, 'right', -1],
    p: [changeScore, 'right', +1],
    a: [changeScore, 'left', -1],
    q: [changeScore, 'left', +1],
    r: [clearScores]
}

$(window).keypress(function (key) {
    let keyTuple = keys[String.fromCharCode(key.keyCode)];
    console.log(keyTuple);
    if (keyTuple === undefined) {
        return;
    }
    keyTuple[0](...keyTuple.slice(1));
});

const directions = {
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
