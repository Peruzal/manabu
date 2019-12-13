class AdminNavButtonsController extends Stimulus.Controller {
    connect() {
        $('#archivedCoursesByUser')[0].style.display = 'none';
        const numberOfArchivedCourses = $('.courseArchivedByUser').length;
        const numberOfActiveCourses = $('.activeCourses').length;
        $('#archive').click(function() {

            switch($('#archivedCoursesByUser')[0].style.display) {
              case 'none':
                $('#archivedCoursesByUser')[0].style.display = 'block';
                $('#coursesAuthoredByUserWrapper')[0].style.display = 'none';
                $(this).children('.archive-text')[0].textContent = 'Active courses ('+numberOfActiveCourses+')';
              break;
              case 'block':
                $('#coursesAuthoredByUserWrapper')[0].style.display = 'block';
                $('#archivedCoursesByUser')[0].style.display = 'none';
                $(this).children('.archive-text')[0].textContent = 'Archive ('+numberOfArchivedCourses+')';
              break;
            }
        });

        $('.manageCourseNav').click((clickedButton) => {
            switch (JSON.parse(clickedButton.currentTarget.dataset.ordernumber)) {
                case 1:
                    let firstBarCaseOne = $('.manageCourseNav')[1].childNodes[1].textContent;
                    let firstIconCaseOne = $('.manageCourseNav')[1].childNodes[0].childNodes[0].className;

                    let secondBarCaseOne = $('.manageCourseNav')[2].childNodes[1].textContent;
                    let secondIconCaseOne = $('.manageCourseNav')[2].childNodes[0].childNodes[0].className;

                    let thirdBarCaseOne = $('.manageCourseNav')[0].childNodes[1].textContent;
                    let thirdIconCaseOne = $('.manageCourseNav')[0].childNodes[0].childNodes[0].className;

                    $('.manageCourseNav')[0].childNodes[1].textContent = firstBarCaseOne;
                    $('.manageCourseNav')[0].childNodes[0].childNodes[0].className = firstIconCaseOne;

                    $('.manageCourseNav')[1].childNodes[1].textContent = secondBarCaseOne;
                    $('.manageCourseNav')[1].childNodes[0].childNodes[0].className = secondIconCaseOne;

                    $('.manageCourseNav')[2].childNodes[1].textContent = thirdBarCaseOne;
                    $('.manageCourseNav')[2].childNodes[0].childNodes[0].className = thirdIconCaseOne;
                    break;
                case 2:
                    let firstBarCaseTwo = $('.manageCourseNav')[2].childNodes[1].textContent;
                    let firstIconCaseTwo = $('.manageCourseNav')[2].childNodes[0].childNodes[0].className;

                    let secondBarCaseTwo = $('.manageCourseNav')[1].childNodes[1].textContent;
                    let secondIconCaseTwo = $('.manageCourseNav')[1].childNodes[0].childNodes[0].className;

                    let thirdBarCaseTwo = $('.manageCourseNav')[0].childNodes[1].textContent;
                    let thirdIconCaseTwo = $('.manageCourseNav')[0].childNodes[0].childNodes[0].className;

                    $('.manageCourseNav')[0].childNodes[1].textContent = firstBarCaseTwo;
                    $('.manageCourseNav')[0].childNodes[0].childNodes[0].className = firstIconCaseTwo;

                    $('.manageCourseNav')[1].childNodes[1].textContent = secondBarCaseTwo;
                    $('.manageCourseNav')[1].childNodes[0].childNodes[0].className = secondIconCaseTwo;

                    $('.manageCourseNav')[2].childNodes[1].textContent = thirdBarCaseTwo;
                    $('.manageCourseNav')[2].childNodes[0].childNodes[0].className = thirdIconCaseTwo;
                    break;
            }
        });
    }

}

window.controllers = window.controllers || {};
window.controllers.adminNavButtonsController = AdminNavButtonsController;
