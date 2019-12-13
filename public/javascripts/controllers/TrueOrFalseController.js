class TrueOrFalseController extends Stimulus.Controller {
  connect() {
    $('.test-progress#trueOrFalseTestProgress').click((e) => {
      e.stopPropagation();
      const {
        trueOrFalseQuiz,
        courseId,
        lessonId,
        lessons,
      } = e.currentTarget.dataset;
      this.trueOrFalseQuiz = trueOrFalseQuiz;
      this.courseId = courseId;
      this.lessonId = lessonId;
      this.lessons = lessons;
      $('#true-or-false-modal.modal').modal('toggle');
    });

    function enableTrueOrFalseButton() {
      $('#submitTrueOrFalseButton').prop('disabled', false);
      $('#submitTrueOrFalseButton')[0].style.color = '#f28f06';
      $('#submitTrueOrFalseButton')[0].style.backgroundColor = 'white';
      $('#submitTrueOrFalseButton')[0].style.cursor = 'pointer';
      $('#submitTrueOrFalseButton')[0].style.border = 'solid 1px #f28f06';
    }

    $('#true-or-false-modal.modal').on('show.bs.modal', () => {
      let trueOrFalseAnswerSubmittedByUser = 'false';
      const trueOrFalse = JSON.parse(this.trueOrFalseQuiz);
      const currentLessonId = this.lessonId;
      const courseId = this.courseId;
      const lessonsOfCourse = JSON.parse(this.lessons);
      $('#trueOrFalseStatement')[0].textContent = trueOrFalse[0].statement;

      $('#trueOption').change(() => {
        enableTrueOrFalseButton();
      });

      $('#falseOption').change(() => {
        enableTrueOrFalseButton();
      });

      $('#submitTrueOrFalseButton').click(() => {
        if ($('#trueOption')[0].checked) {
          trueOrFalseAnswerSubmittedByUser = 'true';
        }
        if ($('#falseOption')[0].checked) {
          trueOrFalseAnswerSubmittedByUser = 'false';
        }
        if (trueOrFalseAnswerSubmittedByUser === trueOrFalse[0].answer) {
          $('#trueOrFalseOptionsWrapper')[0].style.display = 'none';
          $('#trueOrFalseCorrectAnswer')[0].style.display = 'block';
          $('#trueOrFalseIncorrectAnswer')[0].style.display = 'none';
          $('#submitTrueOrFalseButton')[0].style.display = 'none';
          $('#continueTrueOrFalseButton')[0].style.display = 'block';
          $('#tryAgainTrueOrFalseButton')[0].style.display = 'none';
        } else {
          $('#trueOrFalseOptionsWrapper')[0].style.display = 'none';
          $('#trueOrFalseCorrectAnswer')[0].style.display = 'none';
          $('#trueOrFalseIncorrectAnswer')[0].style.display = 'block';
          $('#submitTrueOrFalseButton')[0].style.display = 'none';
          $('#tryAgainTrueOrFalseButton')[0].style.display = 'block';
          $('#continueTrueOrFalseButton')[0].style.display = 'none';
        }
      });

      $('#continueTrueOrFalseButton').click(() => {
        let nextLessonId = currentLessonId;
        for (let i = 0; i < lessonsOfCourse.length; i++) {
          if (lessonsOfCourse[i].id === currentLessonId) {
            nextLessonId = lessonsOfCourse[i + 1].id;
          }
        }
        Turbolinks.visit(`/courses/watching/${courseId}/${nextLessonId}`);
      });

      $('#tryAgainTrueOrFalseButton').click(() => {
        $('#trueOrFalseOptionsWrapper')[0].style.display = 'block';
        $('#trueOrFalseCorrectAnswer')[0].style.display = 'none';
        $('#trueOrFalseIncorrectAnswer')[0].style.display = 'none';
        $('#submitTrueOrFalseButton')[0].style.display = 'block';
        $('#continueTrueOrFalseButton')[0].style.display = 'none';
        $('#tryAgainTrueOrFalseButton')[0].style.display = 'none';
      });
    });
  }
}

window.controllers = window.controllers || {};
window.controllers['true-or-false-controller'] = TrueOrFalseController;
