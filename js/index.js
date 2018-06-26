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

$(window).keypress(function (key) {
    let keyTuple = keys[String.fromCharCode(key.keyCode)];
    if (keyTuple === undefined) {
        return;
    }
    keyTuple[0](...keyTuple.slice(1));
});


class Timer {
    constructor(totalTimeSec) {
        this.totalTimeOrig = totalTimeSec * 1000;
        this.totalTime = totalTimeSec * 1000;
        this.startTime = null;
        this.stopped = true;
    }

    start() {
        this.startTime = performance.now();
        this.stopped = false;
    }

    stop() {
        this.totalTime -= (this.totalTime - this.currentTime);
        this.stopped = true;
    }

    startStop() {
        if (this.stopped) {
            this.start();
        } else {
            this.stop();
        }
    }

    reset() {
        this.startTime = performance.now();
        this.totalTime = this.totalTimeOrig;
    }

    updateElem(elem) {
        const secs = this.currentTime / 1000;
        const min = Math.floor(secs / 60);
        const sec = Math.floor(secs % 60);
        elem.html(`${min}:${sec.toString().padStart(2, '0')}`);
    }

    get currentTime() {
        if (this.stopped) {
            return this.totalTime;
        }
        return (this.totalTime - (performance.now() - this.startTime));
    }

    get currentTimeSec() {
        return this.currentTime / 1000;
    }
}


const directions = {
    plus: 1,
    minus: -1
};

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
        });
    }
}

const timer = new Timer(4 * 60);
let interval = null;
let updateTimer = Timer.prototype.updateElem.bind(timer, $('#timer_time'));
updateTimer();

function timerStartStop (btn) {
    console.log('Timer start/stop');
    if (timer.stopped) {
        btn.html('Stop');
        updateTimer();
        interval = window.setInterval(updateTimer, 100);
    } else {
        btn.html('Start');
        window.clearInterval(interval);
        interval = null;
    }
    timer.startStop();

}

function resetRound (startBtn) {
    console.log('Timer reset');
    timer.stop();
    timer.reset();
    startBtn.html('Start');
    window.clearInterval(interval);
    interval = null;
    updateTimer();
    clearScores();
}

for (let btn of $('#timer_start')) {
    btn = $(btn);
    btn.click(timerStartStop.bind(Object, btn));
    for (let resetBtn of $('#timer_reset')) {
        resetBtn = $(resetBtn);
        resetBtn.click(resetRound.bind(Object, btn));
    }
}

const keys = {
    l: [changeScore, 'right', -1],
    p: [changeScore, 'right', +1],
    a: [changeScore, 'left', -1],
    q: [changeScore, 'left', +1],
    r: [resetRound],
    [' ']: [timerStartStop, $('#timer_start')],
};