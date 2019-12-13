class CheckMultipleQuestionAnswer extends Stimulus.Controller {
    connect() {
        $('#noAnswerValidationAlert').hide();
        $('#a').click(() => {
            $('#b').removeClass('manabu-active-lesson');
            $('#c').removeClass('manabu-active-lesson');
            $('#d').removeClass('manabu-active-lesson');
            $('#a').toggleClass('manabu-active-lesson');
            $('#noAnswerValidationAlert').hide();
        });
        $('#b').click(() => {
            $('#a').removeClass('manabu-active-lesson');
            $('#c').removeClass('manabu-active-lesson');
            $('#d').removeClass('manabu-active-lesson');
            $('#b').toggleClass('manabu-active-lesson');
            $('#noAnswerValidationAlert').hide();
        });
        $('#c').click(() => {
            $('#b').removeClass('manabu-active-lesson');
            $('#a').removeClass('manabu-active-lesson');
            $('#d').removeClass('manabu-active-lesson');
            $('#c').toggleClass('manabu-active-lesson');
            $('#noAnswerValidationAlert').hide();
        });
        $('#d').click(() => {
            $('#a').removeClass('manabu-active-lesson');
            $('#b').removeClass('manabu-active-lesson');
            $('#c').removeClass('manabu-active-lesson');
            $('#d').toggleClass('manabu-active-lesson');
            $('#noAnswerValidationAlert').hide();
        });

        $('#CheckMultipleQuestionAnswer').click(() => {
            if ($('.radio.manabu-active-lesson')[0]) {
                let answerFromUser = $('.radio.manabu-active-lesson')[0].dataset.value;
                let correctAnswer = JSON.parse($('#multipleChoiceQuestion')[0].dataset.multiplechoicequestion)[0].answer;
                if (answerFromUser == correctAnswer) {
                    $('#correct-answer-modal').modal('show');
                } else {
                    $('#incorrect-answer-modal').modal('show');
                }
            } else {
                $('#noAnswerValidationAlert').show();
            }
        });

        $('#tryAgain').click(() => {
            $('#a').removeClass('manabu-active-lesson');
            $('#b').removeClass('manabu-active-lesson');
            $('#c').removeClass('manabu-active-lesson');
            $('#d').removeClass('manabu-active-lesson');
        });

        $('#goToNextLesson').click(() => {
            let currentLesson = JSON.parse($('#lesson-data')[0].dataset.lesson);
            let lessons = JSON.parse($('#lesson-data')[0].dataset.lessons);
            let nextLessonId;
            let nextLessonCourseId;

            for (let counter = 0; counter < lessons.length; counter++) {
                if (lessons[counter].id == currentLesson.id) {

                    if (lessons[counter + 1]) {
                        nextLessonId = lessons[counter + 1].id;
                        nextLessonCourseId = lessons[counter + 1].course;
                    } else {
                        nextLessonId = lessons[counter].id;
                        nextLessonCourseId = lessons[counter].course;
                    }

                    $.ajax({
                        url: `/courses/${lessons[counter].course}/lessons/${lessons[counter].id}/record-progress`,
                        type: 'POST',
                        data: JSON.stringify({
                            progress: 1,
                        }),
                        dataType: 'json',
                        contentType: 'application/json; charset=utf-8',
                    })
                        .done(() => {
                            Turbolinks.visit(`/courses/${nextLessonCourseId}/lessons/${nextLessonId}`);
                        })
                        .fail(() => {
                            alert('something went wrong');
                        })

                }
            }
        });

    }
}

window.controllers = window.controllers || {};
window.controllers.checkMultipleQuestionAnswer = CheckMultipleQuestionAnswer;