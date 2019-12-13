class HomeController extends Stimulus.Controller {
  alignCards() {
    if (document.getElementById('coursesContainer').children.length > 4) {
      document.getElementById('coursesContainer').style.justifyContent = 'flex-start';
      document.getElementById('leftArrowForCourses').style.visibility = 'visible';
      document.getElementById('rightArrowForCourses').style.visibility = 'visible';
    }
    if (document.getElementById('coursesContainer').children.length === 4 && document.getElementById('sidebar').style.width === '20.25rem') {
      document.getElementById('coursesContainer').style.justifyContent = 'flex-start';
      document.getElementById('leftArrowForCourses').style.visibility = 'visible';
      document.getElementById('rightArrowForCourses').style.visibility = 'visible';
    }
    if (document.getElementById('coursesContainer').children.length === 4 && document.getElementById('sidebar').style.width < '20.25rem') {
      document.getElementById('coursesContainer').style.justifyContent = 'flex-start';
      document.getElementById('leftArrowForCourses').style.visibility = 'hidden';
      document.getElementById('rightArrowForCourses').style.visibility = 'hidden';
    }
  }
  connect() {
    const {
      recommended_courses,
    } = this.element.dataset;
    this.recommended_courses = recommended_courses;
    const recommendedCourses = JSON.parse(recommended_courses);
    let filledStarsWidth = 0;
    let courseRating = 0;
    for (let i = 0; i < document.getElementsByClassName('stars-inner').length; i++) {
      courseRating = recommendedCourses[i].rating;
      filledStarsWidth = (courseRating / 5) * 100;
      document.getElementsByClassName('stars-inner')[i].style.width = filledStarsWidth + '%';
    }
    return this.alignCards();
  }
  openSidebar() {
    const upperSectionWidthWhenSidebarOpen = (Number(document.getElementById('upperSection').offsetWidth) - 296)/16;
    document.getElementById('sidebar').style.width = '20.25rem';
    document.getElementById('upperSection').style.width = upperSectionWidthWhenSidebarOpen.toString() + 'rem';
    document.getElementById('lowerSectionContainer').style.width = '64.85rem';
    document.getElementById('lowerSection').style.width = 'calc(100% - 21.75rem)';
    document.getElementById('sidebarButtonIcon').className = 'right-angle-icon';
    this.alignCards();
  }
  closeSidebar() {
    document.getElementById('sidebar').style.width = '1.5rem';
    document.getElementById('upperSection').style.width = '100%';
    document.getElementById('lowerSectionContainer').style.width = '86rem';
    document.getElementById('lowerSection').style.width = 'calc(100% - 1.5rem)';
    document.getElementById('sidebarButtonIcon').className = 'profile-icon';
    this.alignCards();
  }
  toggleSidebar() {
    const sidebarSize = document.getElementById('sidebar').style.width;
    if (sidebarSize === '20.25rem') {
      return this.closeSidebar();
    }
    return this.openSidebar();
  }

  showTooltip(element) {
    element.previousSibling.style.visibility = 'visible';
  }
  hideTooltip(element) {
    element.previousSibling.style.visibility = 'hidden';
  }
}

window.controllers = window.controllers || {};
window.controllers.homecontroller = HomeController;
