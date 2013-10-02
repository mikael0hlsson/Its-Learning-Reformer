// ==UserScript==
// @name       Itslearning.Assignment
// @namespace  Itslearning
// @version    0.2
// @description  enter something useful
// @match      *://mah.itslearning.com/essay/read_essay.aspx?EssayID=*
// @copyright  Mikael Ohlsson, Ali Arafati
// ==/UserScript==

if(chrome.extension)
    chrome.extension.sendRequest({}, function(response) {});

$(function () {

    
    markPage();
    fixColors();
    //alert(localStorage.toggleOn);
    if(localStorage.toggleOff!='false')
            toggleRows();


    var icon = 'https://statics.itslearning.com/v3.42.1.195/icons/xp/search_no_shadow16.png';
    $('.toolbar').append('<ul style=float:right><li style=background-color:orange><img src="' + icon + '" /><a id=btnToggle href=#><b>Toggle See All</b></a></li></ul>');

    $('#btnToggle').click(function (e) {
        e.preventDefault();
        toggleRows();
        if(localStorage.toggleOff=='false')
            localStorage.toggleOff=true;
        else
            localStorage.toggleOff=false;
    });


    $("#EssayAnswers_EssayAnswers tr > td:nth-child(4) span").text(function () { return $.timeago($(this).text()) });
    $("#EssayAnswers_EssayAnswers tr > td:nth-child(4):not(:has(span))").text(function () { return $.timeago($(this).text()) });

    function toggleRows() {
        $("#EssayAnswers_EssayAnswers .remove").slideToggle();
        
    }

    function markRows(text) {
        $("#EssayAnswers_EssayAnswers td").filter(function () {
            return $(this).text() == text
        }).closest("tr").addClass('remove');
    }

    function markPage() {
        markRows("Completed");
        markRows("Complete");
        markRows("Klar");
        markRows("Not submitted");
        markRows("Inte inlämnad");
    }

    function fixColors() {
        $("#EssayAnswers_EssayAnswers td span").filter(function () {   //color like swedish
            return $(this).text() == "Needs Grading"
        }).addClass("colorbox_red");
        $("#EssayAnswers_EssayAnswers td span").filter(function () {   //color red
            return $(this).text() == "Ej granskad"
        }).addClass("colorbox_red");
        $("#EssayAnswers_EssayAnswers td span").filter(function () {   //no need for color
            return $(this).text() == "Inte godkänt, skicka på nytt"
        }).removeClass("colorbox_red");
        $("#EssayAnswers_EssayAnswers td span").filter(function () {   //color yellow
            return $(this).text() == "Granskning pågår"
        }).addClass("colorbox_yellow");
    }

});

