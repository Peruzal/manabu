class LessonListItemController extends Stimulus.Controller {
  connect() {

    $('.drag-lesson-icon').hover((hoveredElement) => {
      if(hoveredElement.currentTarget.style.cursor != 'grabbing') {
        hoveredElement.currentTarget.previousSibling.style.display = 'block';
      }
    }, (hoveredElement) => {
      hoveredElement.currentTarget.previousSibling.style.display = 'none';
    });

    $('.drag-lesson-icon').click((clickedElement) => {
      clickedElement.currentTarget.previousSibling.style.display = 'none';
      if(clickedElement.currentTarget.style.cursor == 'grabbing') {
        for(let counter = 0; counter < $('.drag-lesson-icon').length; counter++) {
          $('.editLessonIcon')[counter].style.visibility = 'visible';
          $('.drag-lesson-icon')[counter].style.cursor = '';
          $('.editLessonRow')[counter].style.cursor = '';
          $('.editLessonRow')[counter].style.backgroundColor = $('.editLessonRow')[counter].parentElement.parentElement.className === 'archivedEditAndAddLessonsWrapper' ? 'white' : '#f4f3f3';
          $('.editLessonRow')[counter].style.borderBottom = '';
        }
        $('.sortable').sortable( "destroy" );

      } else {

        for(let counter = 0; counter < $('.drag-lesson-icon').length; counter++) {
          $('.editLessonIconsToolbar')[counter].style.visibility = 'hidden';
          $('.editLessonIcon')[counter].style.visibility = 'hidden';
          $('.drag-lesson-icon')[counter].style.cursor = 'grabbing';
          $('.editLessonRow')[counter].style.cursor = 'grabbing';
          $('.editLessonRow')[counter].style.backgroundColor = 'white';
          $('.editLessonRow')[counter].style.borderBottom = '2px solid #f4f3f3';
        }

        $(".sortable").sortable({
          placeholder: 'ui-state-highlight',
          stop: (event, ui) => {
            const orderedlist = [];
            for(let counter = 0; counter < $('.editLessonRow').length; counter++) {
              orderedlist.push(JSON.parse($('.editLessonRow')[counter].dataset.lesson));
            }
            const lessonBeingMoved = JSON.parse(ui.item[0].dataset.lesson);
            $.ajax({
              url: `/admin/orderlessons`,
              type: 'PUT',
              contentType: 'application/json; charset=utf-8',
              data: JSON.stringify({
                orderedlessons: orderedlist,
                lessonBeingMoved: lessonBeingMoved
              })
            })
              .done(() => {
                console.log('ordered list');
              })
              .fail(() => {
                console.error('Could not move the lesson');
              });
          } 
        });

      }
    });

    if (window.lessonScroll) {
      $(document).scrollTop(window.lessonScroll);
      delete window.lessonScroll;
    }

    const {
      lessonId,
      courseId,
    } = this.element.dataset;

    this.lessonId = lessonId;
    this.courseId = courseId;

    document.addEventListener('lesson-progress', ({ detail: { lessonId: eventLessonId, progress } }) => {
      if (eventLessonId === lessonId) {
        const $progress = $(this.element).find('.progress-bar');
        if ($progress.data('progress') < progress) {
          $progress
            .data('progress', progress)
            .css('width', `${progress * 100}%`);
        }

        if (progress >= 0.95) {
          $(this.element).find('.fa-check').removeClass('invisible');
        }
      }
    });
  }


  click(evt) {
    const {
      courseId,
      lessonId,
    } = this;
    if (evt && evt.target && evt.target.localName === 'button') {
      return;
    }
    Turbolinks.visit(`/courses/${courseId}/lessons/${lessonId}`);
  }

  move(evt) {
    const {
      courseId,
      lessonId,
    } = this;

    if (evt && evt.target && evt.target.localName === 'button' && !evt.target.dataset.direction) {
      return;
    }

    const { direction } = evt.target.dataset;

    $.ajax({
      url: `/courses/${courseId}/lessons/${lessonId}/move/${direction}`,
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
    })
      .done(() => {
        window.lessonScroll = $(document).scrollTop();
        Turbolinks.visit(window.location, { action: 'replace' });
      })
      .fail(() => {
        // eslint-disable-next-line no-console
        console.error('Could not move the lesson');
      });
  }
}

// necessary for app script to register with stimulus
window.controllers = window.controllers || {};
window.controllers.lessonlistitem = LessonListItemController;
