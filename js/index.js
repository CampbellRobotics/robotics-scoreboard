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

const startSeries = [
    { time: 0, note: 'F#4', dur: '8n' },
    { time: 1, note: 'Bb4', dur: '16n' },
    { time: 2, note: 'C#5', dur: '16n' },
    { time: 3, note: 'F#5', dur: '4n' },
];

function noteLen(note, bpm = 120) {
    if (typeof (note) === 'number') {
        return note;
    } else {
        return (60 / bpm) / (4 / parseInt(note));
    }
}

function seqLength(seq) {
    return seq.reduce((accu, note) => Math.max(accu, noteLen(note.time)), 0);
}
const startSeriesTime = seqLength(startSeries);

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

class Clock {
    constructor(timerLength, clockElem, startBtn) {
        console.assert(timerLength > 0, 'got matchLenSeconds less than zero!');
        this.timerLength = timerLength;
        this.clockElem = clockElem;
        this.startBtn = startBtn;
        this._setupAudioCues();
        this.updateTimer();
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
        this.startBtn.html('Start');
        this.updateTimer();
    }

    stop() {
        Tone.Transport.stop();
    }

    pause() {
        Tone.Transport.pause();
    }

    getRemainingMatchTime() {
        const raw = (this.timerLength + startSeriesTime - Tone.Transport.getSecondsAtTime());
        console.log(raw);
        return Math.max(raw, 0);
    }

    getClockDisplay() {
        const secs = this.getRemainingMatchTime();
        if (secs > this.timerLength) {
            return `+ ${(secs - this.timerLength).toFixed(1)}`;
        }
        const min = Math.floor(secs / 60);
        const sec = Math.floor(secs % 60);
        return `${min}:${sec.toString().padStart(2, '0')}`;
    }

    updateTimer() {
        this.clockElem.html(this.getClockDisplay());
    }

    _setupAudioCues() {
        let synth = new Tone.Synth().toMaster();
        let addSeries = addSeriesToSynth.bind(null, synth);

        Tone.Transport.scheduleRepeat(this.updateTimer.bind(this), '0.1s');
        addSeries(0, startSeries);

        // one minute is subtracted because we want to play an endSeries on 0:00
        // instead of a minuteSeries

        // note: this calculation breaks match times in fractional minutes somewhat
        // example: timerLength = 195 (3:15), it will ring at 2:15, not 3:00 or 2:00.
        for (let min = 1; min < Math.floor(this.timerLength / 60) - 1; ++min) {
            let theSeries = minuteSeries[min % minuteSeries.length];
            let time = 60 * min + startSeriesTime - seqLength(theSeries);
            addSeries(time, theSeries);
        }

        addSeries(this.timerLength + startSeriesTime - seqLength(endSeries), endSeries);
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