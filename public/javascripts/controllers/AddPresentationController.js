class AddPresentationController extends Stimulus.Controller {
  connect() {
    $('input').keyup(function () {
      ableOrDiableCreatePresentationButton();
    });

    function ableOrDiableCreatePresentationButton() {
      const presentationTitle = $('input#adminPresentationTitle').val();
      $('.alert.alert-danger').hide();
      if(presentationTitle.trim().length !== 0 && $('#course .select-one-text')[0].textContent !== 'choose course') {
        $('.create-presentation-button')[0].className = 'btn create-presentation-button';
        $('.create-presentation-button')[0].style.color = '#f28f06';
        $('.create-presentation-button')[0].style.backgroundColor = 'white';
        $('.create-presentation-button')[0].style.cursor = 'pointer';
        $('.create-presentation-button')[0].style.border = 'solid 1px #f28f06';
      } else {        
        $('.create-presentation-button')[0].className = 'btn create-presentation-button disabled-button';
        $('.create-presentation-button')[0].style.color = '#bbbbbb';
        $('.create-presentation-button')[0].style.backgroundColor = 'white';
        $('.create-presentation-button')[0].style.cursor = 'pointer';
        $('.create-presentation-button')[0].style.border = 'solid 1px #bbbbbb';
      }
    }

    $('#admin-add-presentation-modal #course .dropdown-item').click((clickedElement) => {
      $('#admin-add-presentation-modal #course .select-one-text')[0].textContent = clickedElement.currentTarget.textContent;
      $('#admin-add-presentation-modal #course .select-one-text')[0].dataset.courseId = clickedElement.currentTarget.dataset.courseId;
      ableOrDiableCreatePresentationButton();
    });

    $('#admin-add-presentation-modal #theme .dropdown-item').click((clickedElement) => {
      $('#admin-add-presentation-modal #theme .select-one-text')[0].textContent = clickedElement.currentTarget.textContent;
    });

    $('#admin-add-presentation-modal #transition .dropdown-item').click((clickedElement) => {
      $('#admin-add-presentation-modal #transition .select-one-text')[0].textContent = clickedElement.currentTarget.textContent;
    });

    $('.create-presentation-button').click(function (clickedElement) {
      switch(clickedElement.currentTarget.className.trim()) {
        case 'btn create-presentation-button':
          $.ajax({
            url: '/admin/presentation',
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: JSON.stringify({
              title: $('#adminPresentationTitle')[0].value,
              theme: $('.dropdown-presentation-theme .select-one-text')[0].textContent,
              transitionType: $('.dropdown-presentation-transition .select-one-text')[0].textContent,
              courseId: $('#admin-add-presentation-modal #course .select-one-text')[0].dataset.courseId
            }),
          })
            .done((response) => {
              switch(response.presentationTitleExists) {
                case true:
                  $('.alert.alert-danger').show();
                break;
                case false:
                  Turbolinks.visit('/admin/home');
              }
            })
            .fail(() => {
              console.error('could not save the presentation');
            });
        break;
      }
    });

    $('.alert.alert-danger').hide();
    $('#add-presentation-modal').on('show.bs.modal', (event) => {
      this.presentations = JSON.parse(event.currentTarget.dataset.presentations);
    });
    $('#add-presentation-modal').on('hidden.bs.modal', (event) => {
      $('.alert.alert-danger').hide();
    });
  }

  addPresentation() {
    let presentationAlreadyExists = false;
    const title = $('#title').val();
    const theme = $('#theme').val();
    const transitionType = $('#transition').val();
    this.presentations.forEach((presentation) => {
      if (title === presentation.title) {
        presentationAlreadyExists = true;
      }
    });

    if (presentationAlreadyExists) {
      $('.alert.alert-danger').show();
    } else if (title === '' || !title.match('^[A-z0-9]+[!@#$&()\\-`.+,/\']+$')) {
      $('.alert.alert-danger').text('Please enter a valid title.').show();
    } else {
      $.ajax({
        url: '/presentations',
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify({
          title: title,
          theme: theme,
          transitionType: transitionType,
        }),
      })
        .done(() => {
          $('.alert.alert-danger').hide();
          Turbolinks.visit('/presentations');
        })
        .fail(() => {
          console.error('could not save the presentation');
        });
    }
  }
}
window.controllers = window.controllers || {};
window.controllers.addpresentationcontroller = AddPresentationController;
