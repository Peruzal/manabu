class LessonCategoryController extends Stimulus.Controller {
    connect() {
        closeLessonDropdowns();
        updateProgressIndicatorsOnlessons();
        openLessonDropdown();
        updateProgressIndicatorsOnLessonCategories();
        removelessonDropdownIfCategoriesDontExist();
        $('.lesson-category').click((lessonCategory) => {
            let angleIcon = lessonCategory.currentTarget.firstChild.childNodes[1];
            if (angleIcon.className == 'down-angle-icon') {
                closeLessonDropdowns();
                angleIcon.className = 'up-angle-icon';
                lessonCategory.currentTarget.nextSibling.style.display = 'block';
                lessonCategory.currentTarget.nextSibling.nextSibling.style.display = 'block';
            } else if (angleIcon.className == 'up-angle-icon') {
                closeLessonDropdowns();
                angleIcon.className = 'down-angle-icon';
            }
        });

        function openLessonDropdown(){
            const lesson = JSON.parse($('#courseAndLessonWrapper')[0].dataset.lesson);
            for(let counter = 0; counter < $('.lesson-container .row').length; counter++){
                let lessonContainerId = $('.lesson-container .row')[counter].dataset.lessonid;
                if(lesson.id == lessonContainerId){
                    $('.progress-indicator')[counter].style.backgroundColor = '#7acc91';
                    showEyeIcon($('.progress-indicator')[counter]);
                    $('.lesson-container .row')[counter].parentElement.parentElement.style.display = 'block';
                    $('.lesson-container .row')[counter].parentElement.parentElement.previousSibling.style.display = 'block';
                    $('.lesson-container .row')[counter].parentElement.parentElement.previousSibling.previousSibling.firstChild.childNodes[1].className = 'up-angle-icon';
                }
            }
        }
        
        function showEyeIcon(element){
            element.childNodes[0].style.display = 'none';
            element.childNodes[1].style.display = 'none';
            element.childNodes[2].style.display = 'none';
            element.childNodes[3].style.display = 'block';
        }

        function closeLessonDropdowns() {
            for (let counter = 0; counter < $('.orderby-section').length; counter++) {
                $('.orderby-section')[counter].style.display = 'none';
                $('.lessons-container')[counter].style.display = 'none';
                $('.lesson-category')[counter].firstChild.childNodes[1].className = 'down-angle-icon';
            }
        }

        function updateProgressIndicatorsOnLessonCategories() {
            const numberOfCategories = $('.lesson-category').length;
            const indicatorColors = [];
            for (let a = 0; a < numberOfCategories; a++) {
                let numberOfLessonsInACategory = $('.lessons-container')[a].childNodes.length;
                for (let b = 0; b < numberOfLessonsInACategory; b++) {
                    $(".lesson-category .row:eq(" + a + ")").append("<div class=\"progress-indicators\"></div>");
                    let indicatorColor = $('.lessons-container')[a].childNodes[b].firstChild.firstChild.style.backgroundColor;
                    indicatorColors.push(indicatorColor);
                }
            }
            for (let a = 0; a < indicatorColors.length; a++) {
                $(".lesson-category .row .progress-indicators")[a].style.backgroundColor = indicatorColors[a];
                $(".lesson-category .row .progress-indicators")[a].style.marginLeft = '4px';
            }
        }

        function updateProgressIndicatorsOnlessons() {
            const progressIndicators = $('.lesson-container .progress-indicator');
            for (let counter = 0; counter < progressIndicators.length; counter++) {
                const latestLessonProgress = progressIndicators[counter].dataset.latestlessonprogress;
                if (latestLessonProgress > 0.95) {
                    progressIndicators[counter].style.backgroundColor = '#dddddd';
                    progressIndicators[counter].childNodes[0].style.display = 'none';
                    progressIndicators[counter].childNodes[1].style.display = 'none';
                    progressIndicators[counter].childNodes[2].style.display = 'block';
                    progressIndicators[counter].childNodes[3].style.display = 'none';
                } else if (latestLessonProgress > 0 && latestLessonProgress < 0.95) {
                    progressIndicators[counter].style.backgroundColor = '#f5a538';
                    progressIndicators[counter].childNodes[0].style.display = 'block';
                    progressIndicators[counter].childNodes[1].style.display = 'none';
                    progressIndicators[counter].childNodes[2].style.display = 'none';
                    progressIndicators[counter].childNodes[3].style.display = 'none';
                } else {
                    progressIndicators[counter].style.backgroundColor = '#af144b';
                    progressIndicators[counter].childNodes[0].style.display = 'none';
                    progressIndicators[counter].childNodes[1].style.display = 'block';
                    progressIndicators[counter].childNodes[2].style.display = 'none';
                    progressIndicators[counter].childNodes[3].style.display = 'none';
                }
            }
        }

        function updateGreenIndicatorOnLessonCategory() {
            const numberOfCategories = $('.lesson-category').length;
            const indicatorColors = [];
            for (let a = 0; a < numberOfCategories; a++) {
                let numberOfLessonsInACategory = $('.lessons-container')[a].childNodes.length;
                for (let b = 0; b < numberOfLessonsInACategory; b++) {
                    let indicatorColor = $('.lessons-container')[a].childNodes[b].firstChild.firstChild.style.backgroundColor;
                    indicatorColors.push(indicatorColor);
                }
            }
            for (let a = 0; a < indicatorColors.length; a++) {
                $(".lesson-category .row .progress-indicators")[a].style.backgroundColor = indicatorColors[a];
                $(".lesson-category .row .progress-indicators")[a].style.marginLeft = '4px';
            }
        }

        $('.lesson-container .row').click((clickedLesson) => {
            updateProgressIndicatorsOnlessons();
            clickedLesson.currentTarget.firstChild.style.backgroundColor = '#7acc91';
            clickedLesson.currentTarget.firstChild.childNodes[0].style.display = 'none';
            clickedLesson.currentTarget.firstChild.childNodes[1].style.display = 'none';
            clickedLesson.currentTarget.firstChild.childNodes[2].style.display = 'none';
            clickedLesson.currentTarget.firstChild.childNodes[3].style.display = 'block';
            updateGreenIndicatorOnLessonCategory();
            showCourseInfoOnVideo();
        });

        let video = $("#video")[0];
        video.onplay = function () {
            hideCourseInfoOnVideo();
        };
        video.onpause = function () {
            showCourseInfoOnVideo();
        };

        function hideCourseInfoOnVideo() {
            $('#playIconOnVideoPause')[0].style.display = 'none';
            $('#courseLogo')[0].style.display = 'none';
            $('#courseAndLessonInfoWithAuthorWrapper')[0].style.display = 'none';
        }
        function showCourseInfoOnVideo() {
            if($('#playIconOnVideoPause')[0]) {
                $('#playIconOnVideoPause')[0].style.display = 'block';
                $('#courseLogo')[0].style.display = 'block';
                $('#courseAndLessonInfoWithAuthorWrapper')[0].style.display = 'flex';
            }
        }
        
        function removelessonDropdownIfCategoriesDontExist(){
            let courseCategory = $('.lesson-category')[0].dataset.coursecategory;
            if(courseCategory == undefined || courseCategory == ''){
                $('.lesson-category')[0].style.display = 'none';
                $('.orderby-section')[0].style.display = 'block';
                $('.lessons-container')[0].style.display = 'block';
            }
        }
    }

}
window.controllers = window.controllers || {};
window.controllers.lessonCategoryController = LessonCategoryController;