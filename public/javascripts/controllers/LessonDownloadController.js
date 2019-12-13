class LessonDownloadController extends Stimulus.Controller {
  connect() {
    $('#download-video-modal.modal').on('show.bs.modal', (e) => {
      const {
        lessonTitle,
        lessonUrl,
      } = e.relatedTarget.dataset;
      this.lessonTitle = lessonTitle;
      this.lessonUrl = lessonUrl;
      $('#lessonToBeDownloaded')[0].textContent = lessonTitle;
      document.getElementById('adminDownloadButton').href = `${this.lessonUrl}`;
      document.getElementById('adminDownloadButton').download = `${this.lessonTitle}.mp4`;
    });
  }
}
window.controllers = window.controllers || {};
window.controllers.lessondownload = LessonDownloadController;
