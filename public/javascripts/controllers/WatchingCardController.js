class WatchingCardController extends Stimulus.Controller {
    connect() {
      hideDropdowns();
      for(var counter = 0; counter < $('.progress-bar').length; counter++){
        const numberOfCompletedLessons = $('.progress-bar')[counter].dataset.numberofcompletedlessons;
        const numberOfLessons = $('.progress-bar')[counter].dataset.numberoflessons;
        const percentageOfProgress = numberOfCompletedLessons/numberOfLessons*100;
        $('.progress-bar')[counter].style.width = percentageOfProgress+"%";
      }
      
      for(var counter = 0; counter < $('.watching-card-course-container').length; counter++){
        if(counter > 2){
          $('.watching-card-course-container')[counter].style.display = 'none';
          showCardDropdown(0);
        }
      }

      for(var counter = 0; counter < $('.watched-card-course').length; counter++){
        if(counter > 2){
          $('.watched-card-course')[counter].style.display = 'none';
          showCardDropdown(1);
        }
      }

      function hideDropdowns(){
        for(let counter = 0; counter < $('.dropdown-container').length; counter++){
          $('.dropdown-container')[counter].style.display = 'none';
        }
      }

      function showCardDropdown(index){
        $('.dropdown-container')[index].style.display = 'block';
      }

      $("#watching-triangle-icon").mouseenter(function(hoveredElement){
        if(hoveredElement.currentTarget.className == 'up-facing-triangle-icon'){
          hoveredElement.currentTarget.previousSibling.firstChild.textContent = 'Less';
          hoveredElement.currentTarget.previousSibling.style.visibility = 'visible';
        } else if(hoveredElement.currentTarget.className == 'down-facing-triangle-icon'){
          hoveredElement.currentTarget.previousSibling.firstChild.textContent = 'More';
          hoveredElement.currentTarget.previousSibling.style.visibility = 'visible';
        }
      });

      $("#watching-triangle-icon").mouseleave(function(hoveredElement){
        hoveredElement.currentTarget.previousSibling.style.visibility = 'hidden';
      });

      $("#watched-triangle-icon").mouseenter(function(hoveredElement){
        if(hoveredElement.currentTarget.className == 'up-facing-triangle-icon'){
          hoveredElement.currentTarget.previousSibling.firstChild.textContent = 'Less';
          hoveredElement.currentTarget.previousSibling.style.visibility = 'visible';
        } else if(hoveredElement.currentTarget.className == 'down-facing-triangle-icon'){
          hoveredElement.currentTarget.previousSibling.firstChild.textContent = 'More';
          hoveredElement.currentTarget.previousSibling.style.visibility = 'visible';
        }
      });

      $("#watched-triangle-icon").mouseleave(function(hoveredElement){
        hoveredElement.currentTarget.previousSibling.style.visibility = 'hidden';
      });

      $("#watching-triangle-icon").click(function(clickedElement){
        if(clickedElement.currentTarget.className == 'up-facing-triangle-icon'){
          for(var counter = 0; counter < $('.watching-card-course-container').length; counter++){
            if(counter > 2){
              $('.watching-card-course-container')[counter].style.display = 'none';
            }
          }
          clickedElement.currentTarget.className = 'down-facing-triangle-icon';
        } else if (clickedElement.currentTarget.className == 'down-facing-triangle-icon'){
          for(var counter = 0; counter < $('.watching-card-course-container').length; counter++){
            if(counter > 2){
              $('.watching-card-course-container')[counter].style.display = 'block';
            }
          }
          clickedElement.currentTarget.className = 'up-facing-triangle-icon';
        }
      });

      $("#watched-triangle-icon").click(function(clickedElement){
        if(clickedElement.currentTarget.className == 'up-facing-triangle-icon'){
          for(var counter = 0; counter < $('.watched-card-course').length; counter++){
            if(counter > 2){
              $('.watched-card-course')[counter].style.display = 'none';
            }
          }
          clickedElement.currentTarget.className = 'down-facing-triangle-icon';
        } else if (clickedElement.currentTarget.className == 'down-facing-triangle-icon'){
          for(var counter = 0; counter < $('.watched-card-course').length; counter++){
            if(counter > 2){
              $('.watched-card-course')[counter].style.display = 'block';
            }
          }
          clickedElement.currentTarget.className = 'up-facing-triangle-icon';
        }
      });
         
      $('.watching-card-course-container').mouseenter(function(hoveredElement){
        hoveredElement.currentTarget.childNodes[3].firstChild.style.backgroundColor = '#7acc91';
        hoveredElement.currentTarget.childNodes[0].style.display = 'block';
      });

      $('.watching-card-course-container').mouseleave(function(hoveredElement){
        hoveredElement.currentTarget.childNodes[3].firstChild.style.backgroundColor = '#80bbdb';
        hoveredElement.currentTarget.childNodes[0].style.display = 'none';
      });

      $('.watching-card-course-container').click((clickedCourse)=>{
        let courseId = clickedCourse.currentTarget.dataset.courseid;
        let lessonId = clickedCourse.currentTarget.dataset.lessonid;
        Turbolinks.visit(`/courses/watching/${courseId}/${lessonId}`);
      });

      $('.watched-card-course .star-icon-for-favourites').mouseenter((hoveredElement)=>{
        hoveredElement.currentTarget.previousSibling.style.display = 'block';
      });

      $('.watched-card-course .star-icon-for-favourites').mouseleave((hoveredElement)=>{
        hoveredElement.currentTarget.previousSibling.style.display = 'none';
      });

      $('.watched-card-course .placeholder-icon').mouseenter((hoveredElement)=>{
        hoveredElement.currentTarget.previousSibling.style.display = 'block';
      });

      $('.watched-card-course .placeholder-icon').mouseleave((hoveredElement)=>{
        hoveredElement.currentTarget.previousSibling.style.display = 'none';
      });

      $('.watched-card-course .cross-icon').mouseenter((hoveredElement)=>{
        hoveredElement.currentTarget.previousSibling.style.display = 'block';
      });

      $('.watched-card-course .cross-icon').mouseleave((hoveredElement)=>{
        hoveredElement.currentTarget.previousSibling.style.display = 'none';
      });
    }

}

window.controllers = window.controllers || {};
window.controllers.watchingCardController = WatchingCardController;