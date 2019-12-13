class PreviewContentController extends Stimulus.Controller {
  connect() {
    $('#admin-preview-content-modal.modal').on('show.bs.modal', (e) => {
      const {
        lessonId,
        courseId,
      } = e.relatedTarget.dataset;
      this.lessonId = lessonId;
      this.courseId = courseId;
      $('#adminPreviewContentButton').click(() => {
        Turbolinks.visit(`/courses/watching/${courseId}/${lessonId}`);
      });
    });
  }
}
window.controllers = window.controllers || {};
window.controllers.previewcontentcontroller = PreviewContentController;
