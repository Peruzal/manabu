class BookmarkController extends Stimulus.Controller {
    connect() {
        $('#tagWrapper .bookmark-icon').click(()=> {
            let bookmarkDuration = $('video#video')[0].currentTime;
            bookmarkLesson(bookmarkDuration);
        });

        $('.bookmark-text').click(function (clickedElement) {
            clickedElement.stopPropagation();
            const bookmarkedDuration = $(this)[0].textContent;
            const lesson = JSON.parse($(this).parent().parent()[0].dataset.lesson);
            gotoBookmarkedLesson(lesson.course, lesson.id, bookmarkedDuration);
        });

        $('.bookmark-icon').click(function (clickedElement) {
            clickedElement.stopPropagation();
            const bookmarkedDuration = $(this)[0].nextSibling.textContent;
            const lesson = JSON.parse($(this).parent().parent()[0].dataset.lesson);
            gotoBookmarkedLesson(lesson.course, lesson.id, bookmarkedDuration);
        });

        function gotoBookmarkedLesson(courseId,lessonId,bookmarkedDuration) {
            Turbolinks.visit(`/courses/bookmark/${courseId}/${lessonId}/${bookmarkedDuration}`);
        }

        function bookmarkLesson(duration) {
            let courseId = $('#courseAndLessonWrapper')[0].dataset.courseId;
            let lessonId = $('#courseAndLessonWrapper')[0].dataset.lessonId;
            $.ajax({
                url: `/courses/bookmark`,
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                data: JSON.stringify({
                    duration,
                    courseId,
                    lessonId,
                }),
            })
                .done((bookmark) => {
                    for(let counter = 0; counter < $('.bookmarks-container').length; counter++){
                        let bookmarkLessonId = $('.bookmarks-container')[counter].dataset.lessonid;
                        let lessonId = $('#courseAndLessonWrapper')[0].dataset.lessonId;
                        if(lessonId == bookmarkLessonId){
                            $(".bookmarks-container:eq("+counter+")").append("<div class=\"bookmark-icon\"></div><div class=\"bookmark-text\">"+bookmark.duration+"</span>");
                        }
                    }
                })
                .fail(() => {
                    console.error('Could not add bookmark');
                });
        }
    }

}

window.controllers = window.controllers || {};
window.controllers.bookmarkController = BookmarkController;