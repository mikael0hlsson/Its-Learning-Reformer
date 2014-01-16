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
	var numberOfPages = $('.ccl-pager li:nth-last-child(2)').text(); //Number of pages
    var mainTable = $('.tablelisting tbody');
	$('tr', mainTable).not("#EssayAnswers_0").remove(); //remove current page
	loadAllPages(); 
	$('.ccl-pager').hide(); //hide pager
	
    markPage();
    fixColors();
    //alert(localStorage.toggleOn);
    if(localStorage.toggleOff!='false')
            toggleRows();


    var icon = 'https://statics.itslearning.com/v3.42.1.195/icons/xp/search_no_shadow16.png';
    $('.ccl-gridtoolbar').append('<ul style=float:right><li><img src="' + icon + '" /><a id=btnToggle href=#><b>Toggle See All</b></a></li></ul>');

    $('#btnToggle').click(function (e) {
        e.preventDefault();
        toggleRows();
        if(localStorage.toggleOff=='false')
            localStorage.toggleOff=true;
        else
            localStorage.toggleOff=false;
    });


    $("[id^=EssayAnswers_] td:nth-child(4) span").text(function () { return $.timeago($(this).text()) });
    $("[id^=EssayAnswers_] td:nth-child(4):not(:has(span))").text(function () { return $.timeago($(this).text()) });

    function toggleRows() {
        $(".remove").toggle();
        //alert("hehe");
    }

    function markRows(text) {
        $("[id^=EssayAnswers_] td").filter(function () {
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
        $("[id^=EssayAnswers_] td span").filter(function () {   //color like swedish
            return $(this).text() == "Needs Grading"
        }).addClass("colorbox_red");
        $("[id^=EssayAnswers_] td span").filter(function () {   //color red
            return $(this).text() == "Ej granskad"
        }).addClass("colorbox_red");
        $("[id^=EssayAnswers_] td span").filter(function () {   //no need for color
            return $(this).text() == "Inte godkänt, skicka på nytt"
        }).removeClass("colorbox_red");
        $("[id^=EssayAnswers_] td span").filter(function () {   //color yellow
            return $(this).text() == "Granskning pågår"
        }).addClass("colorbox_yellow");
    }
	//<a id="EssayAnswers_8:Paging:1" href="javascript:__doPostBack('EssayAnswers$8:Paging:1','')">2</a>
	//javascript:__doPostBack('EssayAnswers$9:Paging:0','')
	// 1 javascript:__doPostBack('EssayAnswers$9:Paging:0','') javascript:__doPostBack('EssayAnswers$10:Paging:1','')
	// 2 javascript:__doPostBack('EssayAnswers$8:Paging:1','')
	// 3 javascript:__doPostBack('EssayAnswers$9:Paging:2','') javascript:__doPostBack('EssayAnswers$10:Paging:2','')
	// 4 javascript:__doPostBack('EssayAnswers$11:Paging:3','') javascript:__doPostBack('EssayAnswers$11:Paging:3','')
	// 5 javascript:__doPostBack('EssayAnswers$10:Paging:4','') javascript:__doPostBack('EssayAnswers$12:Paging:4','')
		function loadAllPages(){
		for(var page=0;page<=numberOfPages;page++){
			$( "input:hidden[name=__EVENTTARGET]" ).val('EssayAnswers$8:Paging:'+page);
			$( "input:hidden[name=__EVENTARGUMENT]" ).val('');
			var $form=$('#ctl03'),
			url=$form.attr("action")
			values=$form.serialize();
			
			$.ajax({
				type:		'POST',
				url:		url,
				data:		values,
				success: 	function(data){
					var content=$(data).find('.tablelisting tbody tr').not("#EssayAnswers_0");
					mainTable.append(content);
				},
				async:		false
			});
		}
	}

});

