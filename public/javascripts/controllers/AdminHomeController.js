class AdminHomeController extends Stimulus.Controller {
  openSidebar() {
    const adminHomePageWidthWhenSidebarOpen = (Number(document.getElementById('adminHomePage').offsetWidth) - 296) / 16;
    document.getElementById('adminSidebar').style.width = '20.25rem';
    document.getElementById('adminHomePage').style.width = `${adminHomePageWidthWhenSidebarOpen}rem`;
  }
  closeSidebar() {
    document.getElementById('adminSidebar').style.width = '1.5rem';
    document.getElementById('adminHomePage').style.width = '100%';
  }
  toggleSidebar() {
    const sidebarSize = document.getElementById('adminSidebar').style.width;
    if (sidebarSize === '20.25rem') {
      return this.closeSidebar();
    }
    return this.openSidebar();
  }

  connect() {
    function getDurationOfLesson(durationInSeconds) {
      let durationOfLesson = 0;
      if (durationInSeconds < 60) {
        durationOfLesson = `00:${durationInSeconds}`;
      } else if (durationInSeconds > 60 && durationInSeconds < 3600) {
        const minutes = parseInt(durationInSeconds / 60, 10);
        const seconds = durationInSeconds % 60;
        durationOfLesson = `${minutes}:${seconds}`;
      } else {
        const hours = parseInt(durationInSeconds / 3600, 10);
        const minutes = parseInt((durationInSeconds % 3600) / 60, 10);
        const seconds = durationInSeconds % 60;
        durationOfLesson = `${hours}:${minutes}:${seconds}`;
      }
      return durationOfLesson;
    }

    function setDurationOfLessons() {
      for (let i = 0; i < $('.editLessonRow').length; i++) {
        const durationOfLessonInSeconds = JSON.parse($('.editLessonRow')[i].dataset.lesson).durationInSeconds;
        $('.durationOfLesson')[i].textContent = getDurationOfLesson(durationOfLessonInSeconds);
      }
    }
    setDurationOfLessons();

    $('#adminSidebarButton').click((clickedButton) => {
      let clickedIconClass = clickedButton.currentTarget.childNodes[0].className;
      switch(clickedIconClass) {
        case 'profile-icon':
          clickedButton.currentTarget.childNodes[0].className = 'right-angle-icon';
        break;
        case 'right-angle-icon':
          clickedButton.currentTarget.childNodes[0].className = 'profile-icon';
        break;
      }
    });

    $('.editCourseButton').click((clickedButton) => {
      const courseButtonsWrapper = clickedButton.currentTarget.parentElement;
      const editCourseWrapper = courseButtonsWrapper.parentElement.nextElementSibling;
      const editCourseIcon = clickedButton.currentTarget.childNodes[0];
      if (editCourseWrapper.style.display === 'block') {
        editCourseWrapper.style.display = 'none';
        editCourseIcon.className = 'writing-pencil-icon';
      } else {
        editCourseWrapper.style.display = 'block';
        editCourseIcon.className = 'filled-pencil-icon';
      }
    });

    $('.editLessonIcon').click((clickedIcon) => {
      const editLessonIconsToolbar = clickedIcon.currentTarget.nextElementSibling;
      if (editLessonIconsToolbar.style.visibility === 'visible') {
        editLessonIconsToolbar.style.visibility = 'hidden';
      } else {
        editLessonIconsToolbar.style.visibility = 'visible';
      }
    });

    $('.editCourseDescriptionText').keyup(() => {
      for (let i = 0; i < $('.editCourseDescriptionText').length; i++) {
        $('.editCourseDescriptionCounter #remainingCharacters')[i].innerHTML =
          250 - parseInt($('.editCourseDescriptionText')[i].textLength, 10);
      }
    });

    for(let counter = 0; counter < $('.editCourseDescriptionText').length; counter++) {
      $('.editCourseDescriptionText')[counter].textContent 
      = JSON.parse($('.editCourseDescriptionText')[counter].dataset.courseauthoredbyuser).description;
    }

    $('.courseAuthoredByUser .course-stats-icon').hover((hoveredElement) => {
      hoveredElement.currentTarget.previousElementSibling.style.display = 'block';
    }, (hoveredElement) => {
      hoveredElement.currentTarget.previousElementSibling.style.display = 'none';
    });

    $('.archiveCourseButton #archive-icon').hover((hoveredElement) => {
      hoveredElement.currentTarget.parentElement.previousElementSibling.style.display = 'block';
    }, (hoveredElement) => {
      hoveredElement.currentTarget.parentElement.previousElementSibling.style.display = 'none';
    });

    $('.editCourseButton #edit-icon').hover((hoveredElement) => {
      hoveredElement.currentTarget.parentElement.previousElementSibling.style.display = 'block';
    }, (hoveredElement) => {
      hoveredElement.currentTarget.parentElement.previousElementSibling.style.display = 'none';
    });

    $('.manageCourseNav').click((tab) => {
      const tabTitle = tab.currentTarget.childNodes[1].textContent;
      if (tabTitle.toLowerCase().includes('analysis')) {
        $('#manageMyCoursesPage')[0].style.display = 'none';
        $('#createNewCourseContentPage')[0].style.display = 'none';
        $('#courseAnalysisPage')[0].style.display = 'block';
      } else if (tabTitle.toLowerCase().includes('content')) {
        $('#manageMyCoursesPage')[0].style.display = 'none';
        $('#createNewCourseContentPage')[0].style.display = 'block';
        $('#courseAnalysisPage')[0].style.display = 'none';
      } else {
        $('#manageMyCoursesPage')[0].style.display = 'block';
        $('#createNewCourseContentPage')[0].style.display = 'none';
        $('#courseAnalysisPage')[0].style.display = 'none';
      }
    });
    $('.courseAuthoredByUser')[0].style.borderTop = '2px solid white';
    $('.courseArchivedByUser')[0].style.borderTop = '2px solid white';
  }
}

window.controllers = window.controllers || {};
window.controllers.adminhomecontroller = AdminHomeController;
