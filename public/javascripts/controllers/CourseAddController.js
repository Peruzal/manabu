class CourseAddController extends Stimulus.Controller {
    connect() {

        $( ".right-angle-icon" ).click(function() {
            $( ".row-of-images" ).animate({scrollLeft: '+=72'}, 500)
        });

        $( ".left-angle-icon" ).click(function() {
            $( ".row-of-images" ).animate({scrollLeft: '-=72'}, 500)
        });

        $('textarea').keyup(() => {
            $('.courseDescriptionCharacterCounter span#remainingCharacters')[0].textContent = 
            250 - parseInt($('textarea.courseDescriptionTextarea')[0].value.length, 10);
        });

        $('.dropdown-item').click((clickedElement) => {
            $('.dropdown .select-one-text')[0].textContent = clickedElement.currentTarget.textContent;
        });

        $('.image-icon').click((clickedElement) => {
            for(let counter = 0; counter < $('.image-icon').length; counter++){
                $('.image-icon')[counter].style.border = '';
            }
            clickedElement.currentTarget.style.border = '3px solid #0068c1';
        });

        $('.image-icon').click((clickedElement) => {
            for(let counter = 0; counter < $('.image-icon').length; counter++){
                $('.image-icon')[counter].attributes[1].value = 'false';
            }
            clickedElement.currentTarget.attributes[1].value = 'true';
        });

        $('.create-course-button').hover(function () {
            switch($(this)[0].className) {
                case 'btn create-course-button':
                    $(this)[0].style.color = 'white';
                    $(this)[0].style.backgroundColor = '#f28f06';
                    $(this)[0].style.cursor = 'pointer';
                    $(this)[0].style.border = '1px solid #f28f06';
                break;
            }
        }, function () {
            switch($(this)[0].className) {
                case 'btn create-course-button':
                    $(this)[0].style.color = '#f28f06';
                    $(this)[0].style.backgroundColor = 'white';
                    $(this)[0].style.cursor = 'pointer';
                    $(this)[0].style.border = 'solid 1px #f28f06';
                break;
            }
        });

        $('input').keyup(function () {
            ableOrDiableCreateCourseButton();
        });

        $('textarea').keyup(function () {
            ableOrDiableCreateCourseButton();
        });

        function ableOrDiableCreateCourseButton() {
            const courseTitle = $('input#adminCourseTitle').val();
            const courseDescription = $('textarea.courseDescriptionTextarea').val();
            $('.alert.alert-danger').hide();
            switch(courseTitle.trim().length * courseDescription.trim().length){
                case 0:
                    $('.create-course-button')[0].className = 'btn create-course-button disabled-button';
                    $('.create-course-button')[0].style.color = '#bbbbbb';
                    $('.create-course-button')[0].style.backgroundColor = 'white';
                    $('.create-course-button')[0].style.cursor = 'pointer';
                    $('.create-course-button')[0].style.border = 'solid 1px #bbbbbb';
                break;
                default:
                    $('.create-course-button')[0].className = 'btn create-course-button';
                    $('.create-course-button')[0].style.color = '#f28f06';
                    $('.create-course-button')[0].style.backgroundColor = 'white';
                    $('.create-course-button')[0].style.cursor = 'pointer';
                    $('.create-course-button')[0].style.border = 'solid 1px #f28f06';
            }
        }

        $('#create-course-button').click(function () {
            switch($(this)[0].className) {
                case 'btn create-course-button':
                    const courseTitle = $('input#adminCourseTitle')[0].value;
                    const courseDescription = $('.courseDescription  textarea.courseDescriptionTextarea')[0].value;
                    let courseImage = '';
                    for(let counter = 0; counter < $('.image-icon').length; counter++) {
                        switch($('.image-icon')[counter].style.border) {
                            case '3px solid rgb(0, 104, 193)':
                            courseImage = $('.image-icon')[counter].children[0].src;
                            break;
                        }
                    }
        
                    $.ajax({
                        url: '/admin/index',
                        type: 'POST',
                        contentType: 'application/json; charset=utf-8',
                        dataType: 'json',
                        data: JSON.stringify({
                            title: courseTitle,
                            description: courseDescription,
                            imageName: courseImage,
                        }),
                    })
                    .done((response) => {
                        switch(response.courseTitleExists) {
                            case true:
                                $('.alert.alert-danger').show();
                            break;
                            case false:
                                Turbolinks.visit('/admin/home');
                            break;
                        }
                    })
                    .fail(() => {
                        console.error('request to create course was not sent successfully');
                    });
                break;
            }


        });

        const {
            courses,
        } = this.element.dataset;

        $('.alert.alert-danger').hide();


        $("#mouse").click(function(){
            $("#demo").val("http://localhost:3005/uploads/IMG-20190116-WA0001.jpg");
              $('.selected').removeClass('selected');
                $(this).addClass('selected');
        });

        $("#laptop").click(function(){
            $("#demo").val("http://localhost:3005/uploads/IMG-20190116-WA0002.jpg");
                $('.selected').removeClass('selected');
                    $(this).addClass('selected');
        });

        $("#grad").click(function(){
            $("#demo").val("http://localhost:3005/uploads/IMG-20190116-WA0003.jpg");
                $('.selected').removeClass('selected');
                    $(this).addClass('selected');
        });

        $('#add-course-modal').on('hidden.bs.modal', (event) => {
            $('.alert.alert-danger').hide();
        });

    }

        submit() {    
        
        
        const title = $('#title').val();
        let courseAlreadyExist = false;

        this.courses.forEach((course) => {
                if (course.title == title && course.isDeleted==0) {
                    courseAlreadyExist = true;
                }
        });

        if (courseAlreadyExist) {
            $('.alert.alert-danger').show();
        } else {
            $.ajax({
                url: '/admin/index',
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                data: JSON.stringify({
                    title: $('#title').val(),
                    description: CKEDITOR.instances.description.getData(),
                    imageName: "",
                }),
            })
                .done((course) => {

                        const $imageclip = $(this.element).find('#image-clip');

                        const formData = new FormData();
                        const file = $imageclip[0];

                        const courseId = course.id;
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
                            $successAlert.removeClass('d-none');
                            final();
                        })
                        .catch(() => {
                            $errorAlert.removeClass('d-none');
                            final();
                        });
                    
                    Turbolinks.visit(`/admin/${course.id}`);

                    setTimeout(()=>{
                        location.reload(true);
                    },500);

                })
                .fail(() => {
                    console.error('Could not add the course');
                });
        }

    }

    
}

window.controllers = window.controllers || {};
window.controllers.courseadd = CourseAddController;