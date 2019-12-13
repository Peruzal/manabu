class LessonAddController extends Stimulus.Controller {
  connect() {
    $('#admin-add-lesson-modal.modal').on('show.bs.modal', (e) => {
      const courseId = e.relatedTarget.dataset.courseId;
      this.courseId = courseId;

      $('#adminLessonTitle').keyup(() => {
        const potentialLessonTitle = $('#adminLessonTitle')[0].value;
        if (potentialLessonTitle.length !== 0) {
          $('.create-lesson-button')[0].className = 'btn create-lesson-button';
          $('.create-lesson-button')[0].style.color = '#f28f06';
          $('.create-lesson-button')[0].style.backgroundColor = 'white';
          $('.create-lesson-button')[0].style.cursor = 'pointer';
          $('.create-lesson-button')[0].style.border = 'solid 1px #f28f06';
        } else {
          $('.create-lesson-button')[0].className = 'btn create-lesson-button disabled-button';
          $('.create-lesson-button')[0].style.color = '#bbbbbb';
          $('.create-lesson-button')[0].style.backgroundColor = 'white';
          $('.create-lesson-button')[0].style.cursor = 'pointer';
          $('.create-lesson-button')[0].style.border = 'solid 1px #bbbbbb';
        }
      });

      $('.btn.create-lesson-button').click((createButton) => {
        $.ajax({
          url: '/admin/lessonTitle',
          type: 'POST',
          contentType: 'application/json; charset=utf-8',
          dataType: 'json',
          data: JSON.stringify({
            title: createButton.currentTarget.parentNode[0].value,
            course: courseId,
          }),
        })
          .done((response) => {
            if (response.lessonAlreadyExists) {
              $('.alert.alert-danger').show();
            } else {
              Turbolinks.visit('/admin/home');
            }
          })
          .fail(() => {
            console.error('Could not add the lesson');
          });
      });
    });
  }
}
window.controllers = window.controllers || {};
window.controllers.lessonadd = LessonAddController;