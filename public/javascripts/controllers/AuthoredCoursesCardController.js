class AuthoredCoursesCardController extends Stimulus.Controller {
    connect() {
        hideAuthoredCardDropDown();
        hideAuthoredCourses();
        function hideAuthoredCardDropDown() {
            const numberOfAuthoredCourses = $('.authored-courses-card-course-container').length;
            if (numberOfAuthoredCourses > 3) {
                $('.authored-courses-card .dropdown-container')[0].style.display = 'display';
            } else {
                $('.authored-courses-card .dropdown-container')[0].style.display = 'none';
            }
        }

        function hideAuthoredCourses() {
            const numberOfAuthoredCourses = $('.authored-courses-card-course-container').length;
            for(let counter = 0; counter < numberOfAuthoredCourses; counter++){
                if(counter > 2){
                    $('.authored-courses-card-course-container')[counter].style.display = 'none';
                }
            }
        }

        function showAuthoredCourses() {
            const numberOfAuthoredCourses = $('.authored-courses-card-course-container').length;
            for(let counter = 0; counter < numberOfAuthoredCourses; counter++){
                if(counter > 2){
                    $('.authored-courses-card-course-container')[counter].style.display = 'block';
                }
            }
        }

        $('#watching-triangle-icon').click((clickedIcon) => {
            let clickedIconClass = clickedIcon.currentTarget.className;
            switch(clickedIconClass){
                case 'down-facing-triangle-icon':
                clickedIcon.currentTarget.className = 'up-facing-triangle-icon';
                showAuthoredCourses();
                break;
                case 'up-facing-triangle-icon':
                clickedIcon.currentTarget.className = 'down-facing-triangle-icon';
                hideAuthoredCourses();
                break;
            }
        });

        $('#watching-triangle-icon').hover((hoveredIcon) => {
            let hoveredIconClass = hoveredIcon.currentTarget.className;
            switch(hoveredIconClass) {
                case 'down-facing-triangle-icon':
                    hoveredIcon.currentTarget.previousElementSibling.childNodes[0].textContent = 'More';
                break;
                case 'up-facing-triangle-icon':
                    hoveredIcon.currentTarget.previousElementSibling.childNodes[0].textContent = 'Less';
                break;
            }
            hoveredIcon.currentTarget.previousElementSibling.style.display = 'block';
        }, (hoveredIcon) => {
            hoveredIcon.currentTarget.previousElementSibling.style.display = 'none';
        });

        $('.edit-icon').hover((editIcon) => {
            editIcon.currentTarget.previousElementSibling.style.display = 'block';
        },
        (editIcon) => {
            editIcon.currentTarget.previousElementSibling.style.display = 'none';
        });

        $('.authored-courses-card .more-options-icon').hover((moreOptionsIcon) => {
            moreOptionsIcon.currentTarget.previousElementSibling.style.display = 'block';
        },
        (moreOptionsIcon) => {
            moreOptionsIcon.currentTarget.previousElementSibling.style.display = 'none';
        });

    }

}

window.controllers = window.controllers || {};
window.controllers.authoredCoursesCardController = AuthoredCoursesCardController;