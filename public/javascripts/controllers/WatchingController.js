class WatchingController extends Stimulus.Controller {
  connect() {
    const durationOfCourse = document.getElementById('courseLength').textContent;
    document.getElementById('courseLength').innerHTML = durationOfCourse.replace(new RegExp('[0-9]', 'g'), '<span style="font-weight:900">$&</span>');

    let lessons = JSON.parse($('#courseAndLessonWrapper')[0].dataset.lessons);
    let lessonId = $('#courseAndLessonWrapper')[0].dataset.lessonId;

    for(let counter = 0; counter < lessons.length; counter++) {
      switch(lessons[counter].id) {
        case lessonId:
          const lessonNumber = counter + 1;
        $('span#lessonNumber')[0].textContent = ' lesson '+ lessonNumber +'/'+ lessons.length;
        break;
      }
    }
  }

  openSidebar() {
    const watchingPageWidthWhenSidebarOpen = (Number(document.getElementById('watchingPage').offsetWidth) - 296)/16;
    document.getElementById('sidebar').style.width = '20.25rem';
    document.getElementById('watchingPage').style.width = watchingPageWidthWhenSidebarOpen.toString() + 'rem';
    document.getElementById('sidebarButtonIcon').className = 'right-angle-icon';
  }

  closeSidebar() {
    document.getElementById('sidebar').style.width = '1.5rem';
    document.getElementById('watchingPage').style.width = '100%';
    document.getElementById('sidebarButtonIcon').className = 'profile-icon';
  }

  toggleSidebar() {
    const sidebarSize = document.getElementById('sidebar').style.width;
    if (sidebarSize === '20.25rem') {
      return this.closeSidebar();
    }
    return this.openSidebar();
  }
}

window.controllers = window.controllers || {};
window.controllers.watchingcontroller = WatchingController;
