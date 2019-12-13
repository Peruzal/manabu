class QuickStatsController extends Stimulus.Controller {
  connect() {
    getQuickStats();
    function getQuickStats() {
      $.ajax({
        url: `/admin/quickStats`,
        type: 'GET'
      })
      .done((quickStats) => {
        if($('.quick-stats-card').length === 0){
            $('#adminSidebarCards').append(`
            <div class="quick-stats-card" data-max_y_value="${quickStats.maximumYValue}"
              data-most_recent_courses_of_author="${quickStats.mostRecentCoursesOfAuthor}" data-map_of_amount_of_people_watching_a_course="${quickStats.mapOfAmountOfPeopleWatchingACourse}"
              data-number_of_people_who_completed_courses_for_every_course="${quickStats.numberOfPeopleWhoCompletedCoursesForEveryCourse}">
              <div class="quick-stats-heading">Quick stats</div>
              <div class="quick-stats-graph">
                  <div id="baseLine"></div>
                  <div id="firstQuartileLine"></div>
                  <div id="secondQuartileLine"></div>
                  <div id="thirdQuartileLine"></div>
                  <div id="topLine"></div>
              </div>
              <div class="x-axis">
              </div>
              <div class="y-axis">
                  <div id="y-value-max"></div>
                  <div id="y-value-third-quartile"></div>
                  <div id="y-value-second-quartile"></div>
                  <div id="y-value-first-quartile"></div>
                  <div id="y-value-min"></div>
              </div>
            </div>

          `);
        }

        const mostRecentCoursesOfAuthor = quickStats.mostRecentCoursesOfAuthor;
        const mapOfAmountOfPeopleWatchingACourse = quickStats.mapOfAmountOfPeopleWatchingACourse;
        const numberOfPeopleWhoCompletedCoursesForEveryCourse = quickStats.numberOfPeopleWhoCompletedCoursesForEveryCourse;
        $('#y-value-max')[0].textContent = quickStats.listOfYValues[4];
        $('#y-value-third-quartile')[0].textContent = quickStats.listOfYValues[3];
        $('#y-value-second-quartile')[0].textContent = quickStats.listOfYValues[2];
        $('#y-value-first-quartile')[0].textContent = quickStats.listOfYValues[1];
        $('#y-value-min')[0].textContent = quickStats.listOfYValues[0];

        if($('.bar-container').length === 0) {
          for (let i = 0; i < mostRecentCoursesOfAuthor.length; i++) {
            $('.quick-stats-graph').append(`
                <div class="bar-container">
                    <div class="tooltip-container" id="statsTooltip">
                        <div class="tooltip-stats">
                            <div id="totalWatchers">Watchers: &nbsp; ${mapOfAmountOfPeopleWatchingACourse[mostRecentCoursesOfAuthor[i].title]+numberOfPeopleWhoCompletedCoursesForEveryCourse[mostRecentCoursesOfAuthor[i].title]}</div>
                            <div id="totalWatchersKey"></div>
                            <div id="completed">Completed: &nbsp; ${numberOfPeopleWhoCompletedCoursesForEveryCourse[mostRecentCoursesOfAuthor[i].title]}</div>
                            <div id="completedKey"></div>
                            <div id="inProgress">In Progress: &nbsp; ${mapOfAmountOfPeopleWatchingACourse[mostRecentCoursesOfAuthor[i].title]}</div>
                            <div id="inProgressKey"></div>
                        </div>
                    </div>
                    <div class="bar-in-progress"></div>
                    <div class="bar-completed"></div>
                </div>          
            `);
  
            $('.x-axis').append(`
              <div class="course-images-in-x-axis"><img id="courseImageInHorizontalAxis"
              src="${mostRecentCoursesOfAuthor[i].image}" alt="/images/default.jpg">
            `);
            
            const watchingCoursesBarHeight = (mapOfAmountOfPeopleWatchingACourse[mostRecentCoursesOfAuthor[i].title] / quickStats.maximumYValue) * 128;
            document.getElementsByClassName('bar-in-progress')[i].style.height = `${watchingCoursesBarHeight}px`;
            const completedCoursesBarHeight = (numberOfPeopleWhoCompletedCoursesForEveryCourse[mostRecentCoursesOfAuthor[i].title] / quickStats.maximumYValue) * 128;
            const heightOfWatchingCoursesBar = document.getElementsByClassName('bar-in-progress')[i].getBoundingClientRect().height;
            document.getElementsByClassName('bar-completed')[i].style.height = `${completedCoursesBarHeight}px`;
            document.getElementsByClassName('bar-completed')[i].style.bottom = `${heightOfWatchingCoursesBar}px`;
          }
        }

        $('.bar-container').hover((bar) => {
          bar.currentTarget.firstElementChild.style.display = 'block';
        },
          (bar) => {
            bar.currentTarget.firstElementChild.style.display = 'none';
          });  
      })
      .fail(() => {
        console.dir('failed to send request');
      });
    }
  }
}

window.controllers = window.controllers || {};
window.controllers.quickStatsController = QuickStatsController;
