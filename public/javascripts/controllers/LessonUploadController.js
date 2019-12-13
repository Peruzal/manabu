class LessonUploadController extends Stimulus.Controller {
  connect() {
    this.$modal = $('#upload-video-modal.modal');

    this.$modal.on('show.bs.modal', (e) => {
      const {
        lessonId,
        courseId,
        lessonTitle,
      } = e.relatedTarget.dataset;
      this.lessonId = lessonId;
      this.courseId = courseId;
      this.lessonTitle = lessonTitle;
      $(this.element).find('#modal-lesson-title').text(` ${lessonTitle}`);

      $('#adminUploadFormAndButtonWrapper').change(() => {
        const fileName = $('#lessonToBeUploaded')[0].files[0].name;
        $('#adminUploadForm').text(fileName);
        if (fileName.includes('.mp4')) {
          $('#adminUploadButton').prop('disabled', false);
          $('#adminUploadButton')[0].style.color = '#f28f06';
          $('#adminUploadButton')[0].style.borderColor = '#f28f06';
          $('#adminUploadButton')[0].style.backgroundColor = '#ffffff';
        } else {
          $('#adminUploadButton').prop('disabled', true);
          $('#adminUploadButton')[0].style.color = '#ffffff';
          $('#adminUploadButton')[0].style.borderColor = '#e3e2e2';
          $('#adminUploadButton')[0].style.backgroundColor = '#e3e2e2';
        }
      });
    });
  }

  upload() {
    const $lessonInput = $(this.element).find('#lessonToBeUploaded');
    const fileName = $lessonInput[0].files[0].name;
    const fileExtension = fileName.split('.').pop();
    const $errorAlert = $(this.element).find('.alert-danger');
    const $successAlert = $(this.element).find('.alert-success');
    const $progress = $(this.element).find('.progress');
    const $progressBar = $(this.element).find('.progress-bar');
    let lessonDuration = 0;

    const formData = new FormData();
    const file = $lessonInput[0];
    formData.append('lessonToBeUploaded', file.files[0], 'lessonToBeUploaded');
    $progress.removeClass('d-none');
    $errorAlert.addClass('d-none');
    $successAlert.addClass('d-none');

    let uploadProgress = 5;

    const timer = setInterval(() => {
      uploadProgress = Math.min(uploadProgress + 1, 100);
      $progressBar.css('width', `${uploadProgress}%`);
    }, 200);

    function final() {
      $progress.addClass('d-none');
      clearInterval(timer);
    }
    axios({
      method: 'POST',
      url: `/admin/${this.courseId}/lessons/${this.lessonId}/upload/${fileExtension}`,
      data: formData,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(() => {
        if (fileExtension === 'mp4') {
          lessonDuration = Math.round($('#audio')[0].duration);
        }
        $.ajax({
          url: `/admin/lessonId/${this.lessonId}/duration`,
          type: 'POST',
          contentType: 'application/json; charset=utf-8',
          dataType: 'json',
          data: JSON.stringify({
            lessonDuration,
          }),
        });
        $successAlert.removeClass('d-none');
        final();
        Turbolinks.visit('/admin/home');
      })
      .catch(() => {
        $errorAlert.removeClass('d-none');
        final();
      });
  }

  clearInput() {
    document.getElementById('adminUploadForm').innerHTML = 'Browse my computer...';
    $('#adminUploadButton').prop('disabled', true);
    $('#adminUploadButton')[0].style.color = '#ffffff';
    $('#adminUploadButton')[0].style.borderColor = '#e3e2e2';
    $('#adminUploadButton')[0].style.backgroundColor = '#e3e2e2';
  }
}


window.controllers = window.controllers || {};
window.controllers.lessonupload = LessonUploadController;
