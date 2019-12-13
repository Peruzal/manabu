class TagController extends Stimulus.Controller {
  connect() {
    $('#admin-add-tag-modal.modal').on('show.bs.modal', (e) => {
      const {
        course,
      } = e.relatedTarget.dataset;
      this.course = course;
      const courseId = JSON.parse(course).id;
      const tagsOfCourse = JSON.parse(course).tags;

      function addTag() {
        const tagName = $('#adminAddTagForm')[0].value;
        $.ajax({
          url: `/admin/addTagToCourse/${courseId}`,
          type: 'POST',
          contentType: 'application/json; charset=utf-8',
          dataType: 'json',
          data: JSON.stringify({
            tag: tagName,
          }),
        })
          .done(() => {
            window.location.reload();
          })
          .fail(() => {
            window.location.reload();
          });
      }
      function deleteTag() {
        const tagName = $('#adminAddTagForm')[0].value;
        let tagId = '';
        tagsOfCourse.forEach((tag) => {
          if (tag.label.toLowerCase() === tagName.toLowerCase()) {
            tagId = tag.id;
          }
        });
        $.ajax({
          url: `/admin/deleteTag/${tagId}/${courseId}`,
          type: 'DELETE',
        }).done(() => {
          window.location.reload();
        })
          .fail(() => {
            console.log('Failed to delete tag');
          });
      }
      $('#adminAddTagForm').keyup(() => {
        const tagName = $('#adminAddTagForm')[0].value;
        if (tagName === '' || tagName === undefined) {
          $('#adminAddTagButton').prop('disabled', true);
          $('#adminAddTagButton').text('Add / Remove');
        } else {
          let tagAlreadyExists = false;
          tagsOfCourse.forEach((tag) => {
            if (tag.label.toLowerCase() === tagName.toLowerCase()) {
              tagAlreadyExists = true;
            }
          });
          if (tagAlreadyExists) {
            $('#adminAddTagButton').prop('disabled', false);
            $('#adminAddTagButton').text('Remove');
          } else {
            $('#adminAddTagButton').prop('disabled', false);
            $('#adminAddTagButton').text('Add');
          }
        }
      });
      $('#adminAddTagButton').click(() => {
        const buttonText = $('#adminAddTagButton').text();
        if (buttonText === 'Add') {
          addTag();
        } else {
          deleteTag();
        }
      });
    });
  }
}

window.controllers = window.controllers || {};
window.controllers['tag-controller'] = TagController;