class HomeSearchBarController extends Stimulus.Controller {
  connect() {
    const {
      titles_of_courses,
      map_of_course_id_and_title,
      map_of_first_lesson_id_and_course_title,
    } = this.element.dataset;
    this.titles_of_courses = titles_of_courses;
    this.map_of_course_id_and_title = map_of_course_id_and_title;
    this.map_of_first_lesson_id_and_course_title = map_of_first_lesson_id_and_course_title;
    const listOfCourseIdsAndTitles = JSON.parse(map_of_course_id_and_title);
    const listOfFirstLessonIdsAndCourseTitles = JSON.parse(map_of_first_lesson_id_and_course_title);
    const titlesOfCourses = JSON.parse(titles_of_courses);
    let resultPosition = 0;

    $('#searchForm').keyup((e) => {
      const searchWord = $('#searchForm')[0].value;
      if (e.which === 13) {
        if (titlesOfCourses.includes(searchWord)) {
          Turbolinks.visit(`/courses/watching/${listOfCourseIdsAndTitles[searchWord]}/${listOfFirstLessonIdsAndCourseTitles[searchWord]}`);
        }
      }
    });

    $('#searchForm').on('input', () => {
      resultPosition = 1;
    });

    $('#searchButton').click(() => {
      const searchWord = $('#searchForm')[0].value;
      if (titlesOfCourses.includes(searchWord)) {
        Turbolinks.visit(`/courses/watching/${listOfCourseIdsAndTitles[searchWord]}/${listOfFirstLessonIdsAndCourseTitles[searchWord]}`);
      }
    });

    $('#searchForm').keyup((e) => {
      const $searchResults = $('li.searchResult');
      const numberOfResults = $searchResults.length;
      if (e.which === 40) {
        resultPosition++;
        if (resultPosition > numberOfResults) {
          resultPosition = 1;
        }
      } else if (e.which === 38) {
        resultPosition--;
        if (resultPosition <= 0) {
          resultPosition = numberOfResults;
        }
      } else if (e.which === 39) {
        $('#searchForm')[0].value = $searchResults.eq(resultPosition - 1).text();
      } else if (e.which === 13) {
        $('#searchForm')[0].value = $searchResults.eq(resultPosition - 1).text();
      }
      $searchResults.eq(resultPosition - 1).addClass('selected');
    });
  }

  sortLessonProgresses() {
    $.ajax({
      url: `/continueWhereILeftOff`,
      type: 'GET',
  })
      .done((sortedLessonProgresses) => {
        console.log(sortedLessonProgresses);
        Turbolinks.visit(`/courses/watching/${sortedLessonProgresses.courseId}/${sortedLessonProgresses.lessonId}`);      
      })
      .fail(() => {
          console.error('Did not send request successfully');
      });
  }

  gotoLatestCourse() {
    $.ajax({
      url: `/getLatestCourse`,
      type: 'GET',
  })
      .done((course) => {
        Turbolinks.visit(`/courses/watching/${course.id}/${course.lessons[0].id}`);
      })
      .fail(() => {
          console.error('Did not send request successfully');
      });    
  }

  showPossibleSearchResults() {
    const {
      titles_tags_and_authors,
      titles_of_courses,
      map_of_course_id_and_title,
      map_of_first_lesson_id_and_course_title,
    } = this.element.dataset;
    this.titles_tags_and_authors = titles_tags_and_authors;
    this.titles_of_courses = titles_of_courses;
    this.map_of_course_id_and_title = map_of_course_id_and_title;
    this.map_of_first_lesson_id_and_course_title = map_of_first_lesson_id_and_course_title;
    const listOfCourseIdsAndTitles = JSON.parse(map_of_course_id_and_title);
    const listOfFirstLessonIdsAndCourseTitles = JSON.parse(map_of_first_lesson_id_and_course_title);
    const titlesOfCourses = JSON.parse(titles_of_courses);
    const searchList = JSON.parse(titles_tags_and_authors);
    const searchWord = document.getElementById('searchForm').value;
    let listOfResults = '';
    for (let i = 0; i < searchList.length; i++) {
      const filteredResults = [];
      if (searchWord === '' || !searchWord || searchWord.length === 0) {
        document.getElementById('searchAndButtonsWrapper').style.border = 'hidden';
        document.getElementById('searchAndButtonsWrapper').style.backgroundColor = '#ffffff';
        document.getElementById('searchAndButtonsWrapper').style.zIndex = '0';
        document.getElementById('results').style.display = 'none';
      } else if (searchWord.length === 1 || searchWord.length === 2) {
        document.getElementById('searchAndButtonsWrapper').style.border = '1px solid #888888';
        document.getElementById('searchAndButtonsWrapper').style.borderTop = 'none';
        document.getElementById('searchAndButtonsWrapper').style.backgroundColor = '#f5f5f5';
        document.getElementById('searchAndButtonsWrapper').style.zIndex = '1';
        document.getElementById('results').style.display = 'block';
        listOfResults = 'Search for a course using the name of a course, author, or tag...';
      } else if (searchList[i].toLowerCase().includes(searchWord.toLowerCase()) && searchWord.length > 2) {
        filteredResults.push(searchList[i]);
        if (filteredResults.length > 0) {
          for (let j = 0; j < filteredResults.length; j++) {
            if (titlesOfCourses.includes(filteredResults[j])) {
              const courseId = listOfCourseIdsAndTitles[filteredResults[j]];
              const lessonId = listOfFirstLessonIdsAndCourseTitles[filteredResults[j]];
              const url = `/courses/watching/${courseId}/${lessonId}`;
              listOfResults += `<li class='searchResult'><a href=${url} style="color: inherit">${filteredResults[j]}<br></a></li>`;
            } else {
              listOfResults += `<li class='searchResult'><a href="#" style="color: inherit">${filteredResults[j]}<br></a></li>`;
            }
          }
        } else {
          listOfResults += '<li class="searchResult"><a href="#" style="color: inherit">Result not found.<br></a></li>';
        }
      }
      document.getElementById('results').innerHTML = listOfResults;
    }
  }

  tryRandomCourse() {
    const {
      random_course,
      map_of_first_lesson_id_and_course_title,
    } = this.element.dataset;
    this.random_course = random_course;
    this.map_of_first_lesson_id_and_course_title = map_of_first_lesson_id_and_course_title;
    const randomCourse = JSON.parse(random_course);
    const listOfFirstLessonIdsAndCourseTitles = JSON.parse(map_of_first_lesson_id_and_course_title);
    const courseId = randomCourse.id;
    const lessonId = listOfFirstLessonIdsAndCourseTitles[randomCourse.title];

    Turbolinks.visit(`/courses/watching/${courseId}/${lessonId}`);
  }
}

window.controllers = window.controllers || {};
window.controllers.homeSearchBar = HomeSearchBarController;
