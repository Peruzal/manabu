class LessonController extends Stimulus.Controller {
  connect() {
    var {
      lessonId,
      courseId,
      scrollProgress,
      progress,
      lessons,
      lesson
    } = this.element.dataset;

    this.saveProgress = _.debounce((updatedProgress) => {
      let {
        lessonId,
        courseId,
      } = this.element.dataset;
      $.ajax({
        url: `/courses/${courseId}/lessons/${lessonId}/record-progress`,
        type: 'POST',
        data: JSON.stringify({
          progress: updatedProgress,
        }),
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
      })
        .done(() => {
          const progressEvent = new CustomEvent('lesson-progress', {
            detail: {
              progress: updatedProgress,
              lessonId,
            },
          });
          document.dispatchEvent(progressEvent);

        })
        .fail(() => {
          console.error('Could not save the progress');
        });

        updateProgressOnLessonDataset(lessonId, updatedProgress);

      if (updatedProgress >= 0.95) {
        $.ajax({
          url: `/courses/completedCourses`,
          type: 'POST'
        })
          .done(() => {
            console.log('Checked if new course is completed');
          })
          .fail(() => {
            // eslint-disable-next-line no-console
            console.error('Could not check if course is completed');
          });
      }
    }, 150);

    function updateProgressOnLessonDataset(lessonId, latestLessonProgress) {
      const progressIndicators = $('.lesson-container .progress-indicator'); 
      for (let counter = 0; counter < progressIndicators.length; counter++) {
        if (progressIndicators[counter].dataset.lessonid == lessonId){
          const currentLessonProgress = JSON.parse(progressIndicators[counter].dataset.lessonprogress).lessons[lessonId];
          if(currentLessonProgress < latestLessonProgress){
            progressIndicators[counter].dataset.latestlessonprogress = latestLessonProgress;
          }
        }
      }
    }

    $('.lesson-container .row').click((clickedLesson) => {
      let lesson = JSON.parse(clickedLesson.currentTarget.dataset.lesson);
      Turbolinks.visit(`/courses/watching/${lesson.course}/${lesson.id}`);
    });

    if(JSON.parse(lesson).type == 'PRESENTATION'){
      this.saveProgress(1);
    }

    if (scrollProgress === 'true') {
      const docHeight = $(document).height();
      const winHeingt = $(window).height();

      $(window).on('scroll', () => {
        let top;
        let value;

        top = $(window).scrollTop();
        top = (Number.isNaN(top)) ? 0 : top;

        if (top === 0) {
          value = 0;
        } else {
          value = top / (docHeight - winHeingt);

          if (value > 1) {
            value = 1;
          }
        }

        this.saveProgress(value);

      });
    }

    $('video').bind('timeupdate', (e) => {
      this.saveProgress(e.target.currentTime / e.target.duration);
    });

    $('video').bind('loadedmetadata', (e) => {
      e.target.currentTime = Math.max(progress * e.target.duration, 1.1);
    });

    const $progress = $(this.element).find('.progress-bar');

    if ($progress.prevObject[0].dataset.progress == 1) {
      $('video').bind('loadedmetadata', (e) => {
        e.target.currentTime = 0;
      });
    }

    $("video").bind("ended", function () {

      if (!$('video')[0].paused) {
        $('video')[0].pause();
      } else {
        $('video')[0].play();
      }

      let lessonIds = [];

      for (let i = 0; i < JSON.parse(lessons).length; i++) {
        lessonIds.push(JSON.parse(lessons)[i].id);

      }


      for (let count = 0; count < lessonIds.length; count++) {
        if (lessonIds[count] == lessonId) {
          if (count != lessonIds.length - 1) {
            lessonId = lessonIds[count + 1];
            break;
          }
        }
      }

      Turbolinks.visit(`/courses/watching/${courseId}/${lessonId}`);
    });
  }
}

// necessary for app script to register with stimulus
window.controllers = window.controllers || {};
window.controllers.lesson = LessonController;