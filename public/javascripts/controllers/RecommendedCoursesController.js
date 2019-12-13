class RecommendedCoursesController extends Stimulus.Controller {
  connect() {
    const {
      map_of_course_id_and_title,
      map_of_first_lesson_id_and_course_title,
    } = this.element.dataset;
    this.map_of_course_id_and_title = map_of_course_id_and_title;
    this.map_of_first_lesson_id_and_course_title = map_of_first_lesson_id_and_course_title;
    const listOfCourseIdsAndTitles = JSON.parse(map_of_course_id_and_title);
    const listOfFirstLessonIdAndCourseTitles = JSON.parse(map_of_first_lesson_id_and_course_title);
    $('.inner-courses-card-shaded').click(async (clickedCard) => {
      const courseId = await listOfCourseIdsAndTitles[clickedCard.currentTarget.textContent];
      const lessonId = await listOfFirstLessonIdAndCourseTitles[clickedCard.currentTarget.textContent];
      Turbolinks.visit(`/courses/watching/${courseId}/${lessonId}`);
    });
    $('.upper-card-section').click(async (clickedIcon) => {
      const courseId = await listOfCourseIdsAndTitles[clickedIcon.currentTarget.firstChild.parentElement.childNodes[1].textContent];
      const lessonId = await listOfFirstLessonIdAndCourseTitles[clickedIcon.currentTarget.firstChild.parentElement.childNodes[1].textContent];
      Turbolinks.visit(`/courses/watching/${courseId}/${lessonId}`);
    });
  }
}

window.controllers = window.controllers || {};
window.controllers.recommendedcoursescontroller = RecommendedCoursesController;
