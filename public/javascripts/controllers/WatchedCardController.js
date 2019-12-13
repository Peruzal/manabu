class WatchedCardController extends Stimulus.Controller {
    connect() {
        $('.sidebar-heading')[0].style.display = 'none';
        $('.watched-card')[0].style.display = 'none';

        var completedCourses = JSON.parse($('.watched-card')[0].dataset.completedcourses);

        if(completedCourses.length >= 1){
            $('.sidebar-heading')[0].style.display = 'block';
            $('.watched-card')[0].style.display = 'block';
        }

        $('.watched-card .placeholder-icon').click(() => {
            const completedCourse = JSON.parse($('.watched-card-course')[0].dataset.completedcourse);
            const courses = JSON.parse($('.watched-card-course')[0].dataset.courses);
            for(let counter = 0; counter < courses.length; counter++){
                if(completedCourse.courseId == courses[counter].id){
                    Turbolinks.visit(`/courses/watching/${completedCourse.courseId}/${courses[counter].lessons[0].id}`);
                }
            }
        });        
    }
  
}
  
window.controllers = window.controllers || {};
window.controllers.watchedCardController = WatchedCardController;