class Favourite extends Stimulus.Controller {
    connect() {
        updateFavouriteCourseIcon();
        $('.favourite-course').click((clickedIcon) => {
            let courseId = clickedIcon.currentTarget.dataset.courseid;
            $.ajax({
                url: `/courses/favourite`,
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                data: JSON.stringify({
                    courseId: courseId,
                }),
            })
                .done((updatedRatingStatus) => {
                    switch (updatedRatingStatus.status) {
                        case 0:
                            for (let counter = 0; counter < $('.favourite-course').length; counter++) {
                                let courseId = $('.favourite-course')[counter].dataset.courseid;
                                if (courseId == updatedRatingStatus.courseId) {
                                    $('.favourite-course')[counter].className = 'star-icon-for-favourites favourite-course';
                                    $('.favourite-course')[counter].style.color = '#524A4A';
                                    $('.favourite-course')[counter].dataset.status = 0;
                                }
                            }
                            if(parseInt($('.profileStats .favouriteCourses')[0].textContent) < 10){
                                let numberOfFavouritesCourses = parseInt($('.profileStats .favouriteCourses')[0].textContent);
                                numberOfFavouritesCourses--;
                                $('.profileStats .favouriteCourses')[0].textContent = '0'+numberOfFavouritesCourses;
                            } else {
                                let numberOfFavouritesCourses = parseInt($('.profileStats .favouriteCourses')[0].textContent);
                                numberOfFavouritesCourses--;
                                $('.profileStats .favouriteCourses')[0].textContent = numberOfFavouritesCourses;
                            }
                            break;
                        case 1:
                            for (let counter = 0; counter < $('.favourite-course').length; counter++) {
                                let courseId = $('.favourite-course')[counter].dataset.courseid;
                                if (courseId == updatedRatingStatus.courseId) {
                                    $('.favourite-course')[counter].className = 'filled-star-icon favourite-course';
                                    $('.favourite-course')[counter].style.color = '#f8c782';
                                    $('.favourite-course')[counter].dataset.status = 1;                                
                                }
                            }
                            if(parseInt($('.profileStats .favouriteCourses')[0].textContent) < 10){
                                let numberOfFavouritesCourses = parseInt($('.profileStats .favouriteCourses')[0].textContent);
                                numberOfFavouritesCourses++;
                                $('.profileStats .favouriteCourses')[0].textContent = '0'+numberOfFavouritesCourses;
                            } else {
                                let numberOfFavouritesCourses = parseInt($('.profileStats .favouriteCourses')[0].textContent);
                                numberOfFavouritesCourses++;
                                $('.profileStats .favouriteCourses')[0].textContent = numberOfFavouritesCourses;
                            }    
                            break;
                    }
                })
                .fail(() => {
                    console.log('request was not sent successfully');
                });
        });

        function updateFavouriteCourseIcon() {
            $.ajax({
                url: `/getFavouriteCourses`,
                type: 'GET',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
            })
                .done((favouriteCourses) => {
                    updateNumberOfFavouriteCoursesOnProfileCard(favouriteCourses);
                    favouriteCourses.forEach((favouriteCourse) => {
                        if (favouriteCourse.status == 1) {
                            for (let counter = 0; counter < $('.favourite-course').length; counter++) {
                                if (favouriteCourse.courseId == $('.favourite-course')[counter].dataset.courseid) {
                                    $('.favourite-course')[counter].className = 'filled-star-icon favourite-course';
                                    $('.favourite-course')[counter].style.color = '#f8c782';
                                    $('.favourite-course')[counter].dataset.status = 1;
                                }
                            }
                        }
                    });
                })
                .fail(() => {
                    console.log('request was not sent successfully');
                });
        }

        function updateNumberOfFavouriteCoursesOnProfileCard(favouriteCourses) {
            let numberOfFavouriteCourses = 0;
            favouriteCourses.forEach((favouriteCourse) => {
                if(favouriteCourse.status == 1){
                    numberOfFavouriteCourses++;
                }
            });

            if(numberOfFavouriteCourses < 10){
                $('.profileStats .favouriteCourses')[0].textContent = '0'+numberOfFavouriteCourses;
            } else {
                $('.profileStats .favouriteCourses')[0].textContent = numberOfFavouriteCourses;
            }
        }
    }

}

window.controllers = window.controllers || {};
window.controllers.favourite = Favourite;