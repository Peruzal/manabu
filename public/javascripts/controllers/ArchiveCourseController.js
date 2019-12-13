class ArchiveCourseController extends Stimulus.Controller {
  connect() {
    $('#admin-archive-modal.modal,#admin-move-to-active-courses-modal.modal').on('show.bs.modal', (e) => {
      const {
        courseId,
        courseTitle,
      } = e.relatedTarget.dataset;
      this.courseId = courseId;
      this.courseTitle = courseTitle;
      $('#courseToBeArchived')[0].textContent = `"${courseTitle}"`;
      $('#courseToBeMoved')[0].textContent = `"${courseTitle}"`;

      function sendCourseToArchive() {
        $.ajax({
          url: `/admin/deleteCourse/${courseId}`,
          type: 'PUT',
        }).done(() => {
          window.location.reload();
        }).fail(() => {
          window.location.reload();
        });
      }

      function bringCourseBackFromArchive() {
        $.ajax({
          url: `/admin/undoDeleteCourse/${courseId}`,
          type: 'PUT',
        }).done(() => {
          Turbolinks.visit('/admin/home');
        }).fail(() => {
          console.error('request to undo delete course was not sent successfully');
        });
      }

      $('#adminMoveToCoursesButton').click(() => {
        bringCourseBackFromArchive();
      });

      $('#adminArchiveButton').click(() => {
        sendCourseToArchive();
      });
    });
  }
}
window.controllers = window.controllers || {};
window.controllers.archivecourse = ArchiveCourseController;
