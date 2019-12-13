class MultipleChoiceController extends Stimulus.Controller {
  connect() {
    $('.test-progress#multipleChoiceTestProgress').click((e) => {
      e.stopPropagation();
      const {
        multipleChoiceQuiz,
        courseId,
        lessonId,
        lessons,
      } = e.currentTarget.dataset;
      this.multipleChoiceQuiz = multipleChoiceQuiz;
      this.courseId = courseId;
      this.lessonId = lessonId;
      this.lessons = lessons;
      $('#multiple-choice-modal.modal').modal('toggle');
    });

    function enableMultipleChoiceButton() {
      $('#submitMultipleChoiceButton').prop('disabled', false);
      $('#submitMultipleChoiceButton')[0].style.color = '#f28f06';
      $('#submitMultipleChoiceButton')[0].style.backgroundColor = 'white';
      $('#submitMultipleChoiceButton')[0].style.cursor = 'pointer';
      $('#submitMultipleChoiceButton')[0].style.border = 'solid 1px #f28f06';
    }

    $('#multiple-choice-modal.modal').on('show.bs.modal', () => {
      let answerSubmittedByUser;
      const multipleChoice = JSON.parse(this.multipleChoiceQuiz);
      const currentLessonId = this.lessonId;
      const courseId = this.courseId;
      const lessonsOfCourse = JSON.parse(this.lessons);
      $('#multipleChoiceQuestion')[0].textContent = multipleChoice[0].question;
      $('#firstOptionStatement')[0].textContent = multipleChoice[0].option1;
      $('#secondOptionStatement')[0].textContent = multipleChoice[0].option2;
      $('#thirdOptionStatement')[0].textContent = multipleChoice[0].option3;
      $('#fourthOptionStatement')[0].textContent = multipleChoice[0].option4;

      $('#firstOption').change(() => {
        enableMultipleChoiceButton();
      });

      $('#secondOption').change(() => {
        enableMultipleChoiceButton();
      });

      $('#thirdOption').change(() => {
        enableMultipleChoiceButton();
      });

      $('#fourthOption').change(() => {
        enableMultipleChoiceButton();
      });

      $('#submitMultipleChoiceButton').click(() => {
        if ($('#firstOption')[0].checked) {
          answerSubmittedByUser = multipleChoice[0].option1;
        } else if ($('#secondOption')[0].checked) {
          answerSubmittedByUser = multipleChoice[0].option2;
        } else if ($('#thirdOption')[0].checked) {
          answerSubmittedByUser = multipleChoice[0].option3;
        } else {
          answerSubmittedByUser = multipleChoice[0].option4;
        }
        if (answerSubmittedByUser === multipleChoice[0].answer) {
          $('#multipleChoiceOptionsWrapper')[0].style.display = 'none';
          $('.correct-answer')[0].style.display = 'block';
          $('.incorrect-answer')[0].style.display = 'none';
          $('#submitMultipleChoiceButton')[0].style.display = 'none';
          $('#continueMultipleChoiceButton')[0].style.display = 'block';
        } else {
          $('#multipleChoiceOptionsWrapper')[0].style.display = 'none';
          $('.correct-answer')[0].style.display = 'none';
          $('.incorrect-answer')[0].style.display = 'block';
          $('#submitMultipleChoiceButton')[0].style.display = 'none';
          $('#tryAgainMultipleChoiceButton')[0].style.display = 'block';
        }
      });

      $('#continueMultipleChoiceButton').click(() => {
        let nextLessonId = currentLessonId;
        for (let i = 0; i < lessonsOfCourse.length; i++) {
          if (lessonsOfCourse[i].id === currentLessonId) {
            nextLessonId = lessonsOfCourse[i + 1].id;
          }
        }
        Turbolinks.visit(`/courses/watching/${courseId}/${nextLessonId}`);
      });

      $('#tryAgainMultipleChoiceButton').click(() => {
        $('#multipleChoiceOptionsWrapper')[0].style.display = 'block';
        $('.correct-answer')[0].style.display = 'none';
        $('.incorrect-answer')[0].style.display = 'none';
        $('#submitMultipleChoiceButton')[0].style.display = 'block';
        $('#continueMultipleChoiceButton')[0].style.display = 'none';
        $('#tryAgainMultipleChoiceButton')[0].style.display = 'none';
      });
    });

    $('#multiple-choice-modal.modal').on('hidden.bs.modal', () => {
      $('#multipleChoiceQuestion')[0].textContent = '';
      $('#firstOptionStatement')[0].textContent = '';
      $('#secondOptionStatement')[0].textContent = '';
      $('#thirdOptionStatement')[0].textContent = '';
      $('#fourthOptionStatement')[0].textContent = '';
    });
  }
}

window.controllers = window.controllers || {};
window.controllers['multiple-choice-controller'] = MultipleChoiceController;
