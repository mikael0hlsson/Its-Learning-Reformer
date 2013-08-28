// ==UserScript==
// @name       My Fancy New Userscript
// @namespace  http://use.i.E.your.homepage/
// @version    0.1
// @description  enter something useful
// @match      http://*/*
// @copyright  2012+

if(chrome.extension)
    chrome.extension.sendRequest({}, function(response) {});

$(function () {
    var isColumnAdded=false;

    function addPersonalNumberColumn(){
        if(isColumnAdded)
            return;
        $(".tablelisting table tr:lt(1)").prepend("<th>Personnummer</th>");
        $(".tablelisting table tr:gt(0)").prepend("<td>#</td>");
        isColumnAdded=true;
    }


    var num = $('.pagesize').html().match(/\d+/g)[2]

    var location = document.location.href;
    if (location.indexOf('&') != -1)
        location = location.substr(0, location.indexOf('&')); //remove extra parameters

    var mainTable = $('table tbody');

    function hideAverageGradeColumn(){
        mainTable.find("tr:lt(1) th:last-child").hide();
        mainTable.find("tr:gt(0) td:last-child").hide();
    }


    $('tr:not(.header)', mainTable).remove(); //clear the table    

    var From = 0;
    while (num > 0) {
        $.ajax({
            url: location,
            data: { From: From, Show: 100 },
            success: function (d) {
                var rows = $('table tr:not(.header)', d);

                rows.find('td:first').attr('nowrap', '');
                rows.find('td:contains("Needs"), td:contains("rättad")').text('RE').attr('title','They have resubmitted');
                rows.find('td:contains("skicka"), td:contains("Resub")').text('WTG').attr('title','They need to resubmit');
                rows.find('td:contains("Inte"), td:contains("sub"), td:contains("No assessment")').text('');
               
                rows.find('td span').remove(); //remove the keywords (Klar, ...)
                rows.find('a').replaceWith(function (a) { return $(this).text(); }); //remove links
                rows.find('td:contains("*")').text(function (a) { return $(this).text().replace("*", ""); });

                rows.find('td:last:contains("(F)"), td:last:contains("(U)")').each(function (i, td) {
                    $(td).closest('tr').addClass('incomplete');
                });
                rows.find('td:last').each(function (i, td) {
                    var el = $(td);
                    if (el.text() == "(U)" || el.text() == "(F)" || el.text() == "F/(F)" || el.text() == "U/(U)") {
                        $(td).closest('tr').addClass('idiot');
                    }
                });
                rows.find('td').each(function() {  //Courses with only Godkänt... replace with G
                    var text = $(this).text().replace('Godkänd', 'G');
                    $(this).text(text);
                });
                mainTable.append(rows);

            }, async: false
        })
        num -= 100;
        From += 100;
    }


    $('.tablefooter, .itsl-toplinks-line, .standardfontsize').remove();

    $('<button style="float:right" class="login-button">Hide/Show People with no handins</button>').click(function () {
        mainTable.find('.idiot').toggle();
    }).prependTo($('body'));

    $('<button class="login-button">Inject Personal Numbers</button>').click(function () {
        addPersonalNumberColumn();
        var str = $('textarea').val();

        var arr = str.split('\n'); var people = [];
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == "") continue;
            people.push(arr[i].replace(',', '').split('\t'));
        }

        mainTable.find('tr').find('td:nth-child(2)').each(function (i, td) {
            var name = $(this).text().replace(',', '');
            for (var i = 0; i < people.length; i++) {
                if (name.toLowerCase() == people[i][1].toLowerCase()) {
                    if($(this).prev().text()=='#' || $(this).prev().text()==people[i][0])
                        $(this).prev().text(people[i][0]);
                    else
                        alert('Warning! \nThe personal number was different that the one inserted\n for the user: '+$(this).text());
                    return;
                }
            }
        });


    }).prependTo($('body'));

    $('body').prepend($('<textarea placeholder="Paste personal numbers here (psn | name)" style=width:400px /> <br />'));

    mainTable.find('td').each(function (i, td) {
        var text = $(td).text().trim();
        if (text == "VG" || text == "A" || text == "B" || text == "G" || text == "C") {
            $(td).addClass('colorbox_green');
        }
        //if (text == "G" || text == "C") {
        //    $(td).html($('<span/>', { text: text, class: 'colorbox_blue' }));
        //}
        if (text == "RE") {
            $(td).css('background-color', 'red'); //Brighter warning
        }
        if (text == "WTG") {
            $(td).addClass('colorbox_yellow');
        }
    });

    hideAverageGradeColumn();
});