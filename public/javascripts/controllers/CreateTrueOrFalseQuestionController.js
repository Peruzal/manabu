class CreateTrueOrFalseQuestionController extends Stimulus.Controller {
  connect() {
    this.$modal = $('#admin-create-quiz-modal.modal');
    this.$modal.on('show.bs.modal', (e) => {
      const {
        lessonId,
        courseId,
      } = e.relatedTarget.dataset;
      this.lessonId = lessonId;
      this.courseId = courseId;

      $('#trueOrFalseOption').change(() => {
        $('#adminQuizNextButton').prop('disabled', false);
        $('#adminQuizNextButton')[0].style.color = '#f28f06';
        $('#adminQuizNextButton')[0].style.backgroundColor = 'white';
        $('#adminQuizNextButton')[0].style.cursor = 'pointer';
        $('#adminQuizNextButton')[0].style.border = 'solid 1px #f28f06';
      });

      $('#trueOption').change(() => {
        $('#createTrueOrFalseButton').prop('disabled', false);
        $('#createTrueOrFalseButton')[0].style.color = '#f28f06';
        $('#createTrueOrFalseButton')[0].style.backgroundColor = 'white';
        $('#createTrueOrFalseButton')[0].style.cursor = 'pointer';
        $('#createTrueOrFalseButton')[0].style.border = 'solid 1px #f28f06';
      });

      $('#falseOption').change(() => {
        $('#createTrueOrFalseButton').prop('disabled', false);
        $('#createTrueOrFalseButton')[0].style.color = '#f28f06';
        $('#createTrueOrFalseButton')[0].style.backgroundColor = 'white';
        $('#createTrueOrFalseButton')[0].style.cursor = 'pointer';
        $('#createTrueOrFalseButton')[0].style.border = 'solid 1px #f28f06';
      });

      $('#adminQuizNextButton').click(() => {
        if ($('#trueOrFalseOption')[0].checked) {
          $('.modal-content#adminCreateQuizModal')[0].style.display = 'none';
          $('.modal-content#createTrueOrFalseModal')[0].style.display = 'block';
        } else if ($('#multipleChoiceOption')[0].checked) {
          $('.modal-content#adminCreateQuizModal')[0].style.display = 'none';
          $('.modal-content#createMultipleChoiceModal')[0].style.display = 'block';
          $('.modal-content#createTrueOrFalseModal')[0].style.display = 'none';
        } else {
          console.log('Select an option!');
        }
      });

      $('#trueOrFalseBackButton').click(() => {
        $('.modal-content#adminCreateQuizModal')[0].style.display = 'block';
        $('.modal-content#createTrueOrFalseModal')[0].style.display = 'none';
      });

      $('#trueOrFalseStatement').keyup(() => {
        const statement = $('#trueOrFalseStatement')[0].value;
        if (statement.length !== 0) {
          $('#createTrueOrFalseButton').prop('disabled', false);
          $('#createTrueOrFalseButton')[0].style.color = '#f28f06';
          $('#createTrueOrFalseButton')[0].style.backgroundColor = 'white';
          $('#createTrueOrFalseButton')[0].style.cursor = 'pointer';
          $('#createTrueOrFalseButton')[0].style.border = 'solid 1px #f28f06';
        } else {
          $('#createTrueOrFalseButton').prop('disabled', true);
          $('#createTrueOrFalseButton')[0].style.color = '#bbbbbb';
          $('#createTrueOrFalseButton')[0].style.backgroundColor = 'white';
          $('#createTrueOrFalseButton')[0].style.cursor = 'auto';
          $('#createTrueOrFalseButton')[0].style.border = 'solid 1px #bbbbbb';
        }
      });
    });
  }

  createTrueOrFalseQuiz() {
    const statement = $('#createTrueOrFalseStatement')[0].value;
    let answer = 'false';
    if ($('#trueOption')[0].checked) {
      answer = 'true';
    } else {
      answer = 'false';
    }
    $.ajax({
      url: `/courses/${this.courseId}/lessons/${this.lessonId}/createTrueOrFalseQuestion`,
      type: 'post',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      data: JSON.stringify({
        statement,
        answer,
      }),
    })
      .done(() => {
        Turbolinks.visit(window.location, { action: 'replace' });
      })
      .fail(() => {
        console.error('Could not save the question.');
      });
    console.log('Question created!');
  }

  editTrueOrFalseQuiz() {
    const statement = $('#trueOrFalseStatement')[0].value;
    let answer = false;
    if ($('#trueOption')[0].checked) {
      answer = true;
    } else {
      answer = false;
    }
    $.ajax({
      url: `/courses/${this.courseId}/lessons/${this.lessonId}/editTrueOrFalseQuestion`,
      type: 'put',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      data: JSON.stringify({
        statement,
        answer,
      }),
    })
      .done(() => {
        Turbolinks.visit(window.location, { action: 'replace' });
      })
      .fail(() => {
        console.error('Could not save the question. We apologise...');
      });
    console.log('Question created!');
  }
}
window.controllers = window.controllers || {};
window.controllers.createTrueOrFalseQuestionController = CreateTrueOrFalseQuestionController;
