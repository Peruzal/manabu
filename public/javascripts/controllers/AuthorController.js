class AuthorController extends Stimulus.Controller {
  connect() {
    $('#admin-add-contributor-modal.modal').on('show.bs.modal', (e) => {
      const {
        course,
        lessonId
      } = e.relatedTarget.dataset;
      this.course = course;
      this.lessonId = lessonId;
      const courseId = JSON.parse(course).id;
      const authorsOfCourse = JSON.parse(course).authors;

      function addAuthor() {
        const authorEmail = $('#adminAddContributorForm')[0].value;
        $.ajax({
          url: `/admin/addAuthorToCourse/${courseId}/${lessonId}`,
          type: 'POST',
          contentType: 'application/json; charset=utf-8',
          dataType: 'json',
          data: JSON.stringify({
            email: authorEmail,
          }),
        })
          .done((response) => {
            if (response.authorAddedSuccessfully) {
              window.location.reload();
            } else {
              $('.alert.alert-danger#noSuchUserWarning').show();
            }
          })
          .fail(() => {
            $('.alert.alert-danger#failureToAddUserWarning').show();
          });
      }
      function deleteAuthor() {
        const authorEmail = $('#adminAddContributorForm')[0].value;
        let authorId = '';
        authorsOfCourse.forEach((author) => {
          if (author.email.toLowerCase() === authorEmail.toLowerCase()) {
            authorId = author.id;
          }
        });
        $.ajax({
          url: `/admin/deleteAuthor/${authorId}/${courseId}/${lessonId}`,
          type: 'DELETE',
        }).done(() => {
          window.location.reload();
        })
          .fail(() => {
            $('.alert.alert-danger#failureToRemoveUserWarning').show();
          });
      }
      $('#adminAddContributorForm').keyup(() => {
        const authorEmail = $('#adminAddContributorForm')[0].value;
        if (authorEmail === '' || authorEmail === undefined) {
          $('#adminAddContributorButton').prop('disabled', true);
          $('#adminAddContributorButton').text('Add / Remove');
        } else {
          $('#adminAddContributorButton').prop('disabled', false);
          let authorAlreadyExists = false;
          authorsOfCourse.forEach((author) => {
            if (author.email.toLowerCase() === authorEmail.toLowerCase()) {
              authorAlreadyExists = true;
            }
          });
          if (authorAlreadyExists) {
            $('#adminAddContributorButton').text('Remove');
          } else {
            $('#adminAddContributorButton').text('Add');
          }
        }
      });
      $('#adminAddContributorButton').click(() => {
        $('#adminAddContributorButton').prop('disabled', true);
        const buttonText = $('#adminAddContributorButton').text();
        if (buttonText === 'Add') {
          $('#adminAddContributorButton').prop('disabled', false);
          addAuthor();
        } else {
          $('#adminAddContributorButton').prop('disabled', false);
          deleteAuthor();
        }
      });
    });
  }
}

window.controllers = window.controllers || {};
window.controllers['author-controller'] = AuthorController;
