class CreateMultipleChoiceQuestionController extends Stimulus.Controller {
  connect() {
    this.$modal = $('#admin-create-quiz-modal.modal');

    function enableCreateMultipleChoiceButton() {
      $('#createMultipleChoiceButton').prop('disabled', false);
      $('#createMultipleChoiceButton')[0].style.color = '#f28f06';
      $('#createMultipleChoiceButton')[0].style.backgroundColor = 'white';
      $('#createMultipleChoiceButton')[0].style.cursor = 'pointer';
      $('#createMultipleChoiceButton')[0].style.border = 'solid 1px #f28f06';
    }

    function disableCreateMultipleChoiceButton() {
      $('#createMultipleChoiceButton').prop('disabled', true);
      $('#createMultipleChoiceButton')[0].style.color = '#bbbbbb';
      $('#createMultipleChoiceButton')[0].style.backgroundColor = 'white';
      $('#createMultipleChoiceButton')[0].style.cursor = 'auto';
      $('#createMultipleChoiceButton')[0].style.border = 'solid 1px #bbbbbb';
    }

    this.$modal.on('show.bs.modal', (e) => {
      const {
        lessonId,
        courseId,
      } = e.relatedTarget.dataset;
      this.lessonId = lessonId;
      this.courseId = courseId;

      $('#multipleChoiceOption').change(() => {
        $('#adminQuizNextButton').prop('disabled', false);
        $('#adminQuizNextButton')[0].style.color = '#f28f06';
        $('#adminQuizNextButton')[0].style.backgroundColor = 'white';
        $('#adminQuizNextButton')[0].style.cursor = 'pointer';
        $('#adminQuizNextButton')[0].style.border = 'solid 1px #f28f06';
      });


      $('#firstOption').change(() => {
        enableCreateMultipleChoiceButton();
      });

      $('#secondOption').change(() => {
        enableCreateMultipleChoiceButton();
      });

      $('#thirdOption').change(() => {
        enableCreateMultipleChoiceButton();
      });

      $('#fourthOption').change(() => {
        enableCreateMultipleChoiceButton();
      });

      $('#adminQuizNextButton').click(() => {
        if ($('#trueOrFalseOption')[0].checked) {
          $('.modal-content#adminCreateQuizModal')[0].style.display = 'none';
          $('.modal-content#createTrueOrFalseModal')[0].style.display = 'block';
          $('.modal-content#createMultipleChoiceModal')[0].style.display = 'none';
        } else if ($('#multipleChoiceOption')[0].checked) {
          $('.modal-content#adminCreateQuizModal')[0].style.display = 'none';
          $('.modal-content#createMultipleChoiceModal')[0].style.display = 'block';
          $('.modal-content#createTrueOrFalseModal')[0].style.display = 'none';
        } else {
          console.log('Select an option!');
        }
      });

      $('#multipleChoiceBackButton').click(() => {
        $('.modal-content#adminCreateQuizModal')[0].style.display = 'block';
        $('.modal-content#createMultipleChoiceModal')[0].style.display = 'none';
      });

      $('#createMultipleChoiceQuestion').keyup(() => {
        const statement = $('#createMultipleChoiceQuestion')[0].value;
        if (statement.length !== 0) {
          enableCreateMultipleChoiceButton();
        } else {
          disableCreateMultipleChoiceButton();
        }
      });
    });
  }

  createMultipleChoiceQuiz() {
    const question = $('#createMultipleChoiceQuestion')[0].value;
    const option1 = $('#firstOptionStatement')[0].value;
    const option2 = $('#secondOptionStatement')[0].value;
    const option3 = $('#thirdOptionStatement')[0].value;
    const option4 = $('#fourthOptionStatement')[0].value;
    let answer;
    if ($('#firstOption')[0].checked) {
      answer = option1;
    } else if ($('#secondOption')[0].checked) {
      answer = option2;
    } else if ($('#thirdOption')[0].checked) {
      answer = option3;
    } else {
      answer = option4;
    }
    $.ajax({
      url: `/courses/${this.courseId}/lessons/${this.lessonId}/createMultipleChoiceQuestion`,
      type: 'post',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      data: JSON.stringify({
        question,
        option1,
        option2,
        option3,
        option4,
        answer,
      }),
    })
      .done(() => {
        window.location.reload();
      })
      .fail(() => {
        console.error('Could not save the question.');
      });
  }
}

window.controllers = window.controllers || {};
window.controllers.createMultipleChoiceQuestion = CreateMultipleChoiceQuestionController;
