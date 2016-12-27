var objChapters;
var objTypes;
var objClass;
var objQuestions;
var objConfig = new Object();
var objSelectedQues = new Object();
var getQuestionsArray = [];

// Constants
var ConstQuesModeEntireBook = "ENTIREBOOK";
var ConstQuesModeChapter = "CHAPTERS";
var ConstSelModeManual = "MANUAL";
var ConstSelModeRandom = "RANDOM";
var ConstPdfFormat = "PDF";
var ConstDocFormat = "DOC";
var ConstStudentCopy = "Student";
var ConstTeacherCopy = "Teacher";
var ConstBothCopy = "Both";

var defaultinstruction = "";
objSelectedQues.selmode = ConstSelModeManual;
objSelectedQues.quesmode = ConstQuesModeEntireBook;
objSelectedQues.schoolName = "";
objSelectedQues.testName = "";
objSelectedQues.instructions = defaultinstruction;
objSelectedQues.schoolLogo = "";
objSelectedQues.types = [];
objSelectedQues.maximumtimeduration = 4;
objSelectedQues.timeoftest = "";
objSelectedQues.documentFormat = ConstDocFormat;
objSelectedQues.copyType = ConstStudentCopy;
objSelectedQues.TotalMarks = 0;
var classNumber = 1;

/*Global Variable to maintain user's changes */
var currentFilterId="";
var isSelectionChanged=false;

$(document).ready(function () {

    // Calling method to load list of recently saved test
    loadConfigFile();

    $("#marks_detail").css("display", "none");

    // div containing table for marks of each selected question hided

    $("#Test_Detail_Section").css("display", "none");

    // div containing information about school hided.

    $("#Preview_Section").css("display", "none");
    $("#cmdCopyType").hide();
    $("#Preview_buttons").css("display", "none");
    $("#Download_section").css("display", "none");
    $("#Download_buttons").css("display", "none");
    $("#Detail_buttons").css("display", "none");

    // div containing preview of question paper hided.

    var i = 0;
    $("#left_acordion").click(function () {// left_side_acordion div hide/show

        $("#recentOptions").toggle(0, function () {
            var maxHeight = (450 - $(".recentouter").height()) + "px";
            $(".listContainerP").css("max-height", maxHeight);
           
            if ($(this).is(':visible')) {
                $("#left_acordion").removeClass("recent_text_right").addClass("recent_text_right_second_state");
            } else {
                $("#left_acordion").removeClass("recent_text_right_second_state").addClass("recent_text_right");
            }
        });

    });

    // Binding button events
    $("#btnChapter").unbind("click").bind("click", btnChapterClick);
    $("#btnBook").unbind("click").bind("click", btnBookClick);
    $("#btnPdfFormat").unbind("click").bind("click", DocumentFormat);
    $("#btnDocFormat").unbind("click").bind("click", DocumentFormat);
    $("#btnStudentCopy").unbind("click").bind("click", SetCopyType);
    $("#btnTeacherCopy").unbind("click").bind("click", SetCopyType);
    $("#btnBothCopy").unbind("click").bind("click", SetCopyType);

    $.ajax({
        url: 'content/quesdb.xml',
        type: "GET",
        dataType: "xml",
        success: function (data) {
            dataLoadCompleteHandler(data);
        },
        error: function () {
            console.log(' unable to load ');
        }
    });

    bindProperties();

});

/*
 * Method for validation of numeric text boxes.
 */

function bindProperties() {

	$(".numeric").numeric();
	$(".integer").numeric(false, function() {
		alert("Integers only");
		this.value = "";
		this.focus();
	});
	$(".positive").numeric({
		negative : false
	}, function() {
		alert("Enter only positive values");
		this.value = "";
		this.focus();
	});
	$(".positive-integer").numeric({
		decimal : false,
		negative : false
	}, function() {
		alert("Enter only positive values");
		this.value = "";
		this.focus();
	});
	$("#remove").click(function(e) {
		e.preventDefault();
		$(".numeric,.integer,.positive").removeNumeric();
	});
}

function dataLoadCompleteHandler(data) {
	var objData = $.xml2json(data);
	var objXmlData = objData;

	objTypes = objXmlData.table[0];
	objChapters = objXmlData.table[1];
	objQuestions = objXmlData.table[2];
	//  objClass =  objXmlData.table[3];
}


function btnChapterClick() {
    $("#divCmd").removeClass("bottom_submit_buttons_start");
    activateFilterButton("btnChapter");
    switchBackGround();
    listInitialize("btnChapter");
}

function btnBookClick() {
    $("#divCmd").removeClass("bottom_submit_buttons_start");
    activateFilterButton("btnBook");
    switchBackGround();
    listInitialize("btnBook");
}

function switchBackGround() {
    $("#listContainerP").removeClass("default_bgcolor").addClass("switch_bgcolor");
    $(".rightSection").removeClass("default_bgcolor").addClass("switch_bgcolor");
}



/*
    Funciton to switch filter button's css based.
*/
 function deactivateFilterButtons() {
     $("#btnManual").removeClass("filter_button_active");
     $("#btnRandom").removeClass("filter_button_active");
     $("#btnChapter").removeClass("filter_button_active");
     $("#btnBook").removeClass("filter_button_active");
 }

 /*
 Funciton to switch filter button's css based.
 */
 function activateFilterButton(buttonName) {
     $("#btnManual").removeClass("filter_button_active");
     $("#btnRandom").removeClass("filter_button_active");

     if (buttonName == "btnBook" || buttonName == "btnChapter") {
         $("#btnChapter").removeClass("filter_button_active");
         $("#btnBook").removeClass("filter_button_active");
         $("#btnManual").addClass("filter_button_active");
     }
     $("#" + buttonName).addClass("filter_button_active");
 }

 /*
 * Method to initialize chapter/ type list in left panel.
 */
 function listInitialize(buttonName) {
	if (((objSelectedQues.types).length) === 0) {
		reset();

		objSelectedQues.selmode = ConstSelModeManual;

		if (buttonName == "btnChapter")
			displayLeftList(ConstQuesModeChapter);
		else
			displayLeftList(ConstQuesModeEntireBook);
	} else {

		Overlaydisplay();
	}
}

/*
 * Method to set Document format to download the paper.
 */
function SetCopyType(event) {
    $("#selectTeacherRadio").removeClass("view_radio_active").addClass("view_radio_inactive");
    $("#selectBothRadio").removeClass("view_radio_active").addClass("view_radio_inactive");
    $("#selectStudentRadio").removeClass("view_radio_active").addClass("view_radio_inactive");

    if (event.currentTarget.id == "btnStudentCopy") {
        objSelectedQues.copyType = ConstStudentCopy;
        $("#selectStudentRadio").removeClass("view_radio_inactive").addClass("view_radio_active");
    } 
    else if (event.currentTarget.id == "btnBothCopy") {
        objSelectedQues.copyType = ConstBothCopy;
        $("#selectBothRadio").removeClass("view_radio_inactive").addClass("view_radio_active");
    }
    else
      {
		objSelectedQues.copyType = ConstTeacherCopy;
		$("#selectTeacherRadio").removeClass("view_radio_inactive").addClass("view_radio_active");
	}
}

/*
 * Method to set Document format to download the paper.
 */
function DocumentFormat(event) {
	if (event.currentTarget.id == "btnDocFormat") {
		objSelectedQues.documentFormat = ConstDocFormat;
	} else {
		objSelectedQues.documentFormat = ConstPdfFormat;
    }
    downloadPaper();
}

/*
 * Method to initialize chapter/ type list in left panel.
 */
function ChangeSelectionMode() {
	if (((objSelectedQues.types).length) === 0) {
		reset();

		objSelectedQues.selmode = ConstSelModeManual;

		if (event.currentTarget.id == "btnChapter")
			displayLeftList(ConstQuesModeChapter);
		else
			displayLeftList(ConstQuesModeEntireBook);
	} else {
		Overlaydisplay();
	}
}

function displayLeftList(questionMode) {

	var tableData = null;
	$(".select_qus_outer").css("visibility", "hidden");

	$("#btnAutoSelect").hide();
	$("#btnSubmit").show();

	$("#btnManual").unbind("click").bind("click", ManualModeClick);
	$("#btnRandom").unbind("click").bind("click", RandomModeClick);

	$("#listContainer").children().remove();
	if (questionMode == ConstQuesModeChapter) {
		objSelectedQues.quesmode = ConstQuesModeChapter;
		tableData = objChapters;

    	// Magic -- Added for demo cd only.
		//var obj = tableData.records.record;
		//$("#listContainer").append('<div id="lst_' + obj.ch_id + '" class="listitem" >' + obj.ch_nm + '</div>');
		//$('#lst_' + obj.ch_id).unbind('click').bind('click', chapterClick);

		//		 Magic -- Commented for demo cd only.
	
		 $.each(tableData.records.record, function(i, obj) {
		    $("#listContainer").append('<div title="' + obj.ch_nm + '" id="lst_' + obj.ch_id + '" class="listitem" >' + obj.ch_nm + '</div>');
		    $('#lst_' + obj.ch_id).unbind('click').bind('click', chapterClick);
		 });

	} else {
		tableData = objTypes;
		objSelectedQues.quesmode = ConstQuesModeEntireBook;
		$.each(tableData.records.record, function(i, obj) {
		    $("#listContainer").append('<div title="' + obj.ty_nm + '" id="lst_' + obj.ty_id + '" class="listitem" >' + obj.ty_nm + '</div>');
			$('#lst_' + obj.ty_id).unbind('click').bind('click', typeClick);
		});

	}
}

/*
 / Method to reset all the containers and question array.
 */
function reset() {
	$("#listContainer").children().remove();
	$('#detailsection').children().remove();

	objSelectedQues.selmode = ConstSelModeManual;
	objSelectedQues.quesmode = ConstQuesModeEntireBook;
	objSelectedQues.schoolName = "";
	objSelectedQues.testName = "";
	objSelectedQues.instructions = defaultinstruction;
	objSelectedQues.schoolLogo = "";
	objSelectedQues.types = [];
	objSelectedQues.maximumtimeduration = 4;
	objSelectedQues.timeoftest = "";
	objSelectedQues.questions = [];
	objSelectedQues.types = [];
	objSelectedQues.TotalMarks = 0;
}

/*
 Method to disable (#btnSubmit) save_button for saving questions selected.
 */
function save_button_disable() {
	$('#btnSubmit').attr('disabled', 'disabled');
	$('#btnSubmit').removeClass('save_button_active').addClass('save_button_inactive');
}

/*
 Method to enable (#btnSubmit) save_button for saving questions selected.
 */
function save_button_enable() {
	$('#btnSubmit').removeAttr('disabled');
	$('#btnSubmit').removeClass('save_button_inactive').addClass('save_button_active');
}

//clicking the last unchecked or checked checkbox should check or uncheck the parent checkbox
function childClicked(ev) {
	
	isSelectionChanged = true;

	var Id = '#' + ev.id;
	var parentId = '#chkcat' + $(Id).attr('catId');
	var childClass = '.' + $(Id).attr('class');

	if (((objSelectedQues.types).length) === 0) {
		save_button_disable();
	}
	var flag = true;
	$(Id).parents('#detailsection').find(childClass).each(function() {
		if (this.checked == false)
			flag = false;
	});

	$(parentId).attr('checked', flag);
	select_question_checkbox();
	check_reset_save();
}

//clicking the parent chec;kbox should check or uncheck all child checkboxes
function parentClicked(ev) {
	isSelectionChanged = true;
	var parentId = '#' + ev.id;
	var parentClass = '.' + ev.id;
	$(parentId).parents('#detailsection').find(parentClass).attr('checked', ev.checked);

	save_button_enable();

	if (ev.checked) {
		EnableResetSelect();
	} else {
		check_reset_save();
	}
	select_question_checkbox();
}

/* 
	Method to handle Yes confimation on Filter switching without saving 
	current changes.
*/

function handleFilterSwitch()
{
	Overlaydismiss();
	switchFilter(currentFilterId);
}

/*
 Method to handle list item (type) click event on left pannel
 and display associated questions to preview area (detailsection div).
 */
function typeClick(event) {
	currentFilterId = event.currentTarget.id;

	if (isSelectionChanged == true)
	{
		OverlaydisplaySwitchFilter();
	}
	else
	{
		switchFilter(currentFilterId);
	}
}

/*
 Method to handle list item (chapter) click event on left pannel
 and display associated questions to preview area (detailsection div).
 */
function switchFilter(switchedFilterId)
{
	isSelectionChanged = false;

	$(".listitem").removeClass("listitem_select_used");

	if (objSelectedQues.selmode == ConstSelModeManual) {
		$('#detailsection').children().remove();

		var ty_id = switchedFilterId; 
		$("#" + ty_id).addClass("listitem_select_used");
	
		ty_id = replaceAll('lst_', '', ty_id);
		objSelectedQues.ch_id = ty_id;

		if ((objSelectedQues.quesmode == ConstQuesModeEntireBook))
		{
			var queryResult = getQuestionsByTypeId(ty_id);
			displayQuestionData(queryResult);
		}
		else
		{
			var queryResult = getQuestionsByChapterId(ty_id);
			displayQuestionData(queryResult);
		}
	}
}

/*
 Method to handle list item (chapter) click event on left pannel
 and display associated questions to preview area (detailsection div).
 */
function chapterClick(event) {
	currentFilterId = event.currentTarget.id;

	if (isSelectionChanged == true)
	{
		OverlaydisplaySwitchFilter();
	}
	else
	{
		switchFilter(currentFilterId);
	}

/*	$(".listitem").removeClass("listitem_select_used");
	if (objSelectedQues.selmode == ConstSelModeManual) {
		$('#detailsection').children().remove();

		var ch_id = event.currentTarget.id;
		$("#" + ch_id).addClass("listitem_select_used");
		ch_id = replaceAll('lst_', '', ch_id);
		objSelectedQues.ch_id = ch_id;

		var queryResult = getQuestionsByChapterId(ch_id);
		displayQuestionData(queryResult);
	}*/
}

/*
 Method to display question data.
 */
function displayQuestionData(queryResult) {
    if (queryResult == null || queryResult.length == 0)
		return;
    if (objSelectedQues.quesmode != ConstQuesModeEntireBook)
        $('#detailsection').append('<div  id="select_all_qust" class="select_all_qust"><input type="checkbox" id="select_all_new" onclick="select_all_maunal(this)"> Select all</div>');

	var catId = null;

	$.each(queryResult, function (i, question) {
	    if (catId != question.qu_ca_id) {
	        catId = question.qu_ca_id;

	        var queryTypes = Enumerable.From(objTypes.records.record).Where(function (x) {
	            return x.ty_id === catId;
	        }).ToArray();

	        var totalQuestionsofType = 0;
	        var selectedQuestions = 0;

	        totalQuestionsofType = Enumerable.From(queryResult).Where(function (x) {
	            return x.qu_ca_id === catId
	        }).ToArray().length;

	        // Getting number of selected question based on chapter/ book Mode. 
	        if (objSelectedQues.quesmode == ConstQuesModeEntireBook) {
	            selectedQuestions = getSelectedQuestionsByTypeId(catId).length;
	        } else {
	            selectedQuestions = getSelectedQuestionsByChapterandTypeId(catId, objSelectedQues.ch_id).length;
	        }

	        var typeChkId = "#chkcat" + queryTypes[0].ty_id;

	        $('#detailsection').append('<input id="chkcat' + queryTypes[0].ty_id + '" type="checkbox" style="float:left;" class="parentCheckBox" onClick="parentClicked(this)"  /><div class="questionType" id="' + queryTypes[0].ty_id + '" >' + queryTypes[0].ty_nm + '</div><br/>');

	        if (selectedQuestions > 0 && totalQuestionsofType == selectedQuestions)
	            $(typeChkId).attr('checked', 'checked');
	    }

	    //Checking for already selected questions for the chapter/ type.
	    var strChecked = "";
	    if (objSelectedQues.questions != null) {
	        $.each(objSelectedQues.questions, function (i, ques) {
	            if (ques.qu_id == question.qu_id) {
	                strChecked = "checked";
	            }
	        });
	    }

	    // section to indent questions parts.
	    var i = 0;
	    var res = question.qu_text.split('</br>');

	    var innerDiv = '<div style="margin-left:20px;"> ';
	    var innerData = "";

	    if (res.length > 1) {
	        for (i = 0; i < res.length; i++) {
	            
                if (i < 1) {
	                $('#detailsection').append('<div class="questionDiv" id="' + question.qu_id + '" ><input id="chk' + question.qu_id + '" catid="' + catId + '" chid="' + question.qu_ch_id + '" type="checkbox" class="chkcat' + catId + '" ' + strChecked + ' onClick="childClicked(this)" />' + res[i] + '</div><br/>');
	            } else {
	               

	                if (res[i] != "") {
	                    innerData += res[i];

	                    if (res[i].indexOf('table') < 0) {
	                        innerData += '</br>'
	                    }

	                }
	            }
	        }
	        if (innerData != "") {
	            $('#' + question.qu_id).append(innerDiv + innerData + '</div>');
	        }
	    } else
	        $('#detailsection').append('<div class="questionDiv" id="' + question.qu_id + '" ><input id="chk' + question.qu_id + '" catid="' + catId + '" chid="' + question.qu_ch_id + '" type="checkbox" class="chkcat' + catId + '" ' + strChecked + ' onClick="childClicked(this)" />' + question.qu_text + '</div><br/>');

	});

	select_question_checkbox();
}

/*
 / Method to handel click event of SubmitAndView button.
 */
function SubmitAndView() {
	isSelectionChanged = false;

	var totalselected_qus = 0;

	if (objSelectedQues.questions == null)
		objSelectedQues.questions = [];

	if (objSelectedQues.selmode == ConstSelModeManual) {
		selectManualModeQuestions();
		EnableNextSave();
	} else {
		DisableNextSave();
		selectRandomModeQuestions();
	}
	addSelectedTypes();
	displaySelectedQuestionCount();

//	manageEditQuestionButton();
}

/*
* Method to manage state of EditQuesitonButton, based on the number of question selected by the user.
function manageEditQuestionButton() {
    if (objSelectedQues.questions == null || objSelectedQues.questions.length < 1) {
        $(".edit_question_paper_disabled").show();
        $(".edit_question_paper").css("opacity", "0.4");
    }
    else {
        $(".edit_question_paper_disabled").hide();
        $(".edit_question_paper").css("opacity", "1");
    }
}*/



function displaySelectedQuestionCount(selectedQuestions) {
	var totalselected_qus = 0;
	if (selectedQuestions > 0)
		totalselected_qus = selectedQuestions;
	else {		
		$.each(objSelectedQues.types, function(index, value) {
			totalselected_qus += parseInt(value.Sel_QU_COUNT);
		});
	}

	if (totalselected_qus > 1) {
		$(".select_qus_outer").css("visibility", "visible");
		$("#QuestionSelected").text(totalselected_qus + " Questions");
	} else if (totalselected_qus === 1) {
		$(".select_qus_outer").css("visibility", "visible");
		$("#QuestionSelected").text(totalselected_qus + " Question");
	} else {
		$(".select_qus_outer").css("visibility", "hidden");
		$("#QuestionSelected").text("");
	}
}

/*
 Method to select chapters/ types in left list on clicking the save button
 in Manual Mode.
 */
function selectManualModeQuestions() {
	// Removing question from existing chapter from selection.
	var i = 0;
	var tempQues = [];

	for ( i = 0; i < objSelectedQues.questions.length; i++) {
		if (objSelectedQues.quesmode == ConstQuesModeChapter) {
			if (objSelectedQues.questions[i].qu_ch_id != objSelectedQues.ch_id) {
				tempQues.push(objSelectedQues.questions[i]);
			}
		} else {
			if (objSelectedQues.questions[i].qu_ca_id != objSelectedQues.ch_id) {
				tempQues.push(objSelectedQues.questions[i]);
			}
		}
	}
	objSelectedQues.questions = null;
	objSelectedQues.questions = tempQues;
	tempQues = null;

	var hightlightId = '';
	// Travering selected questions in html.
	$('#detailsection').children('.questionDiv').each(function() {

		// Removing hightlighting class
		if (objSelectedQues.quesmode == ConstQuesModeChapter)
			$('#lst_' + $(this).children('input').attr('chid')).removeClass("listitem_select");
		else
			$('#lst_' + $(this).children('input').attr('catid')).removeClass("listitem_select");

		if ($(this).children('input').attr('checked') == 'checked') {

			objQues = new Object();
			objQues.qu_id = $(this).attr('id');
			objQues.qu_ch_id = $(this).children('input').attr('chid');
			objQues.qu_ca_id = $(this).children('input').attr('catid');

			objSelectedQues.questions.push(objQues);

			// Adding class to highlight selected item in left panel
			if (objSelectedQues.quesmode == ConstQuesModeChapter)
				hightlightId = '#lst_' + objQues.qu_ch_id;
			else
				hightlightId = '#lst_' + objQues.qu_ca_id;
		}
	});

	$(hightlightId).addClass("listitem_select");
}

/*
 Method to select chapters/ types in left list on clicking the save button
 in Auto/Random Mode.
 */
function selectRandomModeQuestions() {
	objSelectedQues.questions = [];
	var atleast_onerandom = "false";

	//if (objSelectedQues.quesmode == ConstQuesModeChapter) {
		check_all_chapters();
//	}
	$('#listContainer').children('.listitem').each(function() {

		// Removing hightlighting class
		$('#' + $(this).attr('id')).removeClass("listitem_select");

		if ($(this).children('input').attr('checked') == 'checked') {

			atleast_onerandom = "true";

			var selId = $(this).attr('id');
			selId = replaceAll('lst_', '', selId);

			// Adding class to highlight selected item in left panel
			//$('#' + $(this).attr('id')).addClass("listitem_select");

			var objQuestions = null;
			if (objSelectedQues.quesmode == ConstQuesModeChapter) {
				objQuestions = getQuestionsByChapterId(selId);
			} else {
				objQuestions = getQuestionsByTypeId(selId);
			}

			$.each(objQuestions, function(index, ques) {

				objQues = new Object();
				objQues.qu_id = ques.qu_id;
				objQues.qu_ch_id = ques.qu_ch_id;
				objQues.qu_ca_id = ques.qu_ca_id;
				objSelectedQues.questions.push(objQues);
			});
		}

	});

	if (atleast_onerandom == "false") {
		$('#detailsection').children().remove();
	} else {
		displayRandomModeQuestions();
	}

}

function displayRandomModeQuestions() {

	$('#detailsection').children().remove();

	$('#detailsection').append('<div class="select_random_heading"><div class="select_random_heading_instruction"> Select question type(s) to include in the question paper.  </div>   </div>');

	$('#detailsection').append('<div id="random_mode_ques" class="marks_table"> </div>');

	$("#random_mode_ques").append("<div class='random_table_head'><div class='Question_type_randomHead'>Question type</div><div class='Question_count_random'>Available questions</div><div style='margin-left:8px;' class='Question_count_random'>Selected questions</div></div>");
	$("#random_mode_ques").append("<div id='question_marks_table1' style='max-height:410px;' class='divQuestionMarks'></div>");
	setTimeout(function() {

		$.each(objSelectedQues.types, function(index, value) {

		    $("#question_marks_table1").append("<div class='marks_row_repeat marks_row_bordercolor'> <span class='Question_type_random' title='" + (value.ty_nm) + "' >" + (value.ty_nm) + "</span> <span class='Question_count_random'>" + value.QU_COUNT + "</span> </span> <span style='margin-left:8px;' class='Question_count_random'>  <input type='text' class='new_select_random positive' value='" + value.Sel_QU_COUNT + "' id='Qrandom_select" + value.ty_id + "'></div>");
			$('#Qrandom_select' + value.ty_id).bind('input', function() {
				CheckEnableRandomSave();
			});

		});
		bindProperties();
	}, 10);

}

/*
 Method to enable reset button for selected questions.
 */
function EnableResetSelect() {

	$('#resetselected').removeAttr('disabled');
	$('#resetselected').removeClass('reset_button_inactive').addClass('reset_button');
}

/*
 Method to disable reset button for selected questions.
 */
function DisableResetSelect() {

	$('#resetselected').attr('disabled', 'disabled');
	$('#resetselected').removeClass('reset_button').addClass('reset_button_inactive');
}

/*
 Method to enable reset button for marks section.
 */
function EnableResetMarks() {

	$('#resetmarks').removeAttr('disabled');
	$('#resetmarks').removeClass('reset_button_inactive').addClass('reset_button');
}

/*
 Method to disable reset button for marks section.
 */
function DisableResetMarks() {

	$('#resetmarks').attr('disabled', 'disabled');
	$('#resetmarks').removeClass('reset_button').addClass('reset_button_inactive');
}

function displayAlertTimeOut(errorMsg) {
    $("#overlay").fadeIn();
    $("#selected_more").fadeIn();
    $("#selected_more_text").text(errorMsg);

    setTimeout(function () {
        $("#overlay").fadeOut();
        $("#selected_more").fadeOut();
        $("#Qrandom_select" + value.ty_id).val('');
        $("#selected_more_text").text("");
    }, 2000);

}

/*
 Method to detect whether to enable/disable save button for selected random mode questions
 */
function CheckEnableRandomSave() {

	var buttonState = "Disable";
	$.each(objSelectedQues.types, function(index, value) {
		if ($("#Qrandom_select" + value.ty_id).val() > 0)
			buttonState = "Enable";

		if ($("#Qrandom_select" + value.ty_id).val() > value.QU_COUNT) {

			$("#overlay").fadeIn();
			$("#selected_more").fadeIn();
			$("#selected_more_text").text("Selected questions should not be more than " + value.QU_COUNT);
			$("input").prop('disabled', true);

			setTimeout(function() {
				$("#overlay").fadeOut();
				$("#selected_more").fadeOut();
				$("#Qrandom_select" + value.ty_id).val('');
				$("#selected_more_text").text("");
				$("input").prop('disabled', false);
			}, 2000);
		}

	});

	if (buttonState == "Enable") {
		EnableRandomSave();
		EnableResetSelect();
	} else {
		DisableRandomSave();
		DisableResetSelect();
	}
}

/*
 Method to detect whether to enable/disable save button for selected random mode questions
 */
function EnableRandomSave() {

	$('#btnAutoSelect').removeAttr('disabled');
	$('#btnAutoSelect').removeClass('save_button_inactive').addClass('save_button_active');
}

/*
 Method to detect whether to enable/disable save button for selected random mode questions
 */
function DisableRandomSave() {

	$('#btnAutoSelect').attr('disabled', 'disabled');
	$('#btnAutoSelect').removeClass('save_button_active').addClass('save_button_inactive');
}

/*
 Method to detect whether to enable/disable next button for next screen
 */
function EnableNextSave() {
	$('#btnMarks').removeAttr('disabled');

	$('#btnMarks').removeClass('next_button_inactive').addClass('next_button_active');
}

/*
 Method to detect whether to enable/disable save button for selected random mode questions
 */
function DisableNextSave() {
	$('#btnMarks').attr('disabled', 'disabled');

	$('#btnMarks').removeClass('next_button_active').addClass('next_button_inactive');
}

/*
 Method to uncheck all the checkboxes on select questions page
 */
function ResetSelectQuestions() {
    if (objSelectedQues.selmode == ConstSelModeManual)
    {
	    $('input:checkbox').removeAttr('checked');
	    //$(".select_option").val(0);
    }
    else
    {
        $(".new_select_random").val("");
    }
	save_button_enable();
}

/*
 Method to reset all the marks entered by user
 */
function ResetMarksAssign() {
	$(".qustn_input").val("");
	$(".Question_select_marks").text("0.00");
	$("#TotalMarks_calculated").text("0.00");
	$("#timedurationinput").val([]);
	$('#timeformat').prop('selectedIndex', 0);

	$('#savemarks').attr('disabled', 'disabled');
	$('#savemarks').removeClass('save_marks_button_active').addClass('save_marks_button_inactive');
	//$('#resetmarks').attr('disabled', 'disabled');
	//$("#resetmarks").removeClass("reset_button").addClass("reset_button_inactive");

	$.each(objSelectedQues.types, function (index, ques) {
	    ques.Marks = 0;
	});
	objSelectedQues.timeoftest = "";
}

/*
 Method to reset all the details of test enetered by user
 */
function ResetTestDetails() {

	$("#school_name").val([]);
	$("#assignment_name").val([]);
	$('#instruction_name').val(replaceAll('</br>', '\n', defaultinstruction));
	$("#imgLogo").attr("src", "content/css/images/Upload Logo_combined.png");
	objSelectedQues.schoolLogo = "";
	$('#reset_test_details').attr('disabled', 'disabled');
	$("#reset_test_details").removeClass("reset_button").addClass("reset_button_inactive");
	$('#school_details_save').attr('disabled', 'disabled');
	$("#school_details_save").removeClass("save_button_active").addClass("save_button_inactive");
	$('#PreviewSectionStart').attr('disabled', 'disabled');
	$("#PreviewSectionStart").removeClass("next_button_active").addClass("next_button_inactive");
	displaySelectedQuestionCount();
	$(".select_qus_outer").css("visibility", "hidden");
}

/*
 Method to save number of auto selected questions for different types.
 */
function SaveAutoSelectedQuestions() {
	EnableNextSave();
	var selectedQuestions = 0;
	
    $.each(objSelectedQues.types, function(index, value) {
		if ($("#Qrandom_select" + value.ty_id).val() == '' || $("#Qrandom_select" + value.ty_id).val() == null) {
			value.Sel_QU_COUNT = 0;
		} else {
			value.Sel_QU_COUNT = $("#Qrandom_select" + value.ty_id).val();
		}

		selectedQuestions += parseInt(value.Sel_QU_COUNT);
	});
	displaySelectedQuestionCount(selectedQuestions);
}

/*
 / Method to create collection of question types selected by the user
 / with their count and assigned marks.
 */
function addSelectedTypes() {
	//		objSelectedQues.types = null;
	//		objSelectedQues.types = [];

	$.each(objTypes.records.record, function(index, ques) {

		var objQuestions = Enumerable.From(objSelectedQues.questions).Where(function(x) {
			return x.qu_ca_id === ques.ty_id
		}).ToArray();

		if (objQuestions.length > 0) {
			var objTypeArr = Enumerable.From(objSelectedQues.types).Where(function(x) {
				return x.ty_id === ques.ty_id
			}).ToArray();

			if (objTypeArr.length == 0) {
				var objType = new Object();
				objType.ty_id = ques.ty_id;
				objType.ty_nm = ques.ty_nm;
				objType.sort_id = ques.sort_id;
				objType.QU_COUNT = objQuestions.length;
				objType.Marks = "";
				objType.Class = "";

				if (objSelectedQues.selmode == ConstSelModeManual)
					objType.Sel_QU_COUNT = objType.QU_COUNT;
				else
					objType.Sel_QU_COUNT = "";

				objSelectedQues.types.push(objType);
			} else {
				var objType = objTypeArr[0];
				objType.QU_COUNT = objQuestions.length;

				if (objSelectedQues.selmode == ConstSelModeManual)
					objType.Sel_QU_COUNT = objType.QU_COUNT;
			}

		}
	});

	refineSelectedTypes();
}

/*
 * Method to refine and sort the Selected type array form objSelectedQues.types.
 */
function refineSelectedTypes() {
	var tempTypes = [];
	var TotalMarks = 0;
	if (objSelectedQues.types.length > 0) {
		$.each(objSelectedQues.types, function(index, type) {
			var objQuesArr = Enumerable.From(objSelectedQues.questions).Where(function(x) {
				return x.qu_ca_id === type.ty_id
			}).ToArray();

			if (objQuesArr.length > 0) {
				TotalMarks = (parseFloat(TotalMarks) + parseFloat((type.Marks * type.Sel_QU_COUNT))).toFixed(2);
				tempTypes.push(type);
			}
		});
		objSelectedQues.types = null;
		//objSelectedQues.types = tempTypes;

		objSelectedQues.types = Enumerable.From(tempTypes).OrderBy(function(x) {
			return x.sort_id;
		}).ToArray();

		objSelectedQues.TotalMarks = TotalMarks;

	}
}

/*
 / Method to height light selected chapters/types in left panel.
 */
function heightlightSelection() {

	if (objSelectedQues == null)
		return;

	$.each(objSelectedQues.questions, function(i, ques) {

		if (objSelectedQues.quesmode == ConstQuesModeChapter) {
			if (objSelectedQues.selmode == ConstSelModeRandom)
			    $('#lst_' + ques.qu_ch_id).children('input').attr('checked', 'checked');
            else
                $('#lst_' + ques.qu_ch_id).addClass("listitem_select");

		} else {
			if (objSelectedQues.selmode == ConstSelModeRandom)
			    $('#lst_' + ques.qu_ca_id).children('input').attr('checked', 'checked');
            else
                $('#lst_' + ques.qu_ca_id).addClass("listitem_select");
		}
	});
}

function handlerandomdisplay() {
	Overlaydismiss();
	objSelectedQues.questions = [];
	objSelectedQues.types = [];

	heightlightSelection();
	RandomModeClick();
}

function handlemanualdisplay() {
	Overlaydismiss();
	objSelectedQues.questions = [];
	objSelectedQues.types = [];

	heightlightSelection();
	ManualModeClick();
}

function ManualModeClick() {
    
	if (getSelectedQuestionCount() > 0) {
		OverlaydisplayManual();
    } else {
        activateFilterButton("btnManual");
		objSelectedQues.questions = [];
		objSelectedQues.types = [];
		ManualMode();
	}
}

function getSelectedQuestionCount() {
	var selectedQuestionCount = 0;
	$.each(objSelectedQues.types, function(index, value) {
		selectedQuestionCount += parseInt(value.Sel_QU_COUNT);
});
	return selectedQuestionCount;
}

/*
 / Method to add dynamically checkBox controls to the selected question
 / for Ramdom Selection Mode.
 */
function ManualMode() {
	$("#listContainer #select_all_chapters").remove();
	$(".listitem").removeClass("listitem_select_used listitem_select");
	$("#btnSubmit").show();
	$("#btnAutoSelect").hide();

	$("#select_qus_outer").css("visibility", "hidden");


	$('#detailsection').children().remove();
	objSelectedQues.selmode = ConstSelModeManual;

	$('#listContainer').children('.listitem').each(function() {
		$(this).children('input').remove();
	});

	$('#detailsection').children('.questionDiv').each(function() {
		$(this).children('input').remove();
		var checkQues = $('<input type="checkbox" class="chkbox" />');
		$(this).prepend(checkQues);
	});
}

function RandomModeClick() {
	if (getSelectedQuestionCount() > 0) {
		OverlaydisplayRandom();
} else {
    activateFilterButton("btnRandom");
	RandomMode();
	}
}

/*
 / Method to add dynamically checkBox controls to the selected question
 / for Ramdom Selection Mode.
 */
function RandomMode() {

	$("#listContainer #select_all_chapters").remove();
	$(".listitem").removeClass("listitem_select_used listitem_select");
	$("#btnSubmit").hide();
	$("#btnAutoSelect").show();

	$("#select_qus_outer").css("visibility", "hidden");
	$('#detailsection').children().remove();

	objSelectedQues.selmode = ConstSelModeRandom;
	$('#detailsection').children('.questionDiv').each(function() {
		$(this).children('input').remove();
	});
//	if (objSelectedQues.quesmode == ConstQuesModeChapter) {
		//$('#listContainer').prepend('<div id="select_all_chapters"class="select_all_chapters"> <input type="checkbox" id="SelectAllChapters" onClick="SelectAllChapters(this)">Select All</div>');
//	}

		$('#listContainer').children('.listitem').each(function () {
		    if ($(this).attr('id').indexOf('_part') < 0) {
		        $(this).children('input').remove();
		        var checkQues = $('<input type="checkbox" class="chkbox" onClick="SubmitAndView()" />');
		        $(this).prepend(checkQues);
                $(this).css("margin-top", "2px");
		    }
		});
}

/*
 / Method to pick questions randomly from the selected group.
 */
function PickQuestions() {
	var pickval = new Number($('#txtPick').val());
	var cntval = new Number($('#txtCount').val());

	if ($('#txtPick').val() < 1 || pickval > cntval) {
		alert('Please enter value between 1 to ' + $('#txtCount').val());
		return false;
	}
	var strQues = "d";
	for (var i = 0; i < $('#txtPick').val(); i++) {
		var rndNum = Math.floor((Math.random() * $('#txtCount').val()) + 1);
		if (strQues.indexOf(rndNum + ',') < 0) {
			strQues = strQues + rndNum + ',d';
		} else {
			i--;
		}
	}

	var i = 0;
	$('#detailsection').children('.questionDiv').each(function() {
		i++;
		if (strQues.indexOf('d' + i + ',') < 0) {
			$(this).remove();
		}
	});
}

/*
 * Method to assign marks to the questions
 */
function AssignMarksValidate() {
    if (getSelectedQuestionCount() > 0) {
		AssignMarks();
	} else {
		$("#overlay").fadeIn();
		$("#select_question_confirm").fadeIn();

		setTimeout(function() {
			$("#overlay").fadeOut();
			$("#select_question_confirm").fadeOut();
		}, 2000);
	}

}

/*
 * Method to assign marks to the questions
 */
function AssignMarks() {

    leftSectionDisable();

  

    // Initilizing time format dropdown & input box.
    var timeformat = (objSelectedQues.timeoftest).split(" ");
    $("#timedurationinput").val(timeformat[0]);

    $("#timeformat").val('-Select-');
    if (objSelectedQues.timeoftest.indexOf("minute") > -1)
        $("#timeformat").val('Minutes');
    else if (objSelectedQues.timeoftest.indexOf("hour") > -1)
        $("#timeformat").val('Hours');

    var totalMarks = 0;
    var marks = 0;
    $("#right_tool_tip").removeClass("select_classes_tip").addClass("assign_marks_tip");
    $("#timeformat").bind("keydown change", function () {
        setTimeout(function () {
            manageSaveButtonState();
        }, 3);

    });
    $("#marks_table_div").children().remove();

    $("#marks_table_div").append("<div class='marks_table_head'> <div class='Question_typeHead' >Question type</div> <div class='Question_select'>Selection</div> <div class='Question_marks'>Marks per question</div><div>Total Marks</div> </div>");
    $("#marks_table_div").append("<div id='question_marks_table' class='divQuestionMarks'></div>");
   

    $.each(objSelectedQues.types, function (key, value) {
        if (value.Sel_QU_COUNT > 0) {
            marks = parseFloat((value.Sel_QU_COUNT * value.Marks)).toFixed(2);
            $("#question_marks_table").append("<div class='marks_row_repeat marks_row_bordercolor'> <span class='Question_type' title = '" + (value.ty_nm) + "' >" + (value.ty_nm) + "</span><span id='Qcount" + value.ty_id + "' class='Question_count'>" + (value.Sel_QU_COUNT) + " </span> <span class='Question_multiply'> X </span> <span class='Question_select_no'><input type='text' maxlength='5' onkeyup='validateMarksTextBox(event)' onchange='validateMarksTextBoxonchange(event)' onclick='validateMarksTextBoxonclick(event)' class='qustn_input positive' id= Question" + value.ty_id + " value=" + value.Marks + " ></span><span class='Question_equal'> = </span><div class='Question_select_marks' id= Question_marks" + value.ty_id + ">" + marks + "   </div> </div>");
            totalMarks = (parseFloat(totalMarks) + parseFloat(marks)).toFixed(2);
        }
    });

    $("#TotalMarks_calculated").text(totalMarks);

    bindProperties();

}

/*
* Method to update Wizard progress on UI.
*/
function wizardProgress(position) {

    if (position < 1)
        return;

    $('#wiz_progress').find('ul li').find('div').each(function () {
        $(this).removeClass("wiz_selected");
        $(this).removeClass("wiz_checked");
        $(this).removeClass($(this).attr("id"));
        $(this).addClass("wiz_default");
        $(this).addClass($(this).attr("id") + "_default");
    });

    var i = 1;
    $('#wiz_progress').find('ul li').find('div').each(function () {

        $(this).removeClass("wiz_default");
        $(this).removeClass($(this).attr("id") + "_default");
       
        if (i < position) {
            $(this).addClass("wiz_default");
            $(this).addClass("wiz_checked");
        }
        else {
            $(this).addClass("wiz_selected");
            $(this).addClass($(this).attr("id"));
            return false;
        }
        i++;
    });
}


/*
 / Method to disable left side pannel
 */
function leftSectionDisable() {
    wizardProgress(2);

    $(".rightSection").css("width", "100%");

    $("#btnBook").removeClass("filter_button_active");

	var selected_chapters = [];

	$(".leftSection").hide();

	$('#btnMarks').hide();
	$('#btnSubmit').hide();
	$('#btnAutoSelect').hide();
	$('#resetselected').hide();

	$('#resetmarks').show();
	$('#skipButton').show();
	$('#savemarks').show();
	$('#btnBack').removeClass('btnBack_button_inactive').addClass('btnBack_button');
	$(".select_qus_outer").css("visibility", "hidden");

	$("#marks_detail").css("display", "block");
	$("#detailsection").css("display", "none");

	//$("#leftsidedisable_div").show(); 
}

/*
 / Method to enable left side pannel
 */
function leftSectionEnabled() {
    wizardProgress(1);
   
    $(".leftSection").show();
    $(".rightSection").css("width", "742px");
    $('#btnBack').removeClass('btnBack_button').addClass('btnBack_button_inactive');

	$(".dowload_done").hide();
	var selected_chapters = [];
	$('#detailsection').show();
	$('#divCmd').show();
	$('#btnMarks').show();
	$('#resetselected').show();

	$('#marks_detail').hide();
	$('#Test_Detail_Section').hide();
	$('#Preview_Section').hide();
	$("#cmdCopyType").hide();
	$('#Preview_buttons').hide();
	$("#Download_section").hide();
	$("#Download_buttons").hide();

	$('#resetmarks').hide();
	$('#skipButton').hide();
	$('#savemarks').hide();

	/*if (objSelectedQues.quesmode == ConstQuesModeEntireBook) {
		$("#select_book_radio").removeClass("view_radio_selected").addClass("view_radio_active");
		$.each(objSelectedQues.types, function(key, value) {

			$("#lst_" + value.ty_id).removeClass("listitem_select_used").addClass("listitem_select");

		});
	} else {

		$.each(objSelectedQues.questions, function(index, ques) {
			if (selected_chapters.indexOf(ques.qu_ch_id) == -1)
				selected_chapters.push(ques.qu_ch_id);
		});

		$("#select_chapter_radio").removeClass("view_radio_selected").addClass("view_radio_active");

		$('#listContainer').children('.listitem').each(function() {
			var id_selected = (('#' + $(this).attr('id')));
			id_selected = replaceAll('#lst_', '', id_selected);

			if (selected_chapters.indexOf(id_selected) > -1)

				$('#lst_' + id_selected).removeClass("listitem_select_used").addClass("listitem_select");

		});
	}*/

	if (objSelectedQues.selmode == ConstSelModeManual) {
		$('#btnSubmit').show();
		$('#btnAutoSelect').hide();
		//selectManualModeQuestions();

	} else {

		$('#btnAutoSelect').show();
		$('#btnSubmit').hide();
		$("#select_random_radio").removeClass("view_radio_selected").addClass("view_radio_active");
	}

	//$("#leftsidedisable_div").hide();
}

/*

Method to dismiss overlay on clicking the YES button and create new paper

*/

// (6/5/14)code changed
function StartNewXam() {
	Overlaydismiss();
	objSelectedQues.selmode = ConstSelModeManual;

	if (objSelectedQues.quesmode == ConstQuesModeEntireBook) {
		reset();
		objSelectedQues.quesmode = ConstQuesModeChapter;
		displayLeftList(ConstQuesModeChapter);
	} else {
		reset();
		objSelectedQues.quesmode = ConstQuesModeEntireBook;
		displayLeftList(ConstQuesModeEntireBook);

	}

}

/*

 Method to dismiss overlay on clicking the NO button and continue previous paper

 */

function Overlaydismiss() {
	$("#overlay").fadeOut();
	$("#confirm_selection").fadeOut();
	$("#download_section").fadeOut();
	$("#final_section").fadeOut();
	$("#confirm_section_text").text("Changing the view will clear all selection, do you want to continue?");
}

function OverlaydisplayHideAll() {	
	$("#chapter_book_buttons").hide();
	$("#manual_button").hide();
	$("#random_button").hide();
	$("#btnConfirmSwitch").hide();
}


/*
 Method to display overlay when click is on book/chapter
 */

function Overlaydisplay() {
	$("#overlay").fadeIn();
	$("#confirm_selection").fadeIn();
	OverlaydisplayHideAll();
	$("#chapter_book_buttons").show();	
}

/*
 Method to display overlay when click is on book/chapter
 */
function OverlaydisplaySwitchFilter() {
	$("#overlay").fadeIn();
	$("#confirm_selection").fadeIn();
	OverlaydisplayHideAll();
	$("#confirm_section_text").text("Your changes has not been saved, do you want to continue?");
	$("#btnConfirmSwitch").show();
}

/*

 Method to display overlay when click is on random mode

 */

function OverlaydisplayRandom() {
	$("#overlay").fadeIn();
	$("#confirm_selection").fadeIn();
	OverlaydisplayHideAll();
	$("#random_button").show();
}

/*

 Method to display overlay when click is on manual mode

 */

function OverlaydisplayManual() {
	$("#overlay").fadeIn();
	$("#confirm_selection").fadeIn();
	OverlaydisplayHideAll();
	$("#manual_button").show();
}


/*

Method to display overlay when click is on random mode

*/

function OverlaydisplayDownload() {
    $("#overlay").fadeIn();
    $("#download_section").fadeIn();
}

function OverlaydisplayFinal() {
    $("#overlay").fadeIn();
    $("#final_section").fadeIn();
}


/*
 Method to resize Preview Section at original size
 */

function original_size_preview() {

	$("#Preview_Section").css("width", "718px");
	$(".table_question_text").css("margin-left", "-3px");
	$("#Preview_Section").css("margin-left", "8px");
	$("#underline_div").css("width", "710px");
	$("#question_instruction").css("width", "710px");
	$("#content_include").css("width", "701px");
	$("#headerTableDiv").css("width", "100%");
	$(".text_update_for_check").css("width", "554px");
	$(".text_div_pre").css("width", "688px");

	$(".text_update_for_check_outer").css("width", "694px");
}

/*
 Method to resize Preview Section upto 1024px
 */

function resize_preview() {
	$("#Preview_Section").css("width", "1024px");
	$(".table_question_text").css("margin-left", "-6px");
	$("#Preview_Section").css("margin", "0px");
	$("#underline_div").css("width", "1020px");
	$("#question_instruction").css("width", "1024px");
	$("#content_include").css("width", "1024px");

	$("#headerTableDiv").css("width", "1024px");
	$(".text_update_for_check").css("width", "884px");
	$(".text_div_pre").css("width", "1024px");
	
	$(".text_update_for_check_outer").css("width", "1024px");
}

/*
 Method to handle Edit Question paper event
 */
function editQuestionPaper() {
    $("#Detail_buttons").css("display", "none");
	$('.edit_question_paper').css("cursor", "pointer");
	original_size_preview();

	$("#right_tool_tip").removeClass("preview_tip test_details_tip assign_marks_tip download_tip").addClass("select_classes_tip");

	if (objSelectedQues.questions != null && objSelectedQues.questions.length > 0) {

		leftSectionEnabled();

		$("#detailsection").children().remove();

		save_button_disable();
		displayLeftList(objSelectedQues.quesmode);

		if (objSelectedQues.selmode == ConstSelModeManual)
			ManualMode();
		else
			RandomMode();

		heightlightSelection();

		if (objSelectedQues.selmode == ConstSelModeManual) {

			var hDiv = $('#listContainer').children('.listitem_select')[0];

			var id = hDiv.id;
			id = replaceAll('lst_', '', id);
			var queryResult;
			objSelectedQues.ch_id = id;

			if (objSelectedQues.quesmode == ConstQuesModeChapter) {
				queryResult = getQuestionsByChapterId(id);
			} else {
				queryResult = getQuestionsByTypeId(id);
			}
			displayQuestionData(queryResult);
		} else {
			displayRandomModeQuestions();
			check_all_chapters();
		}

		displaySelectedQuestionCount();
		EnableNextSave();
		$('#savemarks').removeAttr('disabled');
		$('#savemarks').removeClass('save_marks_button_inactive').addClass('save_marks_button_active');
	}

}

/*
 / Method to validate time entered
 */

function submitAssignMarksValdiate() {

	var timeformat = $('#timeformat').find(":selected").text();

	var timeflag = 0;
	var buttonState = "Enable";

	switch (timeformat) {
	    case 'Hours':
	        if (($('#timedurationinput').val()) == '' || ($('#timedurationinput').val()) == 0 || ($('#timedurationinput').val()) > objSelectedQues.maximumtimeduration) {
	            $("#overlay").fadeIn();
	            $("#select_time_confirm").fadeIn();
	            $("#select_time_confirm_text").text("Please enter time less than or equal to " + objSelectedQues.maximumtimeduration + " hours.");

	            setTimeout(function () {
	                $("#overlay").fadeOut();
	                $("#select_time_confirm").fadeOut();
	            }, 2000);
	            $('#timedurationinput').val("");
	            objSelectedQues.timeoftest = "";

	        } else {
	            objSelectedQues.timeoftest = $('#timedurationinput').val() + " hour";
	            if ($('#timedurationinput').val() > 1)
	                objSelectedQues.timeoftest = $('#timedurationinput').val() + " hours";
	            submitAssignMarks();
	        }
	        break;
	    case 'Minutes':
	        if (($('#timedurationinput').val()) == '' || ($('#timedurationinput').val()) == 0 || ($('#timedurationinput').val()) > ((objSelectedQues.maximumtimeduration) * 60)) {
	            $("#overlay").fadeIn();
	            $("#select_time_confirm").fadeIn();
	            $("#select_time_confirm_text").text("Please enter time less than or equal to " + ((objSelectedQues.maximumtimeduration) * 60) + " minutes.");

	            setTimeout(function () {
	                $("#overlay").fadeOut();
	                $("#select_time_confirm").fadeOut();
	            }, 2000);

	            $('#timedurationinput').val("");
	            objSelectedQues.timeoftest = "";

	        } else {
	            objSelectedQues.timeoftest = $('#timedurationinput').val() + " minute";
	            if ($('#timedurationinput').val() > 1)
	                objSelectedQues.timeoftest = $('#timedurationinput').val() + " minutes";
	            submitAssignMarks();
	        }
	        break;
	    default:

	        $("#overlay").fadeIn();
	        $("#select_time_confirm").fadeIn();
	        $("#select_time_confirm_text").text("Please enter time less than or equal to " + (objSelectedQues.maximumtimeduration) + " hours/" + ((objSelectedQues.maximumtimeduration) * 60) + " minutes.");

	        setTimeout(function () {
	            $("#overlay").fadeOut();
	            $("#select_time_confirm").fadeOut();
	        }, 2000);

	        $("#overlay").fadeIn();
	        $("#select_time_confirm").fadeIn();
	        $("#select_time_confirm_text").text("Please enter time less than or equal to " + (objSelectedQues.maximumtimeduration) + " hours/" + ((objSelectedQues.maximumtimeduration) * 60) + " minutes.");

	        setTimeout(function () {
	            $("#overlay").fadeOut();
	            $("#select_time_confirm").fadeOut();
	        }, 2000);

	        $('#timedurationinput').val("");
	        objSelectedQues.timeoftest = "";
	}
}

/*
 / Method to save marks for each question
 */
function submitAssignMarks() {

	$.each(objSelectedQues.types, function(index, ques) {
		ques.Marks = $('#Question' + ques.ty_id).val();
	});
	AssignMarksComplete();
}

/*
 / Method to show Test Detail Section after marks are saved for each question
 */

function AssignMarksComplete() {
    wizardProgress(3);
	$('#detailsection').hide();
	$('#divCmd').hide();

	$('#marks_detail').hide();
	$("#right_tool_tip").removeClass("assign_marks_tip").addClass("test_details_tip");
	$('#Test_Detail_Section').show();

	$('#reset_test_details').attr('disabled', 'disabled');
	$("#reset_test_details").removeClass("reset_button").addClass("reset_button_inactive");
	$('#school_details_save').attr('disabled', 'disabled');
	$("#school_details_save").removeClass("save_button_active").addClass("save_button_inactive");

	if (objSelectedQues.testName === "") {
		$('#PreviewSectionStart').attr('disabled', 'disabled');
		$("#PreviewSectionStart").removeClass("next_button_active").addClass("next_button_inactive");
	} else {
		$('#PreviewSectionStart').removeAttr('disabled');
		$("#PreviewSectionStart").removeClass("next_button_inactive").addClass("next_button_active");
	}

	//$("#uplodedLogoDiv").css("background", "url(./images/Upload Logo_combined.png)");

	$("#school_name").val([]);
	$("#assignment_name").val([]);
	$("#instruction_name").val([]);
	$("#imgLogo").attr("src", "content/css/images/Upload Logo_combined.png");

	if (objSelectedQues.schoolLogo != '')
		$("#imgLogo").attr("src", "content/graphics/" + objSelectedQues.schoolLogo);

	if (objSelectedQues.schoolName != '')
		$('#school_name').val(objSelectedQues.schoolName);
	if (objSelectedQues.testName != '')
		$('#assignment_name').val(objSelectedQues.testName);
	if (objSelectedQues.instructions != '')
		$('#instruction_name').val(replaceAll('</br>', '\n', objSelectedQues.instructions));

	$('#school_name').val();
	$('#school_name').bind('input', function() {
		check_test_detail_buttons();
	});

	$('#assignment_name').bind('input', function() {
		check_test_detail_buttons();
	});

	$('#instruction_name').bind('input', function() {
		check_test_detail_buttons();
    });

    check_test_detail_buttons();
	displayLogo();
}

/*
 / Method to check the input for test detail section.
 */
function check_test_detail_buttons() {
    $("#Detail_buttons").show();
	if ($('#assignment_name').val().trim() === "") {

		$('#reset_test_details').attr('disabled', 'disabled');
		$("#reset_test_details").removeClass("reset_button").addClass("reset_button_inactive");
		$('#school_details_save').attr('disabled', 'disabled');
		$("#school_details_save").removeClass("save_button_active").addClass("save_button_inactive");
		$('#PreviewSectionStart').attr('disabled', 'disabled');
		$("#PreviewSectionStart").removeClass("next_button_active").addClass("next_button_inactive");

	} else {
		$('#reset_test_details').removeAttr('disabled');
		$("#reset_test_details").removeClass("reset_button_inactive").addClass("reset_button");
		$('#school_details_save').removeAttr('disabled');
		$("#school_details_save").removeClass("save_button_inactive").addClass("save_button_active");

	}

}

/*
 / Method to handle on click event of school_details_save.
 */
function SchoolDetailSave() {
	objSelectedQues.schoolName = $('#school_name').val().trim();
	objSelectedQues.testName = $('#assignment_name').val().trim();
	objSelectedQues.instructions = $('#instruction_name').val();
	objSelectedQues.instructions = replaceAll('\n', '</br>', objSelectedQues.instructions);

	$(".select_qus_outer").css("visibility", "visible");
	$("#QuestionSelected").text("Test Details saved.");
	$('#PreviewSectionStart').removeAttr('disabled');
	$('#PreviewSectionStart').removeClass('next_button_inactive').addClass('next_button_active');
}

/*
 / Method to show preview of Question Paper.
 */
function PreviewSectionStart() {
    wizardProgress(4);
    displaySelectedQuestionCount();
    $("#Detail_buttons").hide();
	$(".select_qus_outer").css("visibility", "hidden");
	$('#Test_Detail_Section').hide();
	$("#right_tool_tip").removeClass("test_details_tip").addClass("preview_tip");
	$('#select_qus_outer').css("visibility", "hidden");
	var i = "";
	if (objSelectedQues.instructions != null && objSelectedQues.instructions != "") {
		i = i.concat("<div style='font-size:18px;font-weight:bold;margin: 16px 0 8px 0;'>General Instructions:</div><div style='margin:0;font-size: 16px;'>" + objSelectedQues.instructions + "</div>");
		$('#question_instruction').html(i);
	} else {
		$('#question_instruction').html("");
	}
    $('#Preview_Section').show();
    $("#cmdCopyType").show();
	$('#Preview_buttons').show();
    
	$("#prewStudentCopy").addClass("filter_button_active");
	$("#prewTeacherCopy").removeClass("filter_button_active");
	testPreview();
}

/*
 / Method to validate marks for each selected question.
 */

function validateMarksTextBox(evt) {

	var marks = 0;

	var tMarkId = $(evt.target).attr('id');

	tMarkId = tMarkId.replace('Question', 'Question_marks');

	var cntMarkId = $(evt.target).attr('id');

	cntMarkId = '#' + cntMarkId.replace('Question', 'Qcount');

	marks = $(evt.target).val();

	$('#' + tMarkId).text(($(cntMarkId).text() * marks).toFixed(2));

	calculateTotal();
	manageSaveButtonState();
}

function validateMarksTextBoxonchange(evt) {

	var marks = 0;

	var tMarkId = $(evt.target).attr('id');

	tMarkId = tMarkId.replace('Question', 'Question_marks');

	var cntMarkId = $(evt.target).attr('id');

	cntMarkId = '#' + cntMarkId.replace('Question', 'Qcount');

	marks = $(evt.target).val();

	$('#' + tMarkId).text(($(cntMarkId).text() * marks).toFixed(2));

	calculateTotal();
	manageSaveButtonState();
}

function validateMarksTextBoxonclick(evt) {

	var marks = 0;

	var tMarkId = $(evt.target).attr('id');

	tMarkId = tMarkId.replace('Question', 'Question_marks');

	var cntMarkId = $(evt.target).attr('id');

	cntMarkId = '#' + cntMarkId.replace('Question', 'Qcount');

	marks = $(evt.target).val();

	$('#' + tMarkId).text(($(cntMarkId).text() * marks).toFixed(2));

	calculateTotal();
	manageSaveButtonState();
}

/*
 * Method to calculate total marks of all questions.
 */
function calculateTotal() {
	var totalMarks = 0;

	$.each(objSelectedQues.types, function(index, ques) {

		var marks = 0;

		if ($('#Question_marks' + ques.ty_id).text() != "") {

			marks = parseFloat($('#Question_marks' + ques.ty_id).text()).toFixed(2);

			totalMarks = (parseFloat(totalMarks) + parseFloat(marks)).toFixed(2);
		}
	});

	$('#TotalMarks_calculated').text(totalMarks);
}

/*
 * Method to save marks for each question when all questions' marks are provided.
 */

function manageSaveButtonState() {

	var buttonState = "Enable";

	$.each(objSelectedQues.types, function(index, ques) {
		if (ques.Sel_QU_COUNT > 0) {
			if ($('#Question_marks' + ques.ty_id).text() == "" || $('#Question_marks' + ques.ty_id).text() == 0) {
				buttonState = "disabled";
			}
		}
	});

	if (buttonState == "Enable") {
		EnableResetMarks();
		$('#savemarks').removeAttr('disabled');
		$('#savemarks').removeClass('save_marks_button_inactive').addClass('save_marks_button_active');

	} else {
		//DisableResetMarks()
		$('#savemarks').attr('disabled', 'disabled');
		$('#savemarks').removeClass('save_marks_button_active').addClass('save_marks_button_inactive');

	}
}

function school_details() {

	var schoolLogo = "false";
	var schoolName = "false";
	var testName = "false";

	if (objSelectedQues.schoolLogo == "" || objSelectedQues.schoolLogo == null) {
		schoolLogo = "false";
	} else {
		schoolLogo = "true";
	}
	if (objSelectedQues.schoolName == "" || objSelectedQues.schoolName == null) {
		schoolName = "false";
	} else {
		schoolName = "true";
	}
	if (objSelectedQues.testName == "" || objSelectedQues.testName == null) {
		testName = "false";
	} else {
		testName = "true";
	}

	if (schoolLogo == "false" && schoolName == "false" && testName == "false") {
		$("#school_details").hide();
	} else {
		$("#school_details").show();
	}

	if (schoolName == "false") {
		$("#school_name_preview").css("visibility", "hidden");
	} else {
		$("#school_name_preview").css("visibility", "visible");
	}

	if (testName == "false") {
		$("#test_name_preview").css("visibility", "hidden");

	} else {
		$("#test_name_preview").css("visibility", "visible");
	}
}

function indentQuestionText(questionText) {
	var i = 0;
	var res = questionText.split('</br>');
	var innerDiv = '<div style="margin-left:16px;">';
	var outerData = "";
	var innerData = "";

	if (res.length > 1) {
		for ( i = 0; i < res.length; i++) {
			if (i < 1)
				outerData = res[i];
			// + '<br/>';
			else {
				if (res[i] != "") {
					innerData += res[i];

					if (res[i].indexOf('table') < 0)
						innerData += '<br/>';
				}
			}
		}
	} else {
		return questionText;
	}

	if (innerData != "") {
		outerData += innerDiv + innerData + '</div>';
	}
	return outerData;
}

function testPreview() {

	var selected_qustn;
	var TotalMarks = 0;
	var assignment_display = "true";
	var randomizeArray = [];

	school_details();

	//$("#classNumber").text(classNumber);

	getQuestionsArray = [];
	$("#content_include").children().remove();

	$("#teacher_copy_text").hide();
	$("#teacher_copy_text_given").text("");
	$("#assignment_text").hide();

	$.each(objSelectedQues.types, function(index, objType) {

		if (objType.Sel_QU_COUNT > 0) {

			if (objType.Marks > 0) {
				assignment_display = "false";

				var total_marks_cal = (objType.Marks * objType.Sel_QU_COUNT).toFixed(2).split(".");
				var total_marks_display = "";
				if (total_marks_cal[1] == "00") {
					total_marks_display = total_marks_cal[0];
				} else {
					total_marks_display = total_marks_cal[0].concat("." + total_marks_cal[1]);
				}

				getQuestionsArray.push('<div class="text_update_for_check_outer" style="width:694px;"><table class="table_question_text" style="border: 0px solid #ffffff; margin-top:20px;margin-left:-3px;"><tr style="border: 0px solid #ffffff;font-size: 18px;"><td class="text_update_for_check" style="border: 0px solid #ffffff;width:554px;padding: 0;font-weight:bold;"> &nbsp;' + objType.ty_nm + '</td><td class="marks_update_for_check" style="border: 0px solid #ffffff;width:140px;vertical-align: bottom;text-align:right;"><span style="font-weight:normal; float:right;" id="mark_per_ques' + objType.ty_id + '">' + objType.Sel_QU_COUNT + '<span style="margin:0 2px;"> X </span>' + objType.Marks + '<span style="margin:0 4px;">=</span>' + total_marks_display + ' </span> </td></tr></table></div>');
			} else {
				assignment_display = "true";
				getQuestionsArray.push('<div class="text_update_for_check_outer" style="width:694px;"><table class="table_question_text" style="border: 0px solid #ffffff; margin-top:20px;margin-left:-3px;"><tr style="border: 0px solid #ffffff;font-size: 18px;"><td style="border: 0px solid #ffffff;width:710px;font-weight:bold;"> ' + objType.ty_nm + '</td></tr></table></div>');
			}
			TotalMarks = (parseFloat(TotalMarks) + parseFloat((objType.Marks * objType.Sel_QU_COUNT))).toFixed(2);

			var selected_question_id = getSelectedQuestionsByTypeId(objType.ty_id);
			var i = 0;

			$.each(selected_question_id, function(index, ques) {
				selected_qustn = getQuestionsById(ques.qu_id);
				randomizeArray.push(ques.qu_id);
				i++;
				var indedntedQuesText = indentQuestionText(selected_qustn[0].qu_text);
				if (objSelectedQues.selmode == ConstSelModeManual) {
				    getQuestionsArray.push('<div style="float: left; vertical-align: middle; font-size:16px; height: auto; padding: 10px 0 0 0px;" class="text_div_pre">' + i + ') ' + indedntedQuesText + ' </div> <div style="color: #0000FF; float: left; text-decoration: underline; padding: 10px 0 0 0px;	font-size:16px; display: none; " class="correct_answer text_div_pre" >' + selected_qustn[0].qu_ans + ' </div>');
				}
			});

			for (var j, x, i = randomizeArray.length; i; j = Math.floor(Math.random() * i), x = randomizeArray[--i], randomizeArray[i] = randomizeArray[j], randomizeArray[j] = x);

			if (objSelectedQues.selmode == ConstSelModeRandom) {
				for ( i = 0; i < objType.Sel_QU_COUNT; i++) {
					var indedntedQuesText = indentQuestionText(getQuestionsById(randomizeArray[i])[0].qu_text);
					getQuestionsArray.push('<div style="float: left; vertical-align: middle; font-size:16px; height: auto; padding: 10px 0 0 0px;" class="text_div_pre" >' + (i + 1) + ') ' + indedntedQuesText + ' </div> <div style="color: #0000FF; float: left; text-decoration: underline; padding: 10px 0 0 0px; font-size:16px; 	display: none; " class="correct_answer text_div_pre">' + getQuestionsById(randomizeArray[i])[0].qu_ans + ' </div>');
				}
				randomizeArray = [];
			}
		}
	});

	$("#Preview_Section").append("<div style='float: left; font-size: 16px; margin: 0 0 32px 0; width:701px;'  id='content_include' ></div>");

	if (TotalMarks == 0 || TotalMarks == null) {
		$("#max_marks_container_col").css("visibility", "hidden");
		$("#max_marks_container").css("visibility", "hidden");
	} else {
		$("#max_marks_container_col").css("visibility", "visible");
		$("#max_marks_container").css("visibility", "visible");

		var total_marks_check = TotalMarks.split(".");
		var total_marks_display_up = "";
		if (total_marks_check[1] == "00") {

			total_marks_display_up = total_marks_check[0];
		} else {
			total_marks_display_up = total_marks_check[0].concat("." + total_marks_check[1]);
		}

		$('#max_marks_container').text("Marks: " + total_marks_display_up);

	}

	// Removing the logo image.
	$(".school_logo").remove();

	// Adding the logo image.
	if (objSelectedQues.schoolLogo != null && objSelectedQues.schoolLogo != "") {
		$("#school_logo_col").append('<p><img width="60" height="60" style="float: left;margin:0;" class="school_logo" src="content/graphics/' + objSelectedQues.schoolLogo + '"></p>');
		$(".no_image_set").css("width", "578px");
		$(".no_image_set_td").css("width", "60px");
	}

	if (objSelectedQues.timeoftest == 0 || objSelectedQues.timeoftest == null) {
		$("#max_time_container_col").css("visibility", "hidden");
		$("#max_time_container").css("visibility", "hidden");
	} else {
		$("#max_time_container_col").css("visibility", "visible");
		$("#max_time_container").css("visibility", "visible");
		$('#max_time_container').text("Duration: " + objSelectedQues.timeoftest);
	}

	$('#school_name_preview').text(objSelectedQues.schoolName);
	$('#test_name_preview').text(objSelectedQues.testName);

	for ( i = 0; i < getQuestionsArray.length; i++) {
		$("#content_include").append("<div style='float: left; margin-top: 10px; width:100%;' >" + getQuestionsArray[i] + "   </div>");
	}

	if (assignment_display == "true") {
		$("#assignment_text").show();
		$("#max_marks_container_col").hide();
		$("#max_marks_container").hide();
		$("#max_time_container_col").hide();
		$("#max_time_container").hide();
		$(".text_update_for_check").css("width", "694px");
		$(".marks_update_for_check").hide();
	} else {
		$(".text_update_for_check").css("width", "554px");
		$(".marks_update_for_check").show();
		$("#max_marks_container_col").show();
		$("#max_marks_container").show();
		$("#max_time_container_col").show();
		$("#max_time_container").show();
	}
}

//clicking the student's copy button should hide the correct answers for each question
function studentcopy() {
    $("#prewTeacherCopy").removeClass("filter_button_active");
    $("#prewStudentCopy").addClass("filter_button_active");
	$(".correct_answer").hide();
	$("#teacher_copy_text").hide();
	$("#teacher_copy_text_given").text("");
}

//clicking the teacher's copy button should show the correct answers for each question
function teachercopy() {
    $("#prewStudentCopy").removeClass("filter_button_active");
    $("#prewTeacherCopy").addClass("filter_button_active");
	$("#teacher_copy_text").show();
	$("#teacher_copy_text_given").text("Teacher's Copy");
	$(".correct_answer").show();
}

//  Method to validate the save action by user
function downloadsectionstart_validate() {
	if (objRecentTestList.tests.length > 4) {
		var i = 0;
		var nameFound = false;
		for ( i = 0; i < objRecentTestList.tests.length; i++) {
			if (objRecentTestList.tests[i].test_nm == objSelectedQues.testName)
				nameFound = true;
		}
		if (nameFound == false) {
			downloadsection_popup();
		} else {
			saveCurretTest();
			downloadsectionstart();
		}

	} else {
		saveCurretTest();
		downloadsectionstart();
	}
}

//  Method to start popup for saving the 6th test.

function downloadsection_popup() {
	$("#overlay").fadeIn();
	$("#HelpClickDiv").fadeIn();
}

//  Method to fadeout popup and not save the 6th test.

function downloadsection_popup_fadeout() {
	$("#overlay").fadeOut();
	$("#HelpClickDiv").fadeOut();
	downloadsectionstart();
}

//  Method to fadeout popup and save the 6th test.
function downloadsection_popup_savetest() {
	$("#overlay").fadeOut();
	$("#HelpClickDiv").fadeOut();
	saveCurretTest();
	downloadsectionstart();
}

//  Method to start download section for test paper created.
function downloadsectionstart() {
	studentcopy();
	objSelectedQues.documentFormat = ConstDocFormat;
	objSelectedQues.copyType = ConstStudentCopy;
	$("#selectStudentRadio").addClass("view_radio_active").removeClass("view_radio_inactive");
	$("#selectTeacherRadio").addClass("view_radio_inactive").removeClass("view_radio_active");
	$("#selectBothRadio").addClass("view_radio_inactive").removeClass("view_radio_active");
	$("#selectDocRadio").addClass("view_radio_active").removeClass("view_radio_inactive");
	$("#selectPdfRadio").addClass("view_radio_inactive").removeClass("view_radio_active");

	resize_preview();
	$("#right_tool_tip").removeClass("preview_tip").addClass("download_tip");
	$("#Preview_Section").hide();
	$("#cmdCopyType").hide();
	$("#Preview_buttons").hide();
	$("#Download_section").show();
	$("#Download_buttons").show();
	if (objSelectedQues.testName == "") {
		$("#test_name_display").text("Assignment");
	} else {
		$("#test_name_display").text(objSelectedQues.testName);
	}

}

// Methods to comunicate with XUL to save and retrive files

/*
 / Method to export selected questions to xul, by creating a custom event
 / Doc create a custom event - which is already attached with the xul browser control.
 / Data send with exportData object.
 */
function uploadLogo() {
	document.addEventListener('uploadSuccess', uploadSuccessHandler, false);
	
	try {
		var n = new Event("CustomEvent",{ 'view': window, 'bubbles': true, 'cancelable': true });
		document.body.dispatchEvent(n);
		
		
		/*var evNew = document.createEvent("CustomEvent");
		evNew.initEvent("uploadSchoolLogo", true, true,  {
		});
		document.dispatchEvent(evNew);*/
	} catch (ex) {
		alert("Upload logo Failed.");
	}
}

/*
 / Method to handle success full upload of log.
 */
function uploadSuccessHandler(ev) {
    var fileName = ev.detail;
    if (fileName.indexOf('xulerror') > -1) {
        displayAlertTimeOut("Please select a (jpg or jpeg) image.");
    }
    else {
        //alert(fileName);
        objSelectedQues.schoolLogo = fileName;
        displayLogo();
        check_test_detail_buttons();
    }
    document.addEventListener('uploadSuccess', uploadSuccessHandler, true);
}

function displayLogo() {
	if (objSelectedQues.schoolLogo == null || objSelectedQues.schoolLogo == "")
		$("#imgLogo").attr("src", "content/css/images/Upload Logo_combined.png");
	else
		$("#imgLogo").attr("src", "content/graphics/" + objSelectedQues.schoolLogo);
}

function exitapp() {
//    alert("dfdfd");
    try {
        var ev = document.createEvent("CustomEvent");
        ev.initCustomEvent("closeApplicaiton", true, true, {
        });
        document.dispatchEvent(ev);
    } catch (ex) {
        alert("Close application failed.");
    }

}

function downloadPaper() {
    resize_preview();

    var images = $('#Preview_Section  img').map(function () {
        return $(this).attr('src')
    }).get()

    if (images.length > 0)
        $("#txtImages").val(images.join("|"));
    else
        $("#txtImages").val("");

    teachercopy();

    if (objSelectedQues.TotalMarks > 0) {
        $("#test_saved_name").text("Question paper");
    } else {
        $("#test_saved_name").text("The Assignment");
    }

    if (objSelectedQues.documentFormat == ConstDocFormat) {
        exportDataToSave(objSelectedQues.testName + ".doc");
    } else {
        exportDataToSave(objSelectedQues.testName + ".pdf");
    }
    Overlaydismiss();
    OverlaydisplayFinal();
    original_size_preview();
}

function exportDataToSave(fileName)
{ 
	var exportTchData = "";
	var exportStuData = "";
    var eventName  = "exportToPDF";
    var imageData = "";


    $("#tempPreview").html("");
	$("#tempPreview").html(document.getElementById("Preview_Section").innerHTML);

	if ($("#assignment_text").css("display") == "none")
	    $("#tempPreview #assigment_text_row").remove();
        
    exportTchData = document.getElementById("tempPreview").innerHTML;

    $("#tempPreview .correct_answer").remove();
    $("#tempPreview #teacher_copy_row").remove();
    studentcopy();

    exportStuData = document.getElementById("tempPreview").innerHTML;

	$("#tempPreview").children().remove();
	var imageData = document.getElementById("txtImages").value;

    if (objSelectedQues.documentFormat == ConstDocFormat) 
        eventName  = "exportToDOC";
alert("sefzsssdv");
    callCustomEvent1(eventName, fileName, exportStuData, exportTchData, imageData, objSelectedQues.copyType)

}

function callCustomEvent(eventName, fileName, exportData, exportTchData, imageData, copyType)
{
    try {
        var ev = document.createCustomEvent("CustomEvent");
		ev.initCustomEvent(eventName, true, true, {
			'fileName' : fileName,
			'exportData': exportData,
			'exportTchData': exportTchData,
            'imageData' : imageData,
            'copyType': copyType
		});
       	document.dispatchEvent(ev);
	} catch (ex) {
		alert("Export To PDF/Doc Failed.");
	}
}
//
function callCustomEvent1(eventName, fileName, exportData, exportTchData, imageData, copyType)
{
	alert("cc");
    try {
		
        var ev = new Event("CustomEvent");
		ev.initEvent(eventName,  {
			'fileName' : fileName,
			'exportData': exportData,
			'exportTchData': exportTchData,
            'imageData' : imageData,
            'copyType': copyType
		}, false);
       	document.dispatchEvent(ev);
	} catch (ex) {
		alert("Export To PDF/Doc Failed.");
	}
}


/*
 * Method to export/save test paper on system,
 * by calling external xul event "exportToDOC".
 */
function SavetoPdf(fileName) {
	try {
		$("#tempPreview").html("");
		$("#tempPreview").html(document.getElementById("Preview_Section").innerHTML);

		if (objSelectedQues.copyType != ConstTeacherCopy)
			$("#tempPreview .correct_answer").remove();

		var exportData = document.getElementById("tempPreview").innerHTML;
		$("#tempPreview").children().remove();

		var ev = document.createEvent("CustomEvent");
		ev.initCustomEvent("exportToPDF", true, true, {
			'fileName' : fileName,
			'exportData': exportData,
			'exportTchData': exportTchData,
			'copyType': objSelectedQues.copyType
		});
		document.dispatchEvent(ev);
	} catch (ex) {
		alert("Export To PDF Failed.");
	}
}

/*
 * Method to export/save test paper on system,
 * by calling external xul event "exportToDOC".
 */
function SavetoDoc(fileName) {
	try {
		$("#tempPreview").html("");
		$("#tempPreview").html(document.getElementById("Preview_Section").innerHTML);

		var exportTchData = "";
		var exportStuData = "";
        
        exportTchData = document.getElementById("tempPreview").innerHTML;

		//if (objSelectedQues.copyType == ConstStudentCopy)
			$("#tempPreview .correct_answer").remove();

        exportStuData = document.getElementById("tempPreview").innerHTML;

		$("#tempPreview").children().remove();

		var imageData = document.getElementById("txtImages").value;
		var ev = document.createEvent("CustomEvent");

		ev.initCustomEvent("exportToDOC", true, true, {
			'fileName' : fileName,
			'exportData': exportStuData,
            'exportTchData': exportTchData,
			'imageData' : imageData,
			'copyType': objSelectedQues.copyType
		});
		document.dispatchEvent(ev);
	} catch (ex) {
		alert("Export To DOC Failed.");
	}
}

/*
 Method to save json object to system as recent test,
 by calling external xul event "exportRecentTest".
 */
function saveCurretTest() {
	if (objSelectedQues.testName != null && objSelectedQues.testName != "") {
		try {
			var exportData = JSON.stringify(objSelectedQues);
			var ev = document.createEvent("CustomEvent");
			ev.initCustomEvent("exportRecentTest", true, true, {
				'exportData' : exportData,
				'fileName' : objSelectedQues.testName
			});
			document.dispatchEvent(ev);
		} catch (ex) {
			alert("Failed to Export Recent Test.");
		}
	}
}

/*
 / Method to load saved recent tests list.
 */
function loadConfigFile() {
	$.ajax({
	    url: 'content/css/config.json?nocache=' + new Date().getTime(),
		type : "GET",
		dataType : "json",
		success: function (data) {
			loadConfigData(data);
		},
		error : function() {
			console.log(' unable to load config data.');
		}
	});

}

/*
 Method to handle success callback of ajax call, and load json data in
 objConfig object.
 */
function loadConfigData(data) {
	objConfig = null;
	objConfig = data;
}

/* Method to validate selection of load recent test*/

function loadRecentTestvalidate(fileName) {

	var TestSelected = fileName.toString();
	if (((objSelectedQues.types).length) === 0) {
		loadRecentTest(TestSelected);

	} else {
		$('#recent_test_buttons').children().remove();
		$("#overlay").fadeIn();
		$("#loaded_test_view").fadeIn();

		$('#recent_test_buttons').append($('<input type="button" value="No" class="save_button_active" onclick="OverlaydismissloadRecentTest()">'));
		$('#recent_test_buttons').append($('<input type="button" value="Yes" class="save_button_active" onclick="loadRecentTest(\'' + TestSelected + '\')">'));
      
	}

}

/* Method to dismiss overlay used for loadRecentTestvalidate*/
function OverlaydismissloadRecentTest() {
	$("#overlay").fadeOut();
	$("#loaded_test_view").fadeOut();
}

/*
 Method to load recently saved test from file, using a ajax call.
 */
function loadRecentTest(fileName) {

    //$(".listContainerP").css("border-bottom", "1px solid");
    EnableResetSelect();
    $("#overlay").fadeOut();
    $("#loaded_test_view").fadeOut();
    $("#divCmd").removeClass("bottom_submit_buttons_start");
    //to change here(7/5/14)
    $.ajax({
        url: 'content/recenttests/' + fileName,
        type: "GET",
        dataType: "json",
        success: function (data) {
            loadTestData(data);
        },
        error: function () {
            console.log(' unable to load test.');
        }
    });
}

/*
 Method to handle success callback of ajax call, and load json data in
 objSelectedQues object.
 */
function loadTestData(data) {
	objSelectedQues = null;
	objSelectedQues = data;
	editQuestionPaper();
//	manageEditQuestionButton();
}

/*
 Method to handle Help Icon click event (open pdf in user window)
 */
function HelpClick() {
	window.open("content/TestGenerator_help.pdf");
}

/*
 Method to fade out Help Section.
 */
function HelpClickFade() {
	$("#overlay").fadeOut();
	$("#HelpClickDiv").fadeOut();

}


// Utility Methods
function serializeXmlNode(xmlNode) {
	if ( typeof window.XMLSerializer != "undefined") {
		return new window.XMLSerializer().serializeToString(xmlNode);
	} else if ( typeof xmlNode.xml != "undefined") {
		return xmlNode.xml;
	}
	return "";
}

function replaceAll(find, replace, str) {
	return str.replace(new RegExp(find, 'g'), replace);
}

function resetAll() {
    Overlaydismiss();
    deactivateFilterButtons();


	reset();
	original_size_preview();
	// Calling method to load list of recently saved test

	$("#marks_detail").css("display", "none");

	// div containing table for marks of each selected question hided
	$("#Test_Detail_Section").css("display", "none");

	// div containing information about school hided.

	$("#Preview_Section").css("display", "none");
	$("#cmdCopyType").hide();
	$("#Preview_buttons").css("display", "none");
	$("#Download_section").css("display", "none");
	$("#Download_buttons").css("display", "none");
	$("#Detail_buttons").css("display", "none");

	objSelectedQues.selmode = ConstSelModeManual;
	//displayLeftList(ConstQuesModeChapter);

	$("#left_acordion").removeClass("recent_text_right_second_state").addClass("recent_text_right");
	$(".recent_options_outer").hide();

	$('#detailsection').append("<div class='front_text'><div>Choose selection criteria to generate list of questions.</div></div>");
	$('#detailsection').show();

	leftSectionEnabled();
	$('.view_radio_inner').removeClass('view_radio_selected view_radio_active view_radio_inactive');
	$("#right_tool_tip").removeClass("preview_tip test_details_tip assign_marks_tip download_tip").addClass("select_classes_tip");
	DisableNextSave();
	DisableResetSelect();
	$('#savemarks').attr('disabled', 'disabled');
	$('#savemarks').removeClass('save_marks_button_active').addClass('save_marks_button_inactive');
	objSelectedQues.copyType = ConstStudentCopy;
	objSelectedQues.documentFormat = ConstDocFormat;

	$("#selectStudentRadio").removeClass("view_radio_inactive").addClass("view_radio_active");
	$("#selectTeacherRadio").removeClass("view_radio_active").addClass("view_radio_inactive");
	$("#selectBothRadio").removeClass("view_radio_active").addClass("view_radio_inactive");
	$("#selectDocRadio").removeClass("view_radio_inactive").addClass("view_radio_active");
	$("#selectPdfRadio").removeClass("view_radio_active").addClass("view_radio_inactive");
	$('#divCmd').addClass("bottom_submit_buttons_start");
	$("#btnManual").unbind("click");
	$("#btnRandom").unbind("click");

	//manageEditQuestionButton();

}

// method to select all the questions displayed on the right side panel
function select_all_maunal(ev) {
	isSelectionChanged = true;
	save_button_enable();
	if (ev.checked) {
		$('input:checkbox').prop('checked', true);
		EnableResetSelect();
	} else {
		$('input:checkbox').removeAttr('checked');
		DisableResetSelect();
	}
}

// method to check/uncheck select all checkbox on the right side panel

function select_question_checkbox() {

	var flag = true;

	$('#detailsection').find('.parentCheckBox').each(function() {

		if (this.checked == false)
			flag = false;
	});

	if (flag == true) {
		$('#select_all_new').prop('checked', true);
	} else {
		$('#select_all_new').removeAttr('checked');
	}

}

//  new method to enable/disable reset button and save button for random mode questions.

function check_reset_save() {

	var selectedChild = false;

	$('#detailsection').find('input:checkbox').each(function() {
		if (this.checked == true)
			selectedChild = true;
	});
	if (selectedChild == true) {
		save_button_enable();
		EnableResetSelect();
	} else {
		DisableResetSelect();
	}
}

//  method to select all the chapters in random mode

function SelectAllChapters(ev) {
	if (ev.checked) {
		$('#listContainer input:checkbox').prop('checked', true);
		SubmitAndView();
	} else {
		$('#listContainer input:checkbox').removeAttr('checked');
		$("#detailsection").children().remove();
		$(".listitem").removeClass("listitem_select");
	}
}

//  method to check select_all_chapters checkbox in random mode

function check_all_chapters() {

	var selectedChild = true;

	$('#listContainer .listitem').find('input:checkbox').each(function() {
		if (this.checked == false)
			selectedChild = false;
	});

	if (selectedChild == true) {
		$('#SelectAllChapters').prop('checked', true);
	} else {
		$('#SelectAllChapters').removeAttr('checked');
	}
}
