class WebhookEmailController extends Stimulus.Controller {
  connect() {
    console.log('We are connected...');
  }

  submit() {
    const $addForm = $('#add-form');

    if ($addForm[0].checkValidity() === false) {
      $addForm[0].classList.add('was-validated');
    } else {
      const email = $addForm.find('#email').val();
      const course = $addForm.find('#course').val();
      const completion = $addForm.find('#completion').prop('checked');
      $.ajax({
        url: '/webhooks/email',
        type: 'post',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify({
          email,
          course,
          completion,
        }),
      })
        .done(() => {
          Turbolinks.visit(window.location, { action: 'replace' });
        })
        .fail(() => {
          console.error('Could not save the webhook. We apologise...');
        });
    }
    console.log('post sent');
  }
}

window.controllers = window.controllers || {};
window.controllers.createEmailWebhook = WebhookEmailController;
