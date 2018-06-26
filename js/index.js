'use strict';

let useAudio = true;

function doSeriesInt(synth, atTime, series) {
    let part = new Tone.Part(function (time, event) {
        synth.triggerAttackRelease(event.note, event.dur, time);
    }, series);
    part.start(atTime);
}

function setupAudioCues() {
    let synth = new Tone.Synth().toMaster();
    let doSeries = doSeriesInt.bind(null, synth);

    
    doSeries(0, [
        {time: 0, note: 'F#4', dur: '8n'},
        {time: 1, note: 'Bb4', dur: '16n'},
        {time: 2, note: 'C#5', dur: '16n'},
        {time: 3, note: 'F#5', dur: '4n'},
    ]);

    doSeries(64, [
        {time: 0, note: 'G4', dur: '8n'},
        {time: '4n', note: 'E4', dur: '16n'},
    ]);

    doSeries(124, [
        {time: 0, note: 'G4', dur: '8n'},
        {time: '4n', note: 'D4', dur: '16n'},
    ]);


    doSeries(184, [
        {time: 0, note: 'G4', dur: '8n'},
        {time: '4n', note: 'C4', dur: '16n'},
    ]);


    doSeries(244, [
        {time: 0, note: 'C3', dur: '2n'},
        {time: '16n', note: 'Eb3', dur: '2n'},
        {time: '8n', note: 'F#3', dur: '2n'},
    ]);
}

setupAudioCues();

function startAudio () {
    stopAudio();
    Tone.Transport.start('+0.1');
};

function stopAudio () {
    Tone.Transport.stop();
};

function pauseAudio () {
    Tone.Transport.pause();
};

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
        let t = (this.totalTime - (performance.now() - this.startTime));
        return t > 0 ? t : 0;
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
let startStopTimer = Timer.prototype.startStop.bind(timer);
updateTimer();

function timerStartStop (btn) {
    console.log('Timer start/stop');
    if (timer.stopped) {
        btn.html('Stop');
        updateTimer();
        interval = window.setInterval(updateTimer, 100);
        if (timer.currentTimeSec === 4*60) {
            // just got reset
            Tone.Transport.schedule(startStopTimer, 4);
        } else {
            startStopTimer();
        }
        Tone.Transport.start();
    } else {
        btn.html('Start');
        window.clearInterval(interval);
        interval = null;
        timer.startStop();
        Tone.Transport.pause();
    }
}

function resetRound (startBtn) {
    console.log('Timer reset');
    timer.stop();
    timer.reset();
    startBtn.html('Start');
    window.clearInterval(interval);
    interval = null;
    updateTimer();
    stopAudio();
    Tone.Transport.cancel();
    setupAudioCues();
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
    r: [resetRound, $('#timer_start')],
    [' ']: [timerStartStop, $('#timer_start')],
};