'use strict';
/*jshint globalstrict: true*/

let useAudio = true;
// 4 minutes
let matchLen = 4 * 60;

function addSeriesToSynth(synth, atTime, series) {
    if (!useAudio) { return; }
    let part = new Tone.Part(function (time, event) {
        synth.triggerAttackRelease(event.note, event.dur, time);
    }, series);
    part.start(atTime);
}

function clamp(n, min, max) {
    if (n < min) {
        return min;
    } else if (n > max) {
        return max;
    }
    return n;
}

class Clock {
    constructor(timerLength, clockElem, startBtn) {
        this.timerLength = timerLength;
        this.clockElem = clockElem;
        this.startBtn = startBtn;
        console.assert(this.timerLength > 0, 'got matchLenSeconds less than zero!');
        this._setupAudioCues();
    }

    startStop() {
        console.log('Timer start/stop');
        if (Tone.Transport.state === 'paused' || Tone.Transport.state === 'stopped') {
            this.startBtn.html('Stop');
            this.updateTimer();
            Tone.Transport.start();
        } else {
            this.startBtn.html('Start');
            this.pause();
        }
    }

    reset() {
        this.stop();
        Tone.Transport.seconds = 0;
        this.updateTimer();
    }

    stop() {
        Tone.Transport.stop();
    }

    pause() {
        Tone.Transport.pause();
    }

    getRemainingMatchTime() {
        const raw = (this.timerLength - Tone.Transport.getSecondsAtTime());
        return clamp(raw, 0, matchLen);
    }

    updateTimer() {
        const secs = this.getRemainingMatchTime();
        const min = Math.floor(secs / 60);
        const sec = Math.floor(secs % 60);
        this.clockElem.html(`${min}:${sec.toString().padStart(2, '0')}`);
    }

    _setupAudioCues() {
        let synth = new Tone.Synth().toMaster();
        let addSeries = addSeriesToSynth.bind(null, synth);

        const startSeries = [
            { time: 0, note: 'F#4', dur: '8n' },
            { time: 1, note: 'Bb4', dur: '16n' },
            { time: 2, note: 'C#5', dur: '16n' },
            { time: 3, note: 'F#5', dur: '4n' },
        ];

        // add one because we are counting from zero
        const startSeriesTime = startSeries.reduce((accu, second) => Math.max(accu, second.time), 0) + 1;

        const minuteSeries = [
            [
                { time: 0, note: 'G4', dur: '8n' },
                { time: '4n', note: 'E4', dur: '16n' }
            ],
            [
                { time: 0, note: 'G4', dur: '8n' },
                { time: '4n', note: 'D4', dur: '16n' },
            ],
            [
                { time: 0, note: 'G4', dur: '8n' },
                { time: '4n', note: 'C4', dur: '16n' },
            ],
        ];

        const endSeries = [
            { time: 0, note: 'C3', dur: '2n' },
            { time: '16n', note: 'Eb3', dur: '2n' },
            { time: '8n', note: 'F#3', dur: '2n' },
        ];

        Tone.Transport.scheduleRepeat(this.updateTimer.bind(this), '0.1s', '0s', this.timerLength.toString() + 's');
        addSeries(0, startSeries);

        // one minute is subtracted because we want to play an endSeries on 0:00
        // instead of a minuteSeries
        for (let min = 1; min < Math.floor(this.timerLength / 60) - 1; ++min) {
            addSeries(60 * min + startSeriesTime, minuteSeries[min % minuteSeries.length]);
        }

        addSeries(this.timerLength + startSeriesTime, endSeries);
    }
}

const clock = new Clock(matchLen, $('#timer_time'), $('#timer_start'));

var scores = {
    left: ko.observable(0),
    right: ko.observable(0)
};

var viewModel = {
    scores: scores
};

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

const directions = {
    plus: 1,
    minus: -1
};

for (let scoreSide of $('.score_side')) {
    for (let btn of $(scoreSide).find('> .button')) {
        $(btn).click(function () {
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

function resetRound() {
    console.log('Timer reset');
    clock.reset();
    clearScores();
}

for (let btn of $('#timer_start')) {
    btn = $(btn);
    btn.click(clock.startStop.bind(clock));
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
    [' ']: [clock.startStop.bind(clock)],
};