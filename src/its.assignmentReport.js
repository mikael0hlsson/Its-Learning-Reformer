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
	displaySpinner();
    var isColumnAdded=false;
    var numberOfPages = $('.ccl-pager li:nth-last-child(2)').text(); //Number of pages
    // var location = document.location.href;    
    var mainTable = $('#assignments-table tbody');
    // var showButton=true;
    // var From = 0;
    var passingGrades=[
        "A", "B", "C", "D", "E", //International
        "G", "VG" , "MVG", //Swedish
    ];
    var missingPersonalNumberText="#";
    var nonPassingGrades=[
        "f", "u"
    ];

    // var hasNotDoneAnythingAverageGradeIdentifyers=[
        // "(U)", "(F)", "F/(F)", "U/(U)"
    // ];
    // var mixedGradesIdentifyers=[
        // "** "
    // ];

   
    function displaySpinner(){
		
		$("body").append('<div id="SpinnerSpinn" style="position: fixed;width: 100%; height: 100%;background: black url(http://www.ajaxload.info/cache/FF/FF/FF/00/00/00/36-1.gif) center center no-repeat;opacity: .5; top:0px; left:0px;z-index:1000">MUHAHAHA</div>');
	}
	
	function removeSpinner(){
		$("#SpinnerSpinn").remove();
	}
    

    var textsToReplaceWithG=[
        "Godkänd"
    ];

    // var cellsToClear=[
        // "Inte", "sub", "No assessment", "Ingen bedömning"
    // ];
    var peopleList=[];

    function addPersonalNumberColumn(){
        if(isColumnAdded)
            return;
        $("#assignments-table tr:first").prepend	("<th  width='200px'>Personnummer</th>"); //the "real header"
		$(".fixedHeader tr:first").prepend	("<th width='200px'>Personnummer</th>"); //the floating header
        var newWidth=$('.fixedHeader table:first').width()+220;
		$('.fixedHeader table:first').width(newWidth);
		$('#assignments-table').width(newWidth);
		$("#assignments-table tr:not(:first)").prepend("<td>"+missingPersonalNumberText+"</td>");
        addPeopleToList(); //needs to be done once.. so here is a good place... (since the column needs to be added)
        isColumnAdded=true;
    }

    function addPeopleToList(){
         mainTable.find('tr').find('td:nth-child(1)').each(function (i, td) {
            var name = $(this).text().replace(',', '').trim().toLowerCase();
		
            peopleList.push(name);
        });
    }


	 function findCellsThatContains(rows, identifyers){
        var question="";
        for(var i=0;i<identifyers.length;i++)
        {
            question+='td:contains("'+identifyers[i]+'")';
            if(i<identifyers.length-1) question+=", ";
        }
       
        return rows.find(question);
    }
   
   
   var notSubmittedIdentifyers=[
        "Not submitted"
    ];
    var notSubmittedText="   ";
    var notSubmittedTitle="They have not submitted the assignment.";
   
   var needsGradingIdentifyers=[
        "Ej granskad", "Inte rättad", "Not assessed"
    ];
    var needsGradingText="NEEDS GRADING!";
    var needsGradingTitle="They have resubmitted. Needs grading.";
	
	 var resubmitIdentifyers=[
		"Ej godkänd, skicka på nytt" , "Komplettera", "Inte godkänt, skicka på nytt"
    ];
    var resubmitText="RE";
    var resubmitTitle="They need to resubmit";
	
	function replaceTexts(){
		var rows = $('#assignments-table tbody tr');

					rows.find('td:first').attr('nowrap', '');
					//Order is important!
					findCellsThatContains(rows, notSubmittedIdentifyers).text(notSubmittedText).attr('title',notSubmittedTitle);
					findCellsThatContains(rows, resubmitIdentifyers).text(resubmitText).attr('title', resubmitTitle);
					findCellsThatContains(rows, needsGradingIdentifyers).text(needsGradingText).attr('title',needsGradingTitle);
					
					$('#assignments-table tbody td').text(function () {
						return $(this).text().replace("Klar", ""); 
					});
					
					
					
					findCellsThatContains(rows, textsToReplaceWithG).text("G");
					//Remove all other bs
					
					$('#assignments-table').find('br').remove(); //remove line feeds
					$('#assignments-table span').contents().unwrap(); //remove spans
					rows.find('img').remove(); //remove image
					
					
					
					/*
					//Decorate all rows with people who has not submited anything
					rows.find('td:last').each(function (i, td) {
						var el = $(td);
						if($.inArray(el.text(), hasNotDoneAnythingAverageGradeIdentifyers)!=-1 || el.text().indexOf('0 Godkänd, 0') >= 0)
							$(td).closest('tr').addClass('idiot');
						//Check if the grades are mixed.. and if.. diable the button
						if($.inArray(el.text(), mixedGradesIdentifyers))
							showButton=false;
						
					});
					*/
	}

	

	function loadAllPeople(){
		
		for(var page=1;page<=numberOfPages;page++){
			$( "input:hidden[name=__EVENTTARGET]" ).val('ctl00$ContentPlaceHolder$GridPager');
			$( "input:hidden[name=__EVENTARGUMENT]" ).val('PageNumber_'+page);
			var $form=$('#aspnetForm'),
			url=$form.attr("action")
			values=$form.serialize();
			
			$.ajax({
				type:		'POST',
				url:		url,
				data:		values,
				success: 	function(data){
					var content=$(data).find('#assignments-table tbody tr');
					mainTable.append(content);
				},
				async:		false
			});
		}
		addPeopleToList();
		
	}

    //$('.tablefooter, .itsl-toplinks-line, .standardfontsize').remove();


    var personWithSameNameWarning="## Duplicate name ##";
    //Add button for injecting personalnumbers
    

		function addInjectHtml(){
	$('<button class="login-button">Inject Personal Numbers</button>').click(function () {
		addPersonalNumberColumn();
		
		//
		var str = $('textarea').val();

		var arr = str.split('\n'); var people = [];
		for (var i = 0; i < arr.length; i++) {
			if (arr[i] == "") continue;
			people.push(arr[i].replace(',', '').split('\t'));
		}

		mainTable.find('tr').find('td:nth-child(2)').each(function (i, td) {
			
			var name = $(this).text().replace(',', '').trim();
			
			var numberOfpeoplewithThatName=0;
			$.each(peopleList, function(i, item) {
				if (item.toLowerCase() == name.toLowerCase()){
					numberOfpeoplewithThatName++;
				}
			});

			if(numberOfpeoplewithThatName==1){
				for (var i = 0; i < people.length; i++) {
				
					if (name.toLowerCase() == people[i][1].toLowerCase()) {
					
						if($(this).prev().text()==missingPersonalNumberText || $(this).prev().text()==people[i][0])
						{	
							$(this).prev().text(people[i][0]);
						}else{ 
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
}
	
	function colorData(){
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
	}
	
	
	 // if (location.indexOf('&') != -1)
        // location = location.substr(0, location.indexOf('&')); //remove extra parameters

    //$('tr:not(.header)', mainTable).remove(); //clear the table    
    
	
    // if(showButton){
        // $('<button style="float:right" class="login-button">Hide/Show People with no handins</button>').click(function () {
            // mainTable.find('.idiot').toggle();
        // }).prependTo($('body'));
    // }else{
        // $('<label style="float:right">Mixed grades. Cant toggle people.</label>').prependTo($('body'));
    // }

	//EXECUTION ORDER!

	$('tr', mainTable).remove(); //clear the table    
	loadAllPeople();
	$('.ccl-pager').hide(); //hide pager
	addInjectHtml();
	replaceTexts();
	colorData();
	removeSpinner();
});
