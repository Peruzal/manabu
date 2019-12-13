class LessonDeleteController extends Stimulus.Controller {
  connect() {
    $('#admin-delete-modal.modal').on('show.bs.modal', (e) => {
      const {
        lessonId,
        courseId,
        lessonTitle,
      } = e.relatedTarget.dataset;
      this.lessonId = lessonId;
      this.courseId = courseId;
      this.lessonTitle = lessonTitle;
      $('#lessonToBeDeleted')[0].textContent = lessonTitle;
      const deleteLessonUrl = `/admin/${courseId}/lessons/${lessonId}`;

      function deleteLesson(deleteUrl) {
        $.ajax({
          url: deleteUrl,
          type: 'DELETE',
          contentType: 'application/json; charset=utf-8',
        })
          .done(() => {
            Turbolinks.visit(window.location);
          })
          .fail(() => {
            console.error('Could not delete the lesson');
          });
      }
      $('#adminDeleteButton').click(() => {
        deleteLesson(deleteLessonUrl);
      });
    });

    $('#delete-presentation-modal').on('show.bs.modal', (e) => {
      const {
        presentationTitle,
      } = e.relatedTarget.dataset;

      this.presentationTitle = presentationTitle;

      $(this.element).find('#modal-presentation-title').text(` ${presentationTitle}`);
    });
  }

  presentationDelete() {
    $.ajax({
      url: `/presentations/delete/${this.presentationTitle}`,
      type: 'DELETE',
      contentType: 'application/json; charset=utf-8',
    })
      .done(() => {
        Turbolinks.visit(window.location);
      })
      .fail(() => {
        console.error('Could not delete the presentation');
      });
  }
}

window.controllers = window.controllers || {};
window.controllers.lessondelete = LessonDeleteController;
