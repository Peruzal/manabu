class CourseStatisticsController extends Stimulus.Controller {
  connect() {
    function getUserDetailsForCourses(courseTitle) {
      $.ajax({
        url: `/admin/userDetailsForCourse/${courseTitle}`,
        type: 'GET',
      })
        .done((res) => {
          $.each(res, (index) => {
            $('.user-progress-data').append(`
            <div class="user-progress-row">
              <div class="user-status-container">
                <div class="user-status-indicator"></div>
                <div class="user-status-text">${res[index].status}</div>
              </div>
              <div class="user-name-container">
                <div class="user-name-text">${res[index].name}</div>
              </div>
              <div class="user-surname-container">
                <div class="user-surname-text">${res[index].surname}</div>
              </div>
              <div class="user-enrolled-container">
                <div class="user-enrolled-text">${res[index].enrolled}</div>
              </div>
              <div class="user-last-access-container">
                <div class="user-last-access-text">${res[index].lastAccess}</div>
              </div>
              <div class="user-progress-container">
                <div class="user-not-started-progress-bar" style="width: ${res[index].incompleteLessonsPercentage}%;">
                  <div class="user-incomplete-progress-bar-text">${res[index].incompleteLessons} videos</div>
                </div>
                <div class="user-in-progress-progress-bar"></div>
                <div class="user-complete-progress-bar" style="width: ${res[index].completedLessonsPercentage}%;">
                  <div class="user-complete-progress-bar-text">${res[index].completedLessons} videos</div>
                </div>
              </div>
              <div class="user-quizzes-container">
                <div class="user-quizzes-text">0/${res[index].numberOfQuizzes}</div>
              </div>
              <div class="user-actions-container">
                <div id="informationIconWrapper">
                  <div class="information-icon"></div>
                </div>
                <div id="messageIconWrapper">
                  <div class="message-icon"></div>
                </div>
                <div id="alertIconWrapper">
                  <div class="ringing-bell-icon"></div>
                </div>
                <div id="deleteIconWrapper">
                  <div class="send-course-to-archive-icon"></div>
                </div>
              </div>
            </div>
              `);
          });
        })
        .fail(() => {
          console.error('Something went wrong while sending request to get user details regarding the course');
        });
    }

    $('.view-stats-arrow .down-angle-icon').click((e) => {
      $('.user-progress-data .user-progress-row').detach();
      for (let counter = 0; counter < $('.track-user-progress-container').length; counter++) {
        $('.track-user-progress-container')[counter].style.display = 'none';
        $('.down-angle-icon')[counter].style.display = 'block';
        $('.up-angle-icon')[counter].style.display = 'none';
      }
      $('.loader').show();
      const $userContainer = e.currentTarget.parentElement.parentElement.nextElementSibling;
      const $userData = $userContainer.childNodes[2];
      const course = e.currentTarget.parentElement.parentElement;
      const courseTitle = course.childNodes[3].textContent;
      const $downwardArrow = e.currentTarget;
      const $upwardArrow = $downwardArrow.parentElement.nextElementSibling;
      $userContainer.style.display = 'block';
      $downwardArrow.style.display = 'none';
      $upwardArrow.firstElementChild.style.display = 'block';
      getUserDetailsForCourses(courseTitle);
      $('body').on('DOMSubtreeModified', $userData, () => {
        $('.loader').hide();
      });
    });

    $('.view-stats-arrow .up-angle-icon').click((e) => {
      const $userContainer = e.currentTarget.parentElement.parentElement.nextElementSibling;
      const $upwardArrow = e.currentTarget;
      const $downwardArrow = $upwardArrow.parentElement.previousElementSibling;
      const $loader = $userContainer.childNodes[2].firstElementChild;
      $('.user-progress-data').empty().append($loader);
      $userContainer.style.display = 'none';
      $upwardArrow.style.display = 'none';
      $downwardArrow.firstElementChild.style.display = 'block';
    });

    $('#courseAnalysisPage .courseAuthoredByUser')[0].style.borderTop = '2px solid white';
  }
}

window.controllers = window.controllers || {};
window.controllers['course-statistics-controller'] = CourseStatisticsController;
