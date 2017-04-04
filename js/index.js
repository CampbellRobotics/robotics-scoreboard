$(window).keypress(function (e) {
    $("#instructions").html("")
    if (e.which === 'p'.charCodeAt(0)) {
        $("#rscore").html(parseInt($("#rscore").html()) + 1);
    } else if (e.which === 'l'.charCodeAt(0)) {
        if (!parseInt($("#rscore").html()) == 0) {
            $("#rscore").html(parseInt($("#rscore").html()) - 1);
        }
    } else if (e.which === 'q'.charCodeAt(0)) {
        $("#lscore").html(parseInt($("#lscore").html()) + 1);
    } else if (e.which === 'a'.charCodeAt(0)) {
        if (!parseInt($("#lscore").html()) == 0) {
            $("#lscore").html(parseInt($("#lscore").html()) - 1);
        }
    }
});
