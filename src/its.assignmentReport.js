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
    var num = $('.pagesize').html().match(/\d+/g)[2]
    var location = document.location.href;    
    var mainTable = $('table tbody');
    var showButton=true;
    var From = 0;
    var passingGrades=[
        "A", "B", "C", "D", "E", //International
        "G", "VG" , "MVG", //Swedish
        "Klar"  
    ];

    var nonPassingGrades=[
        "F", "U"
    ];

    var hasNotDoneAnythingAverageGradeIdentifyers=[
        "(U)", "(F)", "F/(F)", "U/(U)"
    ];
    var mixedGradesIdentifyers=[
        "** "
    ];

    var resubmitIdentifyers=[
        "Needs", "rättad"
    ];
    var resubmitText="RE";
    var resubmitTitle="They need to resubmit";
    
    var needsGradingIdentifyers=[
        "Resub", "skicka"
    ];
    var needsGradingText="NG";
    var needsGradingTitle="They have resubmitted. Needs grading.";

    var textsToReplaceWithG=[
        "Godkänd"
    ];

    var cellsToClear=[
        "Inte", "sub", "No assessment"
    ];
    var peopleList=[];

    function addPersonalNumberColumn(){
        if(isColumnAdded)
            return;
        $(".tablelisting table tr:lt(1)").prepend("<th>Personnummer</th>");
        $(".tablelisting table tr:gt(0)").prepend("<td>#</td>");
        addPeopleToList(); //needs to be done once.. so here is a good place... (since the column needs to be added)
        isColumnAdded=true;
    }

    function addPeopleToList(){
         mainTable.find('tr').find('td:nth-child(2)').each(function (i, td) {
            var name = $(this).text().replace(',', '');
            peopleList.push(name);
        });
    }

    function hideAverageGradeColumn(){
        mainTable.find("tr:lt(1) th:last-child").hide();
        mainTable.find("tr:gt(0) td:last-child").hide();
    }

   
    if (location.indexOf('&') != -1)
        location = location.substr(0, location.indexOf('&')); //remove extra parameters

    $('tr:not(.header)', mainTable).remove(); //clear the table    
    
    function findCellsThatContains(rows, identifyers){
        var question="";
        for(var i=0;i<identifyers.length;i++)
        {
            question+='td:contains("'+identifyers[i]+'")';
            if(i<identifyers.length-1) question+=", ";
        }
       
        return rows.find(question);
    }


    while (num > 0) {
        $.ajax({
            url: location,
            data: { From: From, Show: 100 },
            success: function (d) {
                var rows = $('table tr:not(.header)', d);

                rows.find('td:first').attr('nowrap', '');
                
                findCellsThatContains(rows, needsGradingIdentifyers).text(needsGradingText).attr('title',needsGradingTitle);
                findCellsThatContains(rows, resubmitIdentifyers).text(resubmitText).attr('title', resubmitTitle);
                
                rows.find('td span').remove(); //remove the keywords (Klar, ...)
                //rows.find('a').replaceWith(function (a) { return $(this).text(); }); //remove links ... why? link is destroyed anyway...
                

                //Decorate all rows that have not an avarage of pass with incomplete
                //Might be usefull.. not used(???)
                findCellsThatContains(rows, nonPassingGrades).each(function (i, td) {
                    $(td).closest('tr').addClass('incomplete');
                });

                //Decorate all rows with people who has not submited anything
                rows.find('td:last').each(function (i, td) {
                    var el = $(td);
                    if($.inArray(el.text(), hasNotDoneAnythingAverageGradeIdentifyers)!=-1 || el.text().indexOf('0 Godkänd, 0') >= 0)
                        $(td).closest('tr').addClass('idiot');
                    //Check if the grades are mixed.. and if.. diable the button
                    if($.inArray(el.text(), mixedGradesIdentifyers))
                        showButton=false;
                    
                });
                findCellsThatContains(rows,cellsToClear).text(''); //Needs to be done here else courses with grades like "0 Godkänd, 0/(5) Inte godkänd" wont be marked
                //remove * from everywhere
                rows.find('td:contains("*")').text(function (a) { return $(this).text().replace("*", ""); });// same as above
                
                //Should pehaps be made more general???
                rows.find('td').each(function() {  //Courses with only Godkänt... replace with G
                    for(var index=0; index<textsToReplaceWithG.length;index++)
                    {
                        var text = $(this).text().replace(textsToReplaceWithG[index], 'G');
                        $(this).text(text);
                    }
                });
                mainTable.append(rows);

            }, async: false
        })
        num -= 100;
        From += 100;
    }


    $('.tablefooter, .itsl-toplinks-line, .standardfontsize').remove();

    if(showButton){
        $('<button style="float:right" class="login-button">Hide/Show People with no handins</button>').click(function () {
            mainTable.find('.idiot').toggle();
        }).prependTo($('body'));
    }else{
        $('<label style="float:right">Mixed grades. Cant toggle people.</label>').prependTo($('body'));
    }


    var personWithSameNameWarning="## Duplicate name ##";
    //Add button for injecting personalnumbers
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
            var numberOfpeoplewithThatName=0;
            $.each(peopleList, function(i, item) {
                if (item == name)
                    numberOfpeoplewithThatName++;
            });

            if(numberOfpeoplewithThatName==1){
                for (var i = 0; i < people.length; i++) {
                    if (name.toLowerCase() == people[i][1].toLowerCase()) {
                        if($(this).prev().text()=='#' || $(this).prev().text()==people[i][0])
                            $(this).prev().text(people[i][0]);
                        else{ 
                            alert("You have a different personal number for "+name+
                                " that already has been given a personal number.\n\nThe reason for this might be that your "+
                                "list may contain people with the same name that is not on its learning (then it should "+
                                "have been marked as an duplicate already).\n\n Since you "+
                                "have recieved this message you can not trust the data that have been generated here. "+
                                "Please locate the error!");
                        }
                    }
                }
            }else if(numberOfpeoplewithThatName>1){
                $(this).prev().text(personWithSameNameWarning).css('background-color', 'red');
            }
        });


    }).prependTo($('body'));

    $('body').prepend($('<textarea placeholder="Paste personal numbers here (psn | name)" style=width:400px /> <br />'));

    mainTable.find('td').each(function (i, td) {
        var text = $(td).text().trim();
        if ($.inArray(text, passingGrades)!=-1) {
            $(td).addClass('colorbox_green');
        }
        //if (text == "G" || text == "C") {
        //    $(td).html($('<span/>', { text: text, class: 'colorbox_blue' }));
        //}
        if (text == needsGradingText) {
            $(td).css('background-color', 'red'); //Brighter warning
        }
        if (text == resubmitText) {
            $(td).addClass('colorbox_yellow');
        }
    });

    hideAverageGradeColumn();
});