class ChangeCourseIconController extends Stimulus.Controller {
    connect() {

        $('#admin-change-course-icon-modal,#admin-add-course-modal .dropdown-item').click(function (clickedElement) {
            $(this).parent('.dropdown-menu').siblings('.dropdown').children('.select-one-text')[0].textContent = clickedElement.currentTarget.textContent;
            const iconsToChooseFrom = $(this).parents('.dropdown-menu').siblings('.icons-to-choose-from');
            const imageIcon = $(this).parents('.dropdown-menu').siblings('.icons-to-choose-from').children('.row-of-images').children('.image-icon');
            const rowOfImages = $(this).parents('.dropdown-menu').siblings('.icons-to-choose-from').children('.row-of-images');
            iconsToChooseFrom[0].style.display = 'block';
            imageIcon.remove();
            $.ajax({
                url: `/admin/courseIconsBasedOnChosenCategories/${clickedElement.currentTarget.textContent}`,
                type: 'GET',
            })
                .done((images) => {
                    for(let counter = 0; counter < images.length; counter++) {
                        rowOfImages.append(`
                        <div class=\'image-icon\'
                        chosen=\'false\'\
                        data-imageSource=\'${images[counter].source}\'
                        data-category=\'${images[counter].category}\'>

                        <img src='${images[counter].source}'>
                        
                        </div>`);
                    }
                })
                .fail(() => {
                    console.error('request to view course');
                });
        });

        $('.row-of-images').on('click','.image-icon',(clickedElement) => {
            for(let counter = 0; counter < $('.image-icon').length; counter++) {
                $('.image-icon')[counter].style.border = '';
            }
            clickedElement.currentTarget.style.border = '3px solid #0068c1';
            $('#change-course-icon')[0].className = 'btn create-course-button';
        });

        $('#admin-change-course-icon-modal').on('shown.bs.modal	', function (elementEvent) {
            const courseId = elementEvent.relatedTarget.dataset.courseid;
            $('#change-course-icon').click((clickedElement) => {
                switch(clickedElement.currentTarget.className) {
                    case 'btn create-course-button':
                        for(let counter = 0; counter < $('.image-icon').length; counter++) {
                            switch($('.image-icon')[counter].style.border) {
                                case '3px solid rgb(0, 104, 193)':
                                    $.ajax({
                                        url: '/admin/updateCourseIcon',
                                        type: 'PUT',
                                        contentType: 'application/json; charset=utf-8',
                                        dataType: 'json',
                                        data: JSON.stringify({
                                            courseId: courseId,
                                            image: $('.image-icon')[counter].children[0].src,
                                        }),
                                    })
                                    .done(() => {
                                        Turbolinks.visit('/admin/home');
                                    })
                                    .fail(() => {
                                        console.error('request to change course icon was not sent successfully');
                                    });
                                break;
                            }
                        }
                    break;
                }
            });
        });

    }

}

window.controllers = window.controllers || {};
window.controllers.changeCourseIconController = ChangeCourseIconController;