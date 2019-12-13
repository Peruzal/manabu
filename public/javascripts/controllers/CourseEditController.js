class CourseEditController extends Stimulus.Controller {
    connect() {
        this.$modal = $('#edit-course-modal.modal');
        const {
            course,
        } = this.element.dataset;

        $('.alert.alert-danger').hide();

        this.course = course;

        $('.modify-lesson-icon').hover((hoveredElement) => {
            hoveredElement.currentTarget.previousElementSibling.style.display = 'block';
          }, (hoveredElement) => {
            hoveredElement.currentTarget.previousElementSibling.style.display = 'none';
        });

        $('.editCourseButton').click(function(clickedIcon) {
            const archiveOrMoveButton = $(this).siblings('.archiveCourseButton')[0];
            let editCourseTitleIcon = $(this).closest('#courseButtonsWrapper').siblings('.edit-course-title-icon-container')[0];
            switch(clickedIcon.currentTarget.firstChild.className) {
                case 'writing-pencil-icon':
                    if (course === undefined) {
                        for(let counter = 0; counter < $('.editCourseWrapper').length; counter++) {
                            $('.editCourseWrapper')[counter].style.display = 'none';
                            $('.editCourseButton')[counter].firstChild.className = 'writing-pencil-icon';
                            $('.edit-course-title-icon-container')[counter].style.display = 'none';
                            $('.edit-course-title-icon-container')[counter].firstChild.className = 'writing-pencil-icon';
                            $('input.course-title')[counter].disabled = true;
                            $('.archiveCourseButton')[counter].style.visibility = 'hidden';
                        }
                    } else {
                        for(let counter = 0; counter < $('.editCourseWrapper').length; counter++) {
                            $('.editCourseWrapper')[counter].style.display = 'none';
                            $('.editCourseButton')[counter].firstChild.className = 'writing-pencil-icon';
                            $('.edit-course-title-icon-container')[counter].style.display = 'none';
                            $('.edit-course-title-icon-container')[counter].firstChild.className = 'writing-pencil-icon';
                            $('input.course-title')[counter].disabled = true;
                            $('.editLessonIconsToolbar')[counter].style.visibility = 'hidden';
                            $('.editLessonIcon')[counter].firstChild.className = 'writing-pencil-icon';
                            $('input.nameOfLesson')[counter].disabled = true;
                        }
                    }
                    editCourseTitleIcon.style.display = 'block';
                    archiveOrMoveButton.style.visibility = 'visible';
                break;
                case 'filled-pencil-icon':
                    editCourseTitleIcon.style.display = 'none';
                    archiveOrMoveButton.style.visibility = 'hidden';
                break;
            }
        });

        $('.edit-course-title-icon-container').click(function(clickedIcon) {
            switch(clickedIcon.currentTarget.firstChild.className) {
                case 'writing-pencil-icon':
                    clickedIcon.currentTarget.firstChild.className = 'filled-pencil-icon';
                    $(this).siblings('.course-title')[0].disabled = false;
                    $(this).siblings('.course-title')[0].focus();
                break;
                case 'filled-pencil-icon':
                    clickedIcon.currentTarget.firstChild.className = 'writing-pencil-icon';
                    $(this).siblings('.course-title')[0].disabled = true;
                    let newCourseTitle = $(this).siblings('.course-title')[0].value;
                    let course = JSON.parse($(this).siblings('.course-title')[0].dataset.course);
                    $.ajax({
                        url: '/admin/updateCourseTitle',
                        type: 'PUT',
                        contentType: 'application/json; charset=utf-8',
                        dataType: 'json',
                        data: JSON.stringify({
                            title:  newCourseTitle,
                            description: course.description,
                            courseId: course.id,
                            image: course.image
                        }),
                    })
                    .done(() => {
                        console.log('request to update course title was sent successfully');
                    })
                    .fail(() => {
                        console.error('request to update course title was not sent successfully');
                    });
                break;
            }
        });


        $('.image-upload').change(function () {
            const formData = new FormData();
            const file = $(this)[0].files[0];
            const courseId = $(this)[0].dataset.courseid;
            formData.append('image-clip', file, 'image-clip');

            axios({
                method: 'POST',
                url: `/admin/${courseId}/upload`,
                data: formData,
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'multipart/form-data',
                }})
                .then(() => {
                    location.reload(true);
                })
                .catch(() => {
                    console.log('request to upload file was not sent successfully');
                    final();
            });
        });
    }

    editcourse(){

            $.ajax({
                url: '/admin/index/update',
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                data: JSON.stringify({
                    title: $('#titleEdit').val(),
                    description: CKEDITOR.instances.descriptionEdit.getData(),
                    courseId: JSON.parse(this.course).id,
                }),
            })
                .done(() => {

                        const $imageclip = $(this.element).find('#image-clip');

                        const formData = new FormData();
                        const file = $imageclip[0];

                        const courseId = JSON.parse(this.course).id;
                        formData.append('image-clip', file.files[0], 'image-clip');

                        axios({
                        method: 'POST',
                        url: `/admin/${courseId}/upload`,
                        data: formData,
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'multipart/form-data',
                        },
                        })
                        .then(() => {
                            console.log('success');
                        })
                        .catch(() => {
                            console.log('fail');
                        });

                    Turbolinks.visit(`/admin/${courseId}`);

                    setTimeout(()=>{
                        location.reload(true);
                    },500);

                })
                .fail(() => {
                    console.error('Could not Edit the course');
                });
     
    }

    
}

window.controllers = window.controllers || {};
window.controllers.courseedit = CourseEditController;