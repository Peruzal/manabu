class TrueOrFalseQuestion extends Stimulus.Controller {
    connect() {
        $('#noAnswerValidationAlert').hide();
        $('#true').click(() => {
            $('#true').toggleClass('manabu-active-lesson');
            $('#false').removeClass('manabu-active-lesson');
            $('#noAnswerValidationAlert').hide();
        });

        $('#false').click(() => {
            $('#false').toggleClass('manabu-active-lesson');
            $('#true').removeClass('manabu-active-lesson');
            $('#noAnswerValidationAlert').hide();
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

        $('#tryAgain').click(() => {
            $('#true').removeClass('manabu-active-lesson');
            $('#false').removeClass('manabu-active-lesson');
        });
    }

    checkAnswer() {
        if ($('.radio.manabu-active-lesson')[0]) {
            let $answerFromUser = $('.radio.manabu-active-lesson')[0].dataset.value;
            let $correctAnswer = JSON.parse($('#trueOrFalseQuestion')[0].dataset.trueorfalsequestion).answer;

            if ($correctAnswer == $answerFromUser) {
                $('#correct-answer-modal').modal('show');
            } else {
                $('#incorrect-answer-modal').modal('show');
            }
        } else {
            $('#noAnswerValidationAlert').show();
        }

    }
}

window.controllers = window.controllers || {};
window.controllers.trueorfalsequestion = TrueOrFalseQuestion;