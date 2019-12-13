class AdminProfileCardController extends Stimulus.Controller {
  connect() {
    function setProfileCardTooltips() {
      $('.span.profileIcons .eye-icon-regular').mouseenter((icon) => {
        icon.currentTarget.parentElement.previousElementSibling.style.display = 'block';
      });

      $('.span.profileIcons .eye-icon-regular').mouseleave((icon) => {
        icon.currentTarget.parentElement.previousElementSibling.style.display = 'none';
      });

      $('.span.profileIcons .tick-in-circle').mouseenter((icon) => {
        icon.currentTarget.parentElement.previousElementSibling.style.display = 'block';
      });

      $('.span.profileIcons .tick-in-circle').mouseleave((icon) => {
        icon.currentTarget.parentElement.previousElementSibling.style.display = 'none';
      });

      $('.span.profileIcons .unfilled-star-icon').mouseenter((icon) => {
        icon.currentTarget.parentElement.previousElementSibling.style.display = 'block';
      });

      $('.span.profileIcons .unfilled-star-icon').mouseleave((icon) => {
        icon.currentTarget.parentElement.previousElementSibling.style.display = 'none';
      });
    }

    function getProfileStats() {
      $.ajax({
        url: '/admin/profile',
        type: 'GET',
      })
        .done((profileStats) => {
          if ($('.profileCard')[0].childElementCount === 0) {
            $('.profileCard').append(`
            <div class='profileMenu'></div>
            <div class='upperProfileCard'>
              <div class='profilePic'>
                <img id='adminProfilePic' src=${profileStats.user.image} alt='/images/default.jpg'>
              </div>
              <div class='profileName' id='adminName'>
                  ${profileStats.user.name} ${profileStats.user.surname}
              </div>
              <div class='adminRole'>
                  Course Administrator
              </div>
            </div>
            <div class='lowerProfileCard'>
                <div class='profileStats'>
                    <div class="currentCourses" id="createdCourses">
                        ${profileStats.numberOfPeopleWhoAreWatchingCoursesByThisAuthorInTwoDigitFormat}
                    </div>
                    <div class='tooltip-container tooltip-container-left' id='adminWatching'>
                      <div class='tooltip-message-text'> watching </div>
                    </div>
                    <div class="span profileIcons">
                        <div class="eye-icon-regular" id="adminWatchingIcon"></div>
                    </div>
                    <div class="completedCourses" id="numberOfPeopleCompleted">
                        ${profileStats.numberOfPeopleWhoCompletedCoursesByThisAuthorInTwoDigitFormat}
                    </div>
                    <div class='tooltip-container tooltip-container-left' id='adminWatched'>
                      <div class='tooltip-message-text'> watched </div>
                    </div>
                    <div class="span profileIcons">
                        <div class="tick-in-circle" id="adminWatchedIcon"></div>
                    </div>
                    <div class="favouriteCourses" id="adminWarning">
                        ${profileStats.numberOfFavouriteCoursesForAuthor}
                    </div>
                    <div class='tooltip-container tooltip-container-left' id='adminFavourites'>
                      <div class='tooltip-message-text'> favourites </div>
                    </div>
                    <div class="span profileIcons">
                        <div class="unfilled-star-icon" id="adminFavouriteIcon"></div>
                    </div>
                    </span>
                </div>
            </div>
            `)
              .ready(() => {
                setProfileCardTooltips();
              });
          }

        })
        .fail(() => {
          console.error('Something went wrong while sending request to get profile information');
        });
    }
    getProfileStats();
  }
}

window.controllers = window.controllers || {};
window.controllers.adminProfileCardController = AdminProfileCardController;
