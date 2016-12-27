/*
/ DB Methods to retrieve data.
*/
function getQuestionsByChapterId(chapterId) {

    return Enumerable.From(objQuestions.records.record).Where(function (x) {
        return x.qu_ch_id === chapterId && x.qu_tag === 'BOOKQUESTION'
    }).OrderBy(function (x) {
        return x.qu_ca_id
    }).ToArray();
}

function getQuestionsByTypeId(typeId) {
    return Enumerable.From(objQuestions.records.record).Where(function (x) {
        return x.qu_ca_id === typeId && x.qu_tag === 'BOOKQUESTION'
    }).OrderBy(function (x) {
        return x.qu_ca_id
    }).ToArray();
}

function getQuestionsById(questionId) {
    return Enumerable.From(objQuestions.records.record).Where(function (x) {
        return x.qu_id === questionId
    }).ToArray();
}

function getSelectedQuestionsByTypeId(typeId) {
    return Enumerable.From(objSelectedQues.questions).Where(function (x) {
        return x.qu_ca_id === typeId 
    }).OrderBy(function (x) {
        return x.qu_ca_id
    }).ToArray();
}

function getSelectedQuestionsByChapterandTypeId(typeId, chapterId) {
    return Enumerable.From(objSelectedQues.questions).Where(function (x) {
        return x.qu_ca_id === typeId && x.qu_ch_id === chapterId
    }).ToArray();
}


function getClassNumber() {
    return Enumerable.From(objClass.records.record).ToArray();
}
