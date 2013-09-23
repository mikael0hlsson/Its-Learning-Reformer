// ==UserScript==
// @name       Itslearning.Dashboard
// @namespace  Itslearning
// @version    0.1
// @description  enter something useful
// @match      *mah.itslearning.com/Dashboard/Dashboard.aspx*
// @copyright  Ali Arafati
// ==/UserScript==

if(chrome.extension)
    chrome.extension.sendRequest({}, function(response) {});

$(function(){
    var swedish=false;

    var courseWidget = getWidget(document, "Courses");
    if(courseWidget.length==0){
        courseWidget = getWidget(document, "Kurser");
        swedish=true;
    }
    init();
    
    function init(){
        
        var button = 
            $('<button/>', {class:'login-button', id:'seeAllTasks', text: 'See All Tasks', css:{'cursor': 'pointer'}})
        .appendTo(courseWidget.find('.il-widget-header-button'))
        .click(btnTasks_clicked);   
        
        var newsWidget = $('#ctl00_ContentPlaceHolder_DashboardLayout li:first').hide();
          }
    
    function btnTasks_clicked(e)
    {
        e.preventDefault();        
        courseWidget.find('a').each(function(i, anchor){
            var href = anchor.href.replace("main.aspx", "Course/course.aspx");
            //https://mah.itslearning.com/Course/course.aspx?CourseId=17363
            //https://mah.itslearning.com/main.aspx?CourseID=17365
            
            var row = $(anchor).closest('tr');            
            row.find('td:nth-child(3)').text('...').css('width', '20%');
    
            $.get(href, function(html){
                row.find('td:nth-child(3)').html(getTasksFromCoursePage(html)).find('div:first').show('fast', showNext);                               
            });
        });
        
        courseWidget.find('th:last').text("Tasks");
        $('#seeAllTasks').hide();
    }
    
    function getTasksFromCoursePage(html)
    {
       
        var taskWidget;
        if(!swedish) 
            taskWidget= getWidget(html, "Follow up tasks");
        else
            taskWidget= getWidget(html, "Följ upp uppgifter");
        var list = taskWidget.find('.il-widget-bottom ul li');
        
        var tasks = $.map(list, function(li, i){
            var text = $(li).text();
            var num = text.match(/\d+/g)[0];
            var type = $(li).find('img').attr('alt');
            
            var anchor = $('<a/>', {href: $(li).find('a:first').attr('href')});
            
            return anchor.append(notificationTag(num, text, type)).appendTo('<div/>').parent().hide()[0].outerHTML;
        });
        
        return tasks.join('');
    }
    
    function showNext()
    {
        $(this).next("div").show("fast", showNext);  
    }
    
    function notificationTag(num, title, type)
    {
        return $('<span/>', {text: num, class: 'ilw-itsl-contentblock-course-project-table-notificationbox', title: title, 
                             css: {
                                 float: 'left',
                                 margin: '3px',
                                 'background-color': (type == 'Survey'? 'lightblue' : 
                                                      type == 'NttTest'? 'lightgreen' :'#f47626')
                             }});
    }
    
    function getWidget(doc, name)
    {
        return $('h2:contains("'+ name +'")', $(doc)).closest('.il-widget');
    }
});
