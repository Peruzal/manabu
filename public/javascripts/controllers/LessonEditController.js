class LessonEditController extends Stimulus.Controller {
    connect() {
        $('.editLessonRow .editLessonIcon').click(function (clickedIcon) {
            switch (clickedIcon.currentTarget.firstChild.className) {
                case 'writing-pencil-icon':
                    for(let counter = 0; counter < $('.editLessonIcon').length; counter++) {
                        $('.editLessonIcon')[counter].firstChild.className = 'writing-pencil-icon';
                        $('.editLessonIconsToolbar')[counter].style.visibility = 'hidden';
                    }
                    clickedIcon.currentTarget.firstChild.parentElement.previousSibling.disabled = false;
                    clickedIcon.currentTarget.firstChild.parentElement.previousSibling.focus();
                    clickedIcon.currentTarget.firstChild.className = 'filled-pencil-icon';
                    clickedIcon.currentTarget.firstChild.style.color = '#870a3c';
                    break;
                case 'filled-pencil-icon':
                    clickedIcon.currentTarget.firstChild.parentElement.previousSibling.disabled = true;
                    clickedIcon.currentTarget.firstChild.className = 'writing-pencil-icon';
                    clickedIcon.currentTarget.firstChild.style.color = 'white';
                    break;
            }

            for(let counter = 0; counter < $('.editLessonRow').length; counter++) {
                if(JSON.parse($('.nameOfLesson')[counter].dataset.lesson).course === JSON.parse($(this).siblings('input.nameOfLesson')[0].dataset.lesson).course) {
                    updateLessonTitle($('.nameOfLesson')[counter].value, JSON.parse($('.nameOfLesson')[counter].dataset.lesson));
                }
            }

            function updateLessonTitle(newLessonTitle,lesson) {
                $.ajax({
                    url: `/admin/${lesson.course}/lessons/${lesson.id}/EditLesson`,
                    type: 'POST',
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                    data: JSON.stringify({
                        title: newLessonTitle,
                        type: lesson.type,
                        markdown: lesson.markdown,
                    }),
                })
                .done(() => {
                    console.log('successfully edited lesson title');
                })
                .fail(() => {
                    console.error('request to edit lesson title was not sent successfully');
                });
            }
        });
    }

}

window.controllers = window.controllers || {};
window.controllers.lessonEditController = LessonEditController;
