/* eslint-disable */

class ProfileImageController extends Stimulus.Controller {
  connect() {
    console.log('In ProfileImageController connect!', this.element);
  }

  upload(evt) {
    console.log('Uploading!!!', this.element);
    evt.preventDefault();

    const formData = new FormData();
    const file = $('.form-control-file')[0];
    formData.append('file', file.files[0]);



    axios({
      method: 'POST',
      url: '/profile',
      data: formData,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    })
    .then(function (response) {
      Turbolinks.clearCache();
      Turbolinks.visit('/');
    })
    .catch(function (response) {
      console.log(response);
    });
  }
}

window.controllers = window.controllers || {};
window.controllers['profile-image'] = ProfileImageController;
